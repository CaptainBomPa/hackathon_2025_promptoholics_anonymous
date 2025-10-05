package com.promptoholics.anonymous.ApiBackend.domain.calc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

/**
 * Nowy kalkulator emerytalny - wersja 2.0
 *
 * Kluczowe założenia:
 * - System kapitałowy (konto + subkonto)
 * - Składki: 19.52% (konto 15.0% + subkonto 4.52%)
 * - Waloryzacja: konto roczna, subkonto kwartalna
 * - Annuitetyzacja: kapitał / oczekiwana długość życia
 * - B2B: minimalna składka dobrowolna z podstawy 4500 PLN (minimalna krajowa)
 */
public class PensionCalculatorV2 {

    private static final BigDecimal CONTRIBUTION_RATE_TOTAL = new BigDecimal("0.1952");
    private static final BigDecimal CONTRIBUTION_TO_ACCOUNT = new BigDecimal("0.1500");
    private static final BigDecimal CONTRIBUTION_TO_SUBACCOUNT = new BigDecimal("0.0452");

    // Minimaln podstawa wynagrodzenia dla składek dobrowolnych (B2B)
    private static final BigDecimal MINIMAL_WAGE_BASE = new BigDecimal("4500");

    // Średnie dni chorobowe rocznie
    private static final BigDecimal SICK_DAYS_M = new BigDecimal("5");  // ~5 dni/rok dla mężczyzn
    private static final BigDecimal SICK_DAYS_F = new BigDecimal("7");  // ~7 dni/rok dla kobiet
    private static final BigDecimal WORKING_DAYS_YEAR = new BigDecimal("250");

    private static final int BASE_YEAR = 2025;
    private static final BigDecimal CPI_ANNUAL = new BigDecimal("0.025"); // 2.5% inflacji

    private final ZUSMacroSeries macro = new ZUSMacroSeries();
    private final LifeTablesGUS life = new LifeTablesGUS();

    public record Input(
        BigDecimal expectedPensionMonthly,
        int age,
        String sex,
        BigDecimal grossSalaryMonthly,
        int startYear,
        int plannedEndYear,
        boolean includeSickLeave,
        BigDecimal zusAccountFunds,
        String postalCode,
        Integer additionalSickDaysPerYear,
        List<WorkBreak> workBreaks,
        ContractType contractType
    ) {}

    public record Output(
        Instant requestedAt,
        int retirementYear,
        BigDecimal actualMonthlyPension,        // nominalna miesięczna w roku emerytalnym
        BigDecimal realMonthlyPension2025,      // realna miesięczna w cenach 2025
        BigDecimal replacementRatePct,          // stopa zastąpienia
        BigDecimal vsAveragePct,                // vs średnia emerytura
        BigDecimal wageInclSickMonthly,         // wynagrodzenie z chorobowym
        BigDecimal wageExclSickMonthly,         // wynagrodzenie bez chorobowego
        Map<Integer, BigDecimal> postponedPensions,  // odroczone emerytury
        Map<Integer, BigDecimal> zusAccountByYear   // konto ZUS po latach
    ) {}

    public record WorkBreak(int startYear, int endYear) {}

    public enum ContractType {
        UMOWA_O_PRACE,
        UMOWA_ZLECENIE,
        B2B,
        UMOWA_O_DZIELO
    }

