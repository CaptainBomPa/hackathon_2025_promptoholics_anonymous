package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationEntity;
import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationRepository;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.*;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CalculationFacadeV3 {

    private final PensionCalculationRepository pensionCalculationRepository;

    private static final double EFFECTIVE_PENSION_CONTRIB_RATE = 0.19250; // 12% podstawy składek
    private static final int WORKING_DAYS_PER_YEAR = 252;                // ~dni robocze

    // Domyślna liczba dni chorobowych wg płci – dla różnicowania wariantów "Incl" vs "Excl"
    private static final int DEFAULT_SICK_DAYS_F = 24;
    private static final int DEFAULT_SICK_DAYS_M = 15;

    // Fallback dla średniej emerytury (do podmiany danymi)
    private static final int AVG_PENSION_BASE_YEAR = 2023;
    private static final double AVG_PENSION_BASE_YEAR_AMOUNT = 3500.0; // PLN/mies.

    // Udział realnego wzrostu płac w indeksacji konta (CPI + alpha * real)
    private static final double ACCOUNT_INDEXATION_REAL_SHARE = 1;

    private final MacroPaths macro = new MacroPaths();
    private final LifeTables life = new LifeTables();

    public PensionCalculationResponseDto calculatePensions(PensionCalculationRequestDto req) {
        Objects.requireNonNull(req, "Request cannot be null");
        validate(req);

        int currentYear = LocalDate.now().getYear();
        int startYear = req.getStartYear();
        int retireYear = req.getPlannedEndYear();
        int yearsToRetire = Math.max(0, retireYear - currentYear);

        boolean includeSick = Boolean.TRUE.equals(req.getIncludeSickLeave());

        // Parametry zależne od typu umowy
        ContractParams contract = resolveContractParams(req.getContractType());

        // Dni chorobowe: bazowe wg płci + dodatkowe
        int baseSickDaysBySex = (req.getSex() == PensionCalculationRequestDto.SexEnum.F)
                ? DEFAULT_SICK_DAYS_F : DEFAULT_SICK_DAYS_M;
        int extraSickDays = Optional.ofNullable(req.getAdditionalSickLeaveDaysPerYear()).orElse(0);
        int totalSickDaysForIncl = contract.sickEligible ? Math.max(0, baseSickDaysBySex + extraSickDays) : 0;

        // Miesięczna płaca W ROKU BIEŻĄCYM (grossSalaryPLN to płaca TERAZ)
        double monthlyGrossCurrent = asDouble(req.getGrossSalaryPLN());

        // === 1) BUDUJEMY ŚCIEŻKĘ ROCZNĄ bazową od startYear do retireYear, zakotwiczoną w currentYear ===
        Map<Integer, Double> baseMonthlyByYearExcl = buildYearlyBaseline(
                startYear, currentYear, retireYear, monthlyGrossCurrent
        );

        // Wariant "Incl" – współczynnik chorobowy (jeśli umowa daje prawo do chorobowego)
        double sickFactor = sickAdjustmentFactor(totalSickDaysForIncl, contract.sickReplacementRate);
        Map<Integer, Double> baseMonthlyByYearIncl = new LinkedHashMap<>();
        for (int y = startYear; y <= retireYear; y++) {
            double v = baseMonthlyByYearExcl.get(y);
            baseMonthlyByYearIncl.put(y, round2(contract.sickEligible ? v * sickFactor : v));
        }

        // === 2) ROZWINIĘCIE NA SIATKĘ MIESIĘCZNĄ (YearMonth) ===
        Map<YearMonth, Double> monthlyExcl = new LinkedHashMap<>();
        Map<YearMonth, Double> monthlyIncl = new LinkedHashMap<>();
        for (int y = startYear; y <= retireYear; y++) {
            for (int m = 1; m <= 12; m++) {
                YearMonth ym = YearMonth.of(y, m);
                monthlyExcl.put(ym, baseMonthlyByYearExcl.get(y));
                monthlyIncl.put(ym, baseMonthlyByYearIncl.get(y));
            }
        }

        // === 3) OVERRIDES: additionalSalaryChanges (BREAK/WORK z datami i pensją) ===
        List<ChangeSpan> changes = parseChanges(req.getAdditionalSalaryChanges());
        applyChangesToMonthlyGrid(changes, monthlyExcl, monthlyIncl, startYear, retireYear,
                contract.sickEligible, sickFactor);

        // === 4) WYZNACZ PUNKT STARTU AKUMULACJI (snapshot środków z ZUS minimalizuje podwajanie historii) ===
        boolean hasSnapshotFunds = req.getZusAccountFundsPLN() != null && req.getZusAccountFundsPLN().isPresent();
        double startingFunds = hasSnapshotFunds ? req.getZusAccountFundsPLN().get() : 0.0;
        int accumulationStartYear = hasSnapshotFunds ? currentYear : startYear;

        // === 5) POLICZ DWA SCENARIUSZE PULI I EMERYTURY: EXCL i INCL (od accumulationStartYear) ===
        AccumResult accExcl = accumulateFromMonthly(accumulationStartYear, retireYear, startingFunds,
                monthlyExcl, contract.pensionBaseFactor);
        AccumResult accIncl = accumulateFromMonthly(accumulationStartYear, retireYear, startingFunds,
                monthlyIncl, contract.pensionBaseFactor);

        // Miesięczna emerytura nominalna (obie wersje)
        int ageAtRetirement = req.getAge() + yearsToRetire;
        double payoutYears = life.annuityDivisor(ageAtRetirement, req.getSex()); // w latach
        double monthlyPensionNominalExcl = (accExcl.pot / Math.max(1e-9, payoutYears)) / 12.0;
        double monthlyPensionNominalIncl = (accIncl.pot / Math.max(1e-9, payoutYears)) / 12.0;

        // Wybór scenariusza „actual” zgodnie z flagą includeSickLeave
        double monthlyPensionNominalActual = includeSick ? monthlyPensionNominalIncl : monthlyPensionNominalExcl;
        List<PensionCalculationResponseResultZusAccountFundsByYearInnerDto> potTimelineActual =
                includeSick ? accIncl.timeline : accExcl.timeline;

        // Urealnienie do „dzisiejszych płac” – deflator po ścieżce NOMINALNEGO wzrostu wynagrodzeń
        double wageDeflatorToToday = macro.deflatorByNominalWage(retireYear, currentYear);
        double monthlyPensionRealToday = monthlyPensionNominalActual / Math.max(1e-9, wageDeflatorToToday);

        // Replacement rate – miesięczna emerytura (actual) / miesięczna płaca bez chorobowego w roku przejścia
        double wageRetExcl = baseMonthlyByYearExcl.get(retireYear);
        double replacementRatePct = monthlyPensionNominalActual / Math.max(1e-9, wageRetExcl) * 100.0;

        // Relacja do średniej emerytury (miesięcznej) w roku przejścia
        double avgPensionInYearMonthly = macro.projectAveragePension(retireYear);
        double vsAvgPct = monthlyPensionNominalActual / Math.max(1e-9, avgPensionInYearMonthly) * 100.0;

        // === 6) salaryByYear (salaryProjection): od ROKU BIEŻĄCEGO do retireYear ===
        Map<YearMonth, Double> monthlyChosen = includeSick ? monthlyIncl : monthlyExcl;
        List<PensionCalculationResponseResultSalaryProjectionInnerDto> salaryByYearList =
                buildSalaryByYearList(monthlyChosen, currentYear, retireYear); // <-- START OD currentYear

        // Scenariusz odroczenia – licz na bazie „actual”
        List<PensionCalculationResponseResultIfPostponedYearsInnerDto> postponed = new ArrayList<>();
        if (req.getAdditionalWorkYears() != null && req.getAdditionalWorkYears().isPresent()) {
            int add = Math.max(0, req.getAdditionalWorkYears().get());
            if (add > 0) {
                var alt = new PensionCalculationResponseResultIfPostponedYearsInnerDto();
                alt.setPostponedByYears(add);
                double potAtBase = includeSick ? accIncl.pot : accExcl.pot;
                double postponedMonthly = simulatePostponementMonthly(
                        req, add, monthlyChosen, retireYear, potAtBase, contract
                );
                alt.setActualAmountPLN((float) round2(postponedMonthly));
                postponed.add(alt);
            }
        }

        // Oczekiwania użytkownika – zakładamy wartości MIESIĘCZNE (nominal)
        var meets = new PensionCalculationResponseResultMeetsExpectationDto();
        Float expected = req.getExpectedPensionPLN();
        if (expected != null) {
            boolean isMet = monthlyPensionNominalActual + 1e-6 >= expected;
            meets.setIsMet(isMet);
            if (!isMet) {
                meets.setShortfallPLN(JsonNullable.of((float) round2(expected - monthlyPensionNominalActual)));
                int extraYears = estimateExtraYearsToMeetMonthly(
                        req, monthlyChosen, retireYear, includeSick ? accIncl.pot : accExcl.pot, expected, contract
                );
                meets.setExtraYearsRequiredEstimate(JsonNullable.of(extraYears));
            }
        } else {
            meets.setIsMet(null);
        }

        var entity = new PensionCalculationEntity();
        var id = UUID.randomUUID();
        entity.setPostalCode(req.getPostalCode().orElse(""));
        entity.setId(id);
        entity.setAge(req.getAge());
        entity.setActualPension(round2(monthlyPensionNominalActual));
        entity.setExpectedPension(req.getExpectedPensionPLN());
        entity.setGender(req.getSex().getValue());
        entity.setAccumulatedFundsTotal(Double.valueOf(req.getZusAccountFundsPLN().orElse((float) 0)));
        entity.setIncludedSicknessPeriods(req.getIncludeSickLeave());
        entity.setInflationAdjustedPension(round2(monthlyPensionRealToday));
        entity.setSalaryAmount(req.getGrossSalaryPLN());
        pensionCalculationRepository.saveAndFlush(entity);

        // Budowa odpowiedzi
        PensionCalculationResponseResultDto result = new PensionCalculationResponseResultDto();

        // actual = miesięczna emerytura (nominal) zgodna z flagą includeSickLeave
        result.setActualAmountPLN((float) round2(monthlyPensionNominalActual));
        result.setRealAmountDeflated((float) round2(monthlyPensionRealToday));

        // „wage*” = miesięczna emerytura z/bez chorobowego
        result.setWageInclSickLeavePLN((float) round2(monthlyPensionNominalIncl));
        result.setWageExclSickLeavePLN((float) round2(monthlyPensionNominalExcl));

        // Dodatkowe metryki
        result.setReplacementRatePct((float) round2(replacementRatePct));
        result.setVsAverageInRetirementYearPct((float) round2(vsAvgPct));
        result.setIfPostponedYears(postponed);
        result.setMeetsExpectation(meets);

        // Timelines
        result.setZusAccountFundsByYear(potTimelineActual);               // „actual” pot timeline
        result.setSalaryProjection(salaryByYearList);                         // salaryProjection: od currentYear

        PensionCalculationResponseDto response = new PensionCalculationResponseDto();
        response.setId(id.toString());
        response.setRequestedAt(OffsetDateTime.now());
        response.setResult(result);
        return response;
    }

    // === Helpers ===

    private static void validate(PensionCalculationRequestDto req) {
        if (req.getAge() == null || req.getSex() == null || req.getGrossSalaryPLN() == null
                || req.getStartYear() == null || req.getPlannedEndYear() == null) {
            throw new IllegalArgumentException("Missing required fields in PensionCalculationRequestDto");
        }
        if (req.getPlannedEndYear() < LocalDate.now().getYear()) {
            throw new IllegalArgumentException("plannedEndYear must be >= current year");
        }
        if (req.getStartYear() > req.getPlannedEndYear()) {
            throw new IllegalArgumentException("startYear must be <= plannedEndYear");
        }
    }

    private static double asDouble(Number n) {
        return n == null ? 0.0 : n.doubleValue();
    }

    private static double sickAdjustmentFactor(int sickDays, double sickReplacementRate) {
        if (sickDays <= 0) return 1.0;
        double sickShare = Math.min(1.0, Math.max(0.0, sickDays / (double) WORKING_DAYS_PER_YEAR));
        return 1.0 - sickShare * (1.0 - sickReplacementRate);
    }

    // Buduje roczną ścieżkę miesięcznej płacy EXCL od startYear do retireYear, zakotwiczoną w currentYear
    private Map<Integer, Double> buildYearlyBaseline(int startYear,
                                                     int currentYear,
                                                     int retireYear,
                                                     double monthlyGrossCurrent) {
        Map<Integer, Double> base = new LinkedHashMap<>();

        // 1) zakotwicz bieżący rok (grossSalaryPLN = płaca TERAZ)
        double m = monthlyGrossCurrent;
        base.put(currentYear, round2(m));

        // 2) wstecz do startYear (odwijanie wzrostu)
        for (int y = currentYear - 1; y >= startYear; y--) {
            double g = macro.nominalWageGrowth(y); // growth y->y+1
            m = m / (1.0 + g);
            base.put(y, round2(m));
        }

        // 3) w przód do retireYear (projekcja z bieżącej pensji)
        m = monthlyGrossCurrent;
        for (int y = currentYear + 1; y <= retireYear; y++) {
            double g = macro.nominalWageGrowth(y - 1); // growth y-1->y
            m = m * (1.0 + g);
            base.put(y, round2(m));
        }
        return base;
    }

    // Parsuje listę changes z nową strukturą
    private List<ChangeSpan> parseChanges(List<PensionCalculationRequestAdditionalSalaryChangesInnerDto> raw) {
        List<ChangeSpan> out = new ArrayList<>();
        if (raw == null) return out;

        for (Object ch : raw) {
            try {
                Object ct = ch.getClass().getMethod("getChangeType").invoke(ch); // enum lub String
                String typeStr = String.valueOf(ct);
                ChangeType type = "BREAK".equalsIgnoreCase(typeStr) ? ChangeType.BREAK : ChangeType.WORK;

                Object sd = ch.getClass().getMethod("getStartDate").invoke(ch);
                Object ed = ch.getClass().getMethod("getEndDate").invoke(ch);
                OffsetDateTime start = castToODT(sd);
                OffsetDateTime end = castToODT(ed);
                if (start == null || end == null) continue;

                Double salary = null;
                if (type == ChangeType.WORK) {
                    Object sal = ch.getClass().getMethod("getSalary").invoke(ch);
                    if (sal instanceof Number) salary = ((Number) sal).doubleValue();
                }

                out.add(new ChangeSpan(type, start.toLocalDate(), end.toLocalDate(), salary));
            } catch (Throwable ignored) {
                // pomijamy rekord jeśli forma DTO się różni
            }
        }
        return out;
    }

    private OffsetDateTime castToODT(Object o) {
        if (o == null) return null;
        if (o instanceof OffsetDateTime odt) return odt;
        if (o instanceof String s) {
            try { return OffsetDateTime.parse(s); } catch (Exception ignored) { return null; }
        }
        return null;
    }

    private void applyChangesToMonthlyGrid(List<ChangeSpan> changes,
                                           Map<YearMonth, Double> monthlyExcl,
                                           Map<YearMonth, Double> monthlyIncl,
                                           int startYear, int retireYear,
                                           boolean sickEligible, double sickFactor) {
        if (changes == null || changes.isEmpty()) return;

        for (ChangeSpan c : changes) {
            YearMonth from = YearMonth.from(c.start());
            YearMonth to = YearMonth.from(c.end());
            // znormalizuj zakres do [startYear..retireYear]
            YearMonth min = YearMonth.of(startYear, 1);
            YearMonth max = YearMonth.of(retireYear, 12);
            if (to.isBefore(min) || from.isAfter(max)) continue;
            if (from.isBefore(min)) from = min;
            if (to.isAfter(max)) to = max;

            YearMonth cursor = from;
            while (!cursor.isAfter(to)) {
                if (c.type() == ChangeType.BREAK) {
                    monthlyExcl.put(cursor, 0.0);
                    monthlyIncl.put(cursor, 0.0);
                } else { // WORK
                    if (c.salary() != null) {
                        double s = round2(c.salary());
                        monthlyExcl.put(cursor, s);
                        monthlyIncl.put(cursor, sickEligible ? round2(s * sickFactor) : s);
                    }
                }
                cursor = cursor.plusMonths(1);
            }
        }
    }

    private AccumResult accumulateFromMonthly(int fromYear,
                                              int toYear,
                                              double startingFunds,
                                              Map<YearMonth, Double> monthly,
                                              double pensionBaseFactor) {
        List<PensionCalculationResponseResultZusAccountFundsByYearInnerDto> potTimeline = new ArrayList<>();
        double pot = startingFunds;
        for (int y = fromYear; y <= toYear; y++) {
            double sumMonths = 0.0;
            for (int m = 1; m <= 12; m++) {
                sumMonths += monthly.getOrDefault(YearMonth.of(y, m), 0.0);
            }
            double annualBase = sumMonths * pensionBaseFactor;
            double annualContrib = annualBase * EFFECTIVE_PENSION_CONTRIB_RATE;

            double cap = macro.accountIndexationYoY(y); // łagodniejsza od pełnego nominalu
            pot = pot * (1.0 + cap) + annualContrib;

            var row = new PensionCalculationResponseResultZusAccountFundsByYearInnerDto();
            row.setYear(y);
            row.setZusAccountFundsPLN((float) round2(pot));
            potTimeline.add(row);
        }
        return new AccumResult(pot, potTimeline);
    }

    // Odroczenie: rozszerzamy miesięczną siatkę na nowe lata wg wzrostu nominalnego
    private double simulatePostponementMonthly(PensionCalculationRequestDto req,
                                               int addYears,
                                               Map<YearMonth, Double> monthlyChosen, // siatka „actual” (incl/excl)
                                               int baseRetireYear,
                                               double potAtBaseRetirement,
                                               ContractParams contract) {

        int currentYear = LocalDate.now().getYear();
        int newRetireYear = baseRetireYear + addYears;

        // sklonuj wartości dla lat > baseRetireYear
        Map<YearMonth, Double> extended = new LinkedHashMap<>(monthlyChosen);
        for (int y = baseRetireYear + 1; y <= newRetireYear; y++) {
            double growth = macro.nominalWageGrowth(y - 1);
            for (int m = 1; m <= 12; m++) {
                YearMonth prevYm = YearMonth.of(y - 1, m);
                YearMonth ym = YearMonth.of(y, m);
                double prev = extended.getOrDefault(prevYm, 0.0);
                extended.put(ym, round2(prev * (1.0 + growth)));
            }
        }

        // policz dodatkowe lata
        double pot = potAtBaseRetirement;
        for (int y = baseRetireYear + 1; y <= newRetireYear; y++) {
            double sumMonths = 0.0;
            for (int m = 1; m <= 12; m++) {
                sumMonths += extended.getOrDefault(YearMonth.of(y, m), 0.0);
            }
            double annualBase = sumMonths * contract.pensionBaseFactor;
            double annualContrib = annualBase * EFFECTIVE_PENSION_CONTRIB_RATE;

            double cap = macro.accountIndexationYoY(y);
            pot = pot * (1.0 + cap) + annualContrib;
        }

        int yearsToRetire = Math.max(0, newRetireYear - currentYear);
        int ageAtRetire = req.getAge() + yearsToRetire;
        double payoutYears = life.annuityDivisor(ageAtRetire, req.getSex());
        return (pot / Math.max(1e-9, payoutYears)) / 12.0;
    }

    private int estimateExtraYearsToMeetMonthly(PensionCalculationRequestDto req,
                                                Map<YearMonth, Double> monthlyChosen, // incl lub excl
                                                int baseRetireYear,
                                                double potAtBaseRetirement,
                                                double expectedMonthly,
                                                ContractParams contract) {
        for (int add = 1; add <= 15; add++) {
            double p = simulatePostponementMonthly(req, add, monthlyChosen, baseRetireYear, potAtBaseRetirement, contract);
            if (p + 1e-6 >= expectedMonthly) return add;
        }
        return 15;
    }

    private List<PensionCalculationResponseResultSalaryProjectionInnerDto> buildSalaryByYearList(
            Map<YearMonth, Double> monthlyChosen, int fromYear, int toYear) {
        List<PensionCalculationResponseResultSalaryProjectionInnerDto> out = new ArrayList<>();
        for (int y = fromYear; y <= toYear; y++) {
            double sum = 0.0;
            for (int m = 1; m <= 12; m++) {
                sum += monthlyChosen.getOrDefault(YearMonth.of(y, m), 0.0);
            }
            PensionCalculationResponseResultSalaryProjectionInnerDto row =
                    new PensionCalculationResponseResultSalaryProjectionInnerDto();
            row.setYear(y);
            row.setSalary((float) round2(sum / 12));
            out.add(row);
        }
        return out;
    }

    private static double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    // === Makro-ścieżki & tablice życia ===

    public static class MacroPaths {
        /** Nominalny wzrost płac: CPI + real wage (additive aprox). */
        public double nominalWageGrowth(int year) {
            double cpi = cpiYoY(year);
            double real = realWageYoY(year);
            return cpi + real;
        }

        public double cpiYoY(int year) {
            if (year <= 2023) return 0.098;
            if (year == 2024) return 0.048;
            if (year == 2025) return 0.031;
            return 0.025; // 2026+
        }

        public double realWageYoY(int year) {
            if (year <= 2024) return (year == 2023) ? 0.003 : 0.034;
            if (year <= 2027) return switch (year) {
                case 2025 -> 0.037;
                case 2026 -> 0.035;
                case 2027 -> 0.030;
                default -> 0.030;
            };
            if (year <= 2032) return 0.029;
            if (year <= 2035) return 0.028;
            if (year <= 2040) return 0.027;
            if (year <= 2045) return 0.026;
            if (year <= 2050) return 0.025;
            if (year <= 2055) return 0.024;
            if (year <= 2060) return 0.024;
            if (year <= 2065) return 0.023;
            if (year <= 2070) return 0.022;
            if (year <= 2075) return 0.021;
            return 0.020;
        }

        /** Deflator po ścieżce NOMINALNEGO wzrostu wynagrodzeń (z roku retireYear do todayYear). */
        public double deflatorByNominalWage(int retireYear, int todayYear) {
            if (retireYear <= todayYear) return 1.0;
            double d = 1.0;
            for (int y = todayYear; y < retireYear; y++) d *= (1.0 + nominalWageGrowth(y));
            return d;
        }

        /** Indeksacja konta: łagodniejsza niż pełny wzrost płac (CPI + alpha * real). */
        public double accountIndexationYoY(int year) {
            return cpiYoY(year) + ACCOUNT_INDEXATION_REAL_SHARE * realWageYoY(year);
        }

        /** Projekcja średniej miesięcznej emerytury (nominal), do podmiany na serię z danych. */
        public double projectAveragePension(int year) {
            double avg = AVG_PENSION_BASE_YEAR_AMOUNT; // PLN/mies.
            int y0 = AVG_PENSION_BASE_YEAR;
            if (year <= y0) return avg;
            for (int y = y0; y < year; y++) {
                double idx = cpiYoY(y) + 0.20 * realWageYoY(y); // indeksacja świadczeń ~ CPI + 20% real
                avg *= (1.0 + idx);
            }
            return avg;
        }
    }

    /**
     * Przybliżona tablica życia → zwraca spodziewaną liczbę LAT wypłaty.
     * Podniesione wartości bazowe + łagodniejszy spadek na rok → niższa emerytura m/m.
     */
    public static class LifeTables {
        public double annuityDivisor(int ageAtRetirement, PensionCalculationRequestDto.SexEnum sex) {
            double baseYears;
            int baseAge;
            if (sex == PensionCalculationRequestDto.SexEnum.F) {
                baseAge = 60;
                baseYears = 26.0; // było 24.0
            } else {
                baseAge = 65;
                baseYears = 23.0; // było 20.0
            }
            int extra = Math.max(0, ageAtRetirement - baseAge);
            double years = baseYears - 0.55 * extra; // było 0.70
            return Math.max(15.0, years); // min 15 lat
        }
    }

    // === Parametry zależne od kontraktu ===

    private static class ContractParams {
        final double pensionBaseFactor;   // część wynagrodzenia podlegająca oskładkowaniu emerytalnemu (0..1)
        final boolean sickEligible;       // czy w ogóle występuje „chorobowe”
        final double sickReplacementRate; // jaki % płacy jest wypłacany w chorobie (0..1)

        ContractParams(double pensionBaseFactor, boolean sickEligible, double sickReplacementRate) {
            this.pensionBaseFactor = pensionBaseFactor;
            this.sickEligible = sickEligible;
            this.sickReplacementRate = sickReplacementRate;
        }
    }

    private ContractParams resolveContractParams(PensionCalculationRequestDto.ContractTypeEnum ct) {
        if (ct == null) {
            // Domyślnie jak umowa o pracę
            return new ContractParams(1.0, true, 0.80);
        }
        switch (ct) {
            case UMOWA_O_PRACE:
                return new ContractParams(1.0, true, 0.80);
            case UMOWA_ZLECENIE:
                // Upraszczająco: część zleceń ma pełne składki, część nie – bierzemy 0.80 i 0.80 chorobowe
                return new ContractParams(0.80, true, 0.80);
            case B2_B:
                // Upraszczająco: składki od ~60% wynagrodzenia; brak chorobowego
                return new ContractParams(0.60, false, 0.00);
            case UMOWA_O_DZIELO:
                // Brak składek emerytalnych i chorobowego
                return new ContractParams(0.00, false, 0.00);
            default:
                return new ContractParams(1.0, true, 0.80);
        }
    }

    public void enterPostalCodeForCalculation(String calculationId, PostalCodeUpdateRequestDto body) {
        if (body == null || StringUtils.isBlank(body.getPostalCode())) {
            throw new RuntimeException("postalCode must be provided");
        }
        var calc = pensionCalculationRepository.findById(UUID.fromString(calculationId))
                .orElseThrow(() -> new RuntimeException("Calculation with id = %s not found".formatted(calculationId)));
        calc.setPostalCode(body.getPostalCode());
        pensionCalculationRepository.saveAndFlush(calc);
    }

    // === Typy pomocnicze do obsługi zmian ===

    private enum ChangeType { BREAK, WORK }

    private record ChangeSpan(ChangeType type, LocalDate start, LocalDate end, Double salary) { }

    private static class AccumResult {
        final double pot;
        final List<PensionCalculationResponseResultZusAccountFundsByYearInnerDto> timeline;
        AccumResult(double pot, List<PensionCalculationResponseResultZusAccountFundsByYearInnerDto> timeline) {
            this.pot = pot; this.timeline = timeline;
        }
    }
}
