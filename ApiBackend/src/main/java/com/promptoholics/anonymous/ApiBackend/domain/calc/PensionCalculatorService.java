package com.promptoholics.anonymous.ApiBackend.domain.calc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

/**
 * Kalkulator emerytalny zgodny z najnowszym OpenAPI:
 * - KONTO i SUBKONTO liczone osobno (inne wskaźniki waloryzacji) i sumowane do kapitału,
 * - roczny limit podstawy (30-krotność) = 30 × prog. przeciętne wynagrodzenie miesięczne,
 * - tablice dalszego trwania życia (płeć × rok) z interpolacją (LifeTablesGUS),
 * - urealnienie do 2025, stopa zastąpienia, porównanie do średniej,
 * - warianty odroczenia 1/2/5, wynagrodzenie z/bez L4.
 */
public class PensionCalculatorService {

    private static final int BASE_YEAR_FOR_REAL = 2025;

    // Całkowita stopa E+R 19,52% – rozbijamy na konto i subkonto (parametryzowalne).
    private static final BigDecimal EMP_RATE_TOTAL       = new BigDecimal("0.1952");
    private static final BigDecimal EMP_RATE_TO_ACCOUNT  = new BigDecimal("0.1500"); // 15.00% -> KONTO
    private static final BigDecimal EMP_RATE_TO_SUBACCT  = EMP_RATE_TOTAL.subtract(EMP_RATE_TO_ACCOUNT); // reszta -> SUBKONTO

    private static final BigDecimal TWELVE  = new BigDecimal("12");
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    public static final BigDecimal SICK_M = new BigDecimal("0.020"); // edukacyjnie
    public static final BigDecimal SICK_F = new BigDecimal("0.030");

    private final ZUSMacroSeries macro     = new ZUSMacroSeries();
    private final LifeTablesGUS lifeTables = new LifeTablesGUS();

    /* ================== Główne wyliczenie ================== */
    public CalculationResult calculate(Input in) {
        // 1) Ścieżka płac (mies.) – skalowana tempem przeciętnego wynagrodzenia
        Map<Integer, BigDecimal> wagePath = wagePath(in.grossMonthly, BASE_YEAR_FOR_REAL, in.retYear);

        // 2) Baza roczna z 30× i z/bez L4
        BigDecimal sick = in.includeSick ? ("M".equalsIgnoreCase(in.sex) ? SICK_M : SICK_F) : BigDecimal.ZERO;
        Map<Integer, BigDecimal> baseExcl = annualBaseWithLimit(wagePath, BigDecimal.ZERO); // raportowe
        Map<Integer, BigDecimal> baseIncl = annualBaseWithLimit(wagePath, sick);            // naliczane

        // 3) Akumulacja – KONTO i SUBKONTO osobno
        BigDecimal initialAccount    = nvl(in.zusAccount);
        BigDecimal initialSubaccount = nvl(in.zusSubaccount);
        Accumulated acc = accumulateSplit(initialAccount, initialSubaccount, baseIncl);

        // 4) Annuitetyzacja – suma sald / (miesiące GUS) * 12
        int months = lifeTables.months(in.sex, in.retYear);
        BigDecimal totalCapital = acc.account.add(acc.subaccount);
        BigDecimal nominalAnnual = totalCapital
                .divide(new BigDecimal(months), 10, RoundingMode.HALF_UP)
                .multiply(TWELVE);

        // 5) Urealnienie do 2025 (proxy CPI 2,5% p.a.)
        BigDecimal real2025 = deflateTo2025(nominalAnnual, in.retYear);

        // 6) Stopa zastąpienia – vs roczne wynagrodzenie (bez L4)
        BigDecimal wageYearRet = wagePath.get(in.retYear).multiply(TWELVE);
        BigDecimal replacement = pct(nominalAnnual, wageYearRet);

        // 7) vs średnia emerytura (proxy: 50% przeciętnego wynagrodzenia * 12)
        BigDecimal avgBenefit = macro.averageMonthlyWage(in.retYear).multiply(new BigDecimal("0.50")).multiply(TWELVE);
        BigDecimal vsAvg = avgBenefit.signum() == 0 ? null :
                nominalAnnual.divide(avgBenefit, 6, RoundingMode.HALF_UP).subtract(BigDecimal.ONE).multiply(HUNDRED);

        // 8) Odroczenie +1/+2/+5
        Map<String, BigDecimal> postponed = new LinkedHashMap<>();
        for (int y : new int[]{1, 2, 5}) {
            postponed.put(String.valueOf(y), recomputeForYearSplit(in, in.retYear + y, wagePath, sick));
        }

        // 9) Wynagrodzenie mies. w roku przejścia – z/bez L4 (UI)
        BigDecimal wageMonthRet = wagePath.get(in.retYear);
        BigDecimal wageMonthRetIncl = wageMonthRet.multiply(BigDecimal.ONE.subtract(sick));

        return new CalculationResult(
                Instant.now(),
                in.retYear,
                nominalAnnual, real2025, replacement, vsAvg,
                wageMonthRetIncl, wageMonthRet,
                postponed,
                acc.account, acc.subaccount
        );
    }

    /* ================== Składniki obliczeń ================== */

    /** Ścieżka płac (mies.) skalowana tempem przeciętnego wynagrodzenia. */
    private Map<Integer, BigDecimal> wagePath(BigDecimal todayMonth, int fromYear, int toYear) {
        Map<Integer, BigDecimal> map = new HashMap<>();
        map.put(fromYear, todayMonth);
        for (int y = fromYear + 1; y <= toYear; y++) {
            BigDecimal prev = map.get(y - 1);
            BigDecimal growth = macro.averageMonthlyWage(y).divide(macro.averageMonthlyWage(y - 1), 10, RoundingMode.HALF_UP);
            map.put(y, prev.multiply(growth));
        }
        return map;
    }