    public Output calculate(Input input) {
        // 1. Ustal lata składkowe
        int workYears = input.plannedEndYear - input.startYear;

        // 2. Oblicz redukcję z chorobowych
        BigDecimal sickReduction = calculateSickReduction(input);

        // 3. Buduj ścieżkę wynagrodzeń (miesięcznie)
        Map<Integer, BigDecimal> wagesByYear = buildWagePath(
            input.grossSalaryMonthly,
            input.startYear,
            input.plannedEndYear
        );

        // 4. Buduj roczne podstawy składek (z limitami)
        Map<Integer, BigDecimal> contributionBases = buildContributionBases(
            wagesByYear,
            sickReduction,
            input.contractType,
            input.workBreaks
        );

        // 5. Akumuluj kapitał (konto + subkonto)
        CapitalAccumulation capital = accumulateCapital(
            nvl(input.zusAccountFunds),
            contributionBases,
            input.contractType,
            input.startYear,
            input.plannedEndYear
        );

        // 6. Annuitetyzacja - oblicz miesięczną emeryturę
        int lifeExpectancyMonths = life.months(input.sex, input.plannedEndYear);
        BigDecimal totalCapital = capital.account.add(capital.subaccount);
        BigDecimal monthlyPension = totalCapital.divide(
            new BigDecimal(lifeExpectancyMonths),
            10,
            RoundingMode.HALF_UP
        );

        // 7. Deflacja do 2025
        BigDecimal realPension2025 = deflate(monthlyPension, input.plannedEndYear);

        // 8. Wynagrodzenie w roku emerytalnym
        BigDecimal finalWageExcl = wagesByYear.get(input.plannedEndYear);
        BigDecimal finalWageIncl = finalWageExcl.multiply(BigDecimal.ONE.subtract(sickReduction));

        // 9. Stopa zastąpienia (replacement rate)
        BigDecimal replacementRate = monthlyPension
            .divide(finalWageIncl, 6, RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"));

        // 10. Porównanie ze średnią emeryturą (50% przeciętnego)
        BigDecimal avgWage = macro.averageMonthlyWage(input.plannedEndYear);
        BigDecimal avgPension = avgWage.multiply(new BigDecimal("0.50"));
        BigDecimal vsAverage = monthlyPension
            .subtract(avgPension)
            .divide(avgPension, 6, RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"));

        // 11. Emerytury odroczone (+1, +2, +5 lat)
        Map<Integer, BigDecimal> postponed = new LinkedHashMap<>();
        for (int years : new int[]{1, 2, 5}) {
            postponed.put(years, calculatePostponed(
                input,
                capital,
                wagesByYear,
                sickReduction,
                years
            ));
        }

        // 12. Konto ZUS po latach (dla wykresu)
        Map<Integer, BigDecimal> accountByYear = capital.accountByYear;

        return new Output(
            Instant.now(),
            input.plannedEndYear,
            monthlyPension,
            realPension2025,
            replacementRate,
            vsAverage,
            finalWageIncl,
            finalWageExcl,
            postponed,
            accountByYear
        );
    }

    /**
     * Oblicz redukcję wynagrodzenia z chorobowych
     */
    private BigDecimal calculateSickReduction(Input input) {
        if (!input.includeSickLeave) {
            return BigDecimal.ZERO;
        }

        BigDecimal baseSickDays = "M".equalsIgnoreCase(input.sex) ? SICK_DAYS_M : SICK_DAYS_F;
        BigDecimal additionalDays = input.additionalSickDaysPerYear != null
            ? new BigDecimal(input.additionalSickDaysPerYear)
            : BigDecimal.ZERO;

        BigDecimal totalSickDays = baseSickDays.add(additionalDays);
        return totalSickDays.divide(WORKING_DAYS_YEAR, 6, RoundingMode.HALF_UP);
    }

    /**
     * Buduj ścieżkę wynagrodzeń miesięcznych od startYear do endYear
     */
    private Map<Integer, BigDecimal> buildWagePath(
        BigDecimal currentSalary,
        int startYear,
        int endYear
    ) {
        Map<Integer, BigDecimal> wages = new HashMap<>();
        wages.put(startYear, currentSalary);

        for (int year = startYear + 1; year <= endYear; year++) {
            BigDecimal prevWage = wages.get(year - 1);
            BigDecimal growthFactor = macro.averageMonthlyWage(year)
                .divide(macro.averageMonthlyWage(year - 1), 10, RoundingMode.HALF_UP);
            wages.put(year, prevWage.multiply(growthFactor));
        }

        return wages;
    }

    /**
     * Buduj roczne podstawy składek z uwzględnieniem limitów i przerw
     */
    private Map<Integer, BigDecimal> buildContributionBases(
        Map<Integer, BigDecimal> wagesByYear,
        BigDecimal sickReduction,
        ContractType contractType,
        List<WorkBreak> workBreaks
    ) {
        Map<Integer, BigDecimal> bases = new HashMap<>();

        for (var entry : wagesByYear.entrySet()) {
            int year = entry.getKey();
            BigDecimal monthlyWage = entry.getValue();

            // Sprawdź czy to przerwa w pracy
            if (isInBreak(year, workBreaks)) {
                bases.put(year, BigDecimal.ZERO);
                continue;
            }

            // Roczna podstawa
            BigDecimal annualBase = monthlyWage
                .multiply(new BigDecimal("12"))
                .multiply(BigDecimal.ONE.subtract(sickReduction));

            // Dla B2B - minimalna podstawa
            if (contractType == ContractType.B2B) {
                BigDecimal minimalAnnual = MINIMAL_WAGE_BASE.multiply(new BigDecimal("12"));
                annualBase = minimalAnnual; // B2B płaci z minimalnej
            }

            // Dla umowy o dzieło - brak składek
            if (contractType == ContractType.UMOWA_O_DZIELO) {
                bases.put(year, BigDecimal.ZERO);
                continue;
            }

            // Limit 30-krotności
            BigDecimal limit = macro.limit30k(year);
            annualBase = annualBase.min(limit);

            bases.put(year, annualBase);
        }

        return bases;
    }

    /**
     * Sprawdź czy rok jest w przerwie
     */
    private boolean isInBreak(int year, List<WorkBreak> breaks) {
        if (breaks == null) return false;
        return breaks.stream()
            .anyMatch(b -> year >= b.startYear && year <= b.endYear);
    }

    /**
     * Akumulacja kapitału z waloryzacją
     */
    private record CapitalAccumulation(
        BigDecimal account,
        BigDecimal subaccount,
        Map<Integer, BigDecimal> accountByYear
    ) {}

    private CapitalAccumulation accumulateCapital(
        BigDecimal initialAccount,
        Map<Integer, BigDecimal> bases,
        ContractType contractType,
        int startYear,
        int endYear
    ) {
        BigDecimal account = initialAccount;
        BigDecimal subaccount = BigDecimal.ZERO;
        Map<Integer, BigDecimal> accountByYear = new TreeMap<>();

        // Składki zależne od typu umowy
        BigDecimal rateAccount = CONTRIBUTION_TO_ACCOUNT;
        BigDecimal rateSubaccount = CONTRIBUTION_TO_SUBACCOUNT;

        if (contractType == ContractType.B2B) {
            // B2B płaci dobrowolnie pełne 19.52%
            rateAccount = CONTRIBUTION_TO_ACCOUNT;
            rateSubaccount = CONTRIBUTION_TO_SUBACCOUNT;
        }

        List<Integer> years = new ArrayList<>(bases.keySet());
        Collections.sort(years);

        for (int year : years) {
            BigDecimal base = bases.get(year);

            // Dodaj składki
            account = account.add(base.multiply(rateAccount));
            subaccount = subaccount.add(base.multiply(rateSubaccount));

            // Waloryzacja
            account = account.multiply(macro.accountIndexFactor(year));
            subaccount = subaccount.multiply(macro.subaccountIndexFactorYear(year));

            // Zapisz stan konta
            accountByYear.put(year, account.add(subaccount));
        }

        return new CapitalAccumulation(account, subaccount, accountByYear);
    }

    /**
     * Oblicz emeryturę odroczoną o X lat
     */
    private BigDecimal calculatePostponed(
        Input input,
        CapitalAccumulation baseCapital,
        Map<Integer, BigDecimal> wages,
        BigDecimal sickReduction,
        int additionalYears
    ) {
        int newRetirementYear = input.plannedEndYear + additionalYears;

        // Rozbuduj ścieżkę wynagrodzeń
        Map<Integer, BigDecimal> extendedWages = new HashMap<>(wages);
        for (int year = input.plannedEndYear + 1; year <= newRetirementYear; year++) {
            BigDecimal prevWage = extendedWages.get(year - 1);
            BigDecimal growthFactor = macro.averageMonthlyWage(year)
                .divide(macro.averageMonthlyWage(year - 1), 10, RoundingMode.HALF_UP);
            extendedWages.put(year, prevWage.multiply(growthFactor));
        }

        // Dodatkowe podstawy składek
        Map<Integer, BigDecimal> additionalBases = new HashMap<>();
        for (int year = input.plannedEndYear + 1; year <= newRetirementYear; year++) {
            BigDecimal monthlyWage = extendedWages.get(year);
            BigDecimal annualBase = monthlyWage
                .multiply(new BigDecimal("12"))
                .multiply(BigDecimal.ONE.subtract(sickReduction));

            if (input.contractType == ContractType.B2B) {
                annualBase = MINIMAL_WAGE_BASE.multiply(new BigDecimal("12"));
            }

            if (input.contractType == ContractType.UMOWA_O_DZIELO) {
                annualBase = BigDecimal.ZERO;
            }

            BigDecimal limit = macro.limit30k(year);
            annualBase = annualBase.min(limit);
            additionalBases.put(year, annualBase);
        }

        // Akumuluj dodatkowy kapitał
        BigDecimal account = baseCapital.account;
        BigDecimal subaccount = baseCapital.subaccount;

        for (int year = input.plannedEndYear + 1; year <= newRetirementYear; year++) {
            BigDecimal base = additionalBases.get(year);
            account = account.add(base.multiply(CONTRIBUTION_TO_ACCOUNT));
            subaccount = subaccount.add(base.multiply(CONTRIBUTION_TO_SUBACCOUNT));

            account = account.multiply(macro.accountIndexFactor(year));
            subaccount = subaccount.multiply(macro.subaccountIndexFactorYear(year));
        }

        // Annuitetyzacja
        int lifeMonths = life.months(input.sex, newRetirementYear);
        BigDecimal total = account.add(subaccount);
        return total.divide(new BigDecimal(lifeMonths), 10, RoundingMode.HALF_UP);
    }

    /**
     * Deflacja do roku bazowego 2025
     */
    private BigDecimal deflate(BigDecimal nominal, int year) {
        if (year <= BASE_YEAR) return nominal;

        BigDecimal inflator = BigDecimal.ONE;
        for (int y = BASE_YEAR + 1; y <= year; y++) {
            inflator = inflator.multiply(BigDecimal.ONE.add(CPI_ANNUAL));
        }

        return nominal.divide(inflator, 10, RoundingMode.HALF_UP);
    }

    private static BigDecimal nvl(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }
}