    /**
     * Baza roczna z limitem 30× prognozowanego przeciętnego wynagrodzenia miesięcznego.
     * roczna_podstawa = min( (miesięczna_wypłata * 12 * (1 - sick)), 30 × prog. przeciętne wynagrodzenie mies. )
     */
    private Map<Integer, BigDecimal> annualBaseWithLimit(Map<Integer, BigDecimal> wagePathMonthly, BigDecimal sick) {
        Map<Integer, BigDecimal> out = new HashMap<>();
        for (Map.Entry<Integer, BigDecimal> e : wagePathMonthly.entrySet()) {
            int year = e.getKey();
            BigDecimal annualGross = e.getValue().multiply(TWELVE).multiply(BigDecimal.ONE.subtract(sick));
            BigDecimal annualCap = macro.limit30k(year); // poprawna trzydziestokrotność
            out.put(year, annualGross.min(annualCap));
        }
        return out;
    }

    /**
     * Akumulacja rozdzielona: KONTO vs SUBKONTO (różne wskaźniki waloryzacji).
     */
    private Accumulated accumulateSplit(BigDecimal initialAccount, BigDecimal initialSubaccount,
                                        Map<Integer, BigDecimal> annualBase) {
        BigDecimal accAccount    = nvl(initialAccount);
        BigDecimal accSubaccount = nvl(initialSubaccount);

        List<Integer> years = new ArrayList<>(annualBase.keySet());
        Collections.sort(years);
        for (Integer y : years) {
            BigDecimal base = annualBase.get(y);

            BigDecimal contribAccount = base.multiply(EMP_RATE_TO_ACCOUNT);
            BigDecimal contribSubacct = base.multiply(EMP_RATE_TO_SUBACCT);

            accAccount    = accAccount.add(contribAccount);
            accSubaccount = accSubaccount.add(contribSubacct);

            accAccount    = accAccount.multiply(macro.accountIndexFactor(y));
            accSubaccount = accSubaccount.multiply(macro.subaccountIndexFactorYear(y));
        }
        return new Accumulated(accAccount, accSubaccount);
    }

    /** Urealnienie do 2025 – proxy CPI 2,5% p.a. (podmień na oficjalny CPI GUS). */
    private BigDecimal deflateTo2025(BigDecimal nominalAnnual, int retYear) {
        if (retYear <= BASE_YEAR_FOR_REAL) return nominalAnnual;
        BigDecimal factor = BigDecimal.ONE;
        for (int y = BASE_YEAR_FOR_REAL + 1; y <= retYear; y++) factor = factor.multiply(new BigDecimal("1.025"));
        return nominalAnnual.divide(factor, 10, RoundingMode.HALF_UP);
    }

    /** Pełne przeliczenie „co jeśli” z rozbiciem konta/subkonta i nowym life-divisorem. */
    private BigDecimal recomputeForYearSplit(Input in, int newYear, Map<Integer, BigDecimal> wagePath, BigDecimal sick) {
        Map<Integer, BigDecimal> trimmed = new HashMap<>();
        for (Map.Entry<Integer, BigDecimal> e : wagePath.entrySet()) if (e.getKey() <= newYear) trimmed.put(e.getKey(), e.getValue());

        Map<Integer, BigDecimal> baseIncl = annualBaseWithLimit(trimmed, sick);
        Accumulated acc = accumulateSplit(nvl(in.zusAccount), nvl(in.zusSubaccount), baseIncl);

        int months = lifeTables.months(in.sex, newYear);
        BigDecimal totalCapital = acc.account.add(acc.subaccount);
        return totalCapital.divide(new BigDecimal(months), 10, RoundingMode.HALF_UP).multiply(TWELVE);
    }



    /* ================== Utils / IO ================== */
    private static BigDecimal nvl(BigDecimal x) { return x == null ? BigDecimal.ZERO : x; }
    private static BigDecimal pct(BigDecimal a, BigDecimal b) {
        if (b == null || b.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return a.divide(b, 6, RoundingMode.HALF_UP).multiply(HUNDRED);
    }

    /** Para sald (konto/subkonto). */
    private record Accumulated(BigDecimal account, BigDecimal subaccount) {}

    /* ======= I/O dla serwisu (niezależne od DTO) ======= */
    public record Input(
            BigDecimal expected,
            int age,
            String sex,                 // "M" / "F"
            BigDecimal grossMonthly,    // wyn. brutto mies. (rok bazowy 2025)
            int startYear,
            int retYear,                // planowany rok zakończenia aktywności
            boolean includeSick,
            BigDecimal zusAccount,      // saldo startowe KONTA (opcjonalne)
            BigDecimal zusSubaccount,   // saldo startowe SUBKONTA (opcjonalne)
            String postal
    ) {}

    public record CalculationResult(
            Instant requestedAt,
            int retirementYear,
            BigDecimal actualAnnual,
            BigDecimal realAnnual2025,
            BigDecimal replacementPct,
            BigDecimal vsAvgPct,
            BigDecimal wageInclSickMonthly,
            BigDecimal wageExclSickMonthly,
            Map<String, BigDecimal> postponed,
            BigDecimal accountBalance,
            BigDecimal subaccountBalance
    ) {}
}
