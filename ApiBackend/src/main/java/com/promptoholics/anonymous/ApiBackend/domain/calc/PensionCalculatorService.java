package com.promptoholics.anonymous.ApiBackend.domain.calc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

/**
 * Silnik kalkulacji emerytalnej – WERSJA MIESIĘCZNA.
 * Zmiany vs poprzednio:
 *  - actual/real liczone i zwracane w przeliczeniu NA MIESIĄC (nie na rok),
 *  - replacement rate liczony miesięcznie (miesięczna emerytura / miesięczne wynagrodzenie),
 *  - vsAverage liczony do 50% przeciętnego miesięcznego wynagrodzenia,
 *  - postponed (+1/+2/+5) liczone na NOWO do newYear (dokładamy lata składek + waloryzację).
 */
public class PensionCalculatorService {

    /** Rok bazowy (deflacja/urealnianie). */
    private static final int BASE_YEAR_FOR_REAL = 2025;

    /** Łączna stopa składki emerytalnej (pracownik+pracodawca). */
    private static final BigDecimal EMP_RATE_TOTAL      = new BigDecimal("0.1952");
    /** Na konto (waloryzacja roczna). */
    private static final BigDecimal EMP_RATE_TO_ACCOUNT = new BigDecimal("0.1500");
    /** Na subkonto (waloryzacja kwartalna). */
    private static final BigDecimal EMP_RATE_TO_SUBACCT = EMP_RATE_TOTAL.subtract(EMP_RATE_TO_ACCOUNT);

    /** Uśredniony wpływ chorobowego. */
    public static final BigDecimal SICK_M = new BigDecimal("0.020"); // 2%
    public static final BigDecimal SICK_F = new BigDecimal("0.030"); // 3%

    private static final BigDecimal TWELVE = new BigDecimal("12");
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final ZUSMacroSeries macro = new ZUSMacroSeries();
    private final LifeTablesGUS life = new LifeTablesGUS();

    /* ======================== WE / WY ======================== */

    public record Input(
            BigDecimal expected,         // oczekiwana emerytura (MIESIĘCZNA, jeśli podana)
            int age,
            String sex,                  // "M" / "F"
            BigDecimal grossMonthly,     // dzisiejsze wynagrodzenie brutto (mies.)
            int startYear,
            int retYear,
            boolean includeSick,
            BigDecimal zusAccount,       // saldo konta (dziś)
            BigDecimal zusSubaccount,    // saldo subkonta (dziś)
            String postal,
            Integer additionalSickDaysPerYear,  // dodatkowe dni chorobowe rocznie (oprócz domyślnych 2%/3%)
            List<WorkBreak> workBreaks          // okresy przerw w pracy (BREAK type)
    ) {}

    /**
     * Work break period - time when contributions were not made
     */
    public record WorkBreak(
            int startYear,
            int endYear
    ) {}

    public record CalculationResult(
            Instant requestedAt,
            int retirementYear,
            BigDecimal actualMonthly,           // nominalna emerytura MIESIĘCZNIE (w roku retYear)
            BigDecimal realMonthly2025,         // emerytura MIESIĘCZNIE w cenach 2025
            BigDecimal replacementPct,          // (miesięczna emerytura / miesięczna płaca w retYear) * 100
            BigDecimal vsAvgPct,                // % względem "średniej emerytury" (proxy 50% przeciętnego MIESIĘCZNEGO wynagrodzenia)
            BigDecimal wageInclSickMonthly,     // miesięczne wynagrodzenie w retYear z chorobowym
            BigDecimal wageExclSickMonthly,     // miesięczne wynagrodzenie w retYear bez chorobowego
            Map<String, BigDecimal> postponed   // {"1": nominal MONTHLY @ retYear+1, "2": ..., "5": ...}
    ) {}

    /* ======================== API ======================== */

    public CalculationResult calculate(Input in) {
        // 1) Ścieżka płac (miesięcznie) od roku bazowego do retYear
        Map<Integer, BigDecimal> wagePath = wagePath(in.grossMonthly(), BASE_YEAR_FOR_REAL, in.retYear());

        // 2) Chorobowe (domyślne + dodatkowe dni)
        BigDecimal sick = calculateSickLeaveImpact(in);

        // 3) Roczna podstawa (po chorobowym) z limitem 30-krotności
        Map<Integer, BigDecimal> baseIncl = annualBaseWithLimit(wagePath, sick);

        // 4) Uwzględnij przerwy w pracy (BREAK periods) - wyzeruj składki w tych latach
        baseIncl = applyWorkBreaks(baseIncl, in.workBreaks());

        // 5) Akumulacja konta i subkonta z waloryzacją
        Accum acc = accumulateSplit(nvl(in.zusAccount()), nvl(in.zusSubaccount()), baseIncl);

        // 5) Annuitetyzacja w retYear → MIESIĘCZNIE
        int months = life.months(in.sex(), in.retYear());
        BigDecimal capital = acc.account.add(acc.subaccount);
        BigDecimal monthlyPension = capital
                .divide(new BigDecimal(months), 10, RoundingMode.HALF_UP);

        // 6) Urealnianie do 2025 (MIESIĘCZNIE)
        BigDecimal real2025monthly = deflateTo2025(monthlyPension, in.retYear());

        // 7) Replacement rate (MIESIĘCZNY)
        BigDecimal wageMonthRet = wagePath.get(in.retYear());               // bez chorobowego
        BigDecimal replacement = pct(monthlyPension, wageMonthRet);

        // 8) Proxy średniej emerytury (50% przeciętnego WYNAGRODZENIA MIESIĘCZNEGO)
        BigDecimal avgBenefitMonthly = macro.averageMonthlyWage(in.retYear()).multiply(new BigDecimal("0.50"));
        BigDecimal vsAvg = avgBenefitMonthly.signum()==0
                ? null
                : monthlyPension.divide(avgBenefitMonthly, 6, RoundingMode.HALF_UP)
                .subtract(BigDecimal.ONE)
                .multiply(HUNDRED);

        // 9) Wynagrodzenia (mies.)
        BigDecimal wageMonthRetIncl = wageMonthRet.multiply(BigDecimal.ONE.subtract(sick));

        // 10) Postponed: LICZYMY DO NOWEGO ROKU (dokładamy lata)
        Map<String, BigDecimal> postponed = new LinkedHashMap<>();
        for (int y : new int[]{1, 2, 5}) {
            postponed.put(String.valueOf(y), recompute(in, in.retYear() + y, sick));
        }

        return new CalculationResult(
                Instant.now(),
                in.retYear(),
                monthlyPension,
                real2025monthly,
                replacement,
                vsAvg,
                wageMonthRetIncl,
                wageMonthRet,
                postponed
        );
    }

    /* ======================== LOGIKA WEWNĘTRZNA ======================== */

    /** Miesięczna ścieżka płac od fromYear do toYear (włącznie), startując od „dzisiaj”. */
    private Map<Integer, BigDecimal> wagePath(BigDecimal todayMonth, int fromYear, int toYear){
        Map<Integer, BigDecimal> m = new HashMap<>();
        m.put(fromYear, todayMonth);
        for (int y = fromYear + 1; y <= toYear; y++){
            BigDecimal prev = m.get(y - 1);
            BigDecimal g = macro.averageMonthlyWage(y)
                    .divide(macro.averageMonthlyWage(y - 1), 10, RoundingMode.HALF_UP);
            m.put(y, prev.multiply(g));
        }
        return m;
    }

    /** Roczna podstawa (po chorobowym) z limitem 30-krotności (cap = 30 × przeciętne miesięczne). */
    private Map<Integer, BigDecimal> annualBaseWithLimit(Map<Integer, BigDecimal> wagePathMonthly, BigDecimal sick){
        Map<Integer, BigDecimal> out = new HashMap<>();
        for (var e : wagePathMonthly.entrySet()){
            int y = e.getKey();
            BigDecimal annualGross = e.getValue()
                    .multiply(TWELVE)
                    .multiply(BigDecimal.ONE.subtract(sick));
            BigDecimal cap = macro.limit30k(y); // 30 × przeciętne miesięczne w danym roku (tak definiowany jest roczny limit)
            out.put(y, annualGross.min(cap));
        }
        return out;
    }

    /** Wynik akumulacji konta/subkonta. */
    private record Accum(BigDecimal account, BigDecimal subaccount){}

    /** Akumulacja: konto (roczna waloryzacja), subkonto (iloczyn kwartalnych). */
    private Accum accumulateSplit(BigDecimal initAcc, BigDecimal initSub, Map<Integer, BigDecimal> annualBase){
        BigDecimal acc = initAcc;
        BigDecimal sub = initSub;
        var years = new ArrayList<>(annualBase.keySet());
        Collections.sort(years);
        for (Integer y : years){
            BigDecimal base = annualBase.get(y);
            acc = acc.add(base.multiply(EMP_RATE_TO_ACCOUNT))
                    .multiply(macro.accountIndexFactor(y));
            sub = sub.add(base.multiply(EMP_RATE_TO_SUBACCT))
                    .multiply(macro.subaccountIndexFactorYear(y));
        }
        return new Accum(acc, sub);
    }

    /** Deflacja miesięcznej kwoty do 2025. */
    private BigDecimal deflateTo2025(BigDecimal nominalMonthly, int retYear){
        if (retYear <= BASE_YEAR_FOR_REAL) return nominalMonthly;
        BigDecimal f = BigDecimal.ONE;
        for (int y = BASE_YEAR_FOR_REAL + 1; y <= retYear; y++) {
            // uproszczony deflator CPI ~2.5% r/r
            f = f.multiply(new BigDecimal("1.025"));
        }
        return nominalMonthly.divide(f, 10, RoundingMode.HALF_UP);
    }

    /**
     * Postponed: budujemy wagePath do newYear, liczymy roczną bazę z limitem, akumulujemy i annuitetyzujemy
     * na newYear → zwracamy NOMINALNĄ emeryturę MIESIĘCZNĄ w newYear.
     */
    private BigDecimal recompute(Input in, int newYear, BigDecimal sick){
        Map<Integer, BigDecimal> wage = wagePath(in.grossMonthly(), BASE_YEAR_FOR_REAL, newYear);
        Map<Integer, BigDecimal> base = annualBaseWithLimit(wage, sick);
        base = applyWorkBreaks(base, in.workBreaks()); // Apply work breaks for postponed scenarios too
        Accum acc = accumulateSplit(nvl(in.zusAccount()), nvl(in.zusSubaccount()), base);
        int months = life.months(in.sex(), newYear);
        BigDecimal capital = acc.account.add(acc.subaccount);
        return capital.divide(new BigDecimal(months), 10, RoundingMode.HALF_UP);
    }

    /**
     * Calculate total sick leave impact (default + additional days per year)
     */
    private BigDecimal calculateSickLeaveImpact(Input in) {
        BigDecimal baseSick = BigDecimal.ZERO;
        if (in.includeSick()) {
            baseSick = "M".equalsIgnoreCase(in.sex()) ? SICK_M : SICK_F;
        }

        // Add additional sick days if provided
        if (in.additionalSickDaysPerYear() != null && in.additionalSickDaysPerYear() > 0) {
            // Convert days to percentage (assuming ~250 working days per year)
            BigDecimal additionalSickPct = new BigDecimal(in.additionalSickDaysPerYear())
                    .divide(new BigDecimal("250"), 10, RoundingMode.HALF_UP);
            baseSick = baseSick.add(additionalSickPct);
        }

        return baseSick;
    }

    /**
     * Apply work breaks - zero out contribution base for break years
     */
    private Map<Integer, BigDecimal> applyWorkBreaks(Map<Integer, BigDecimal> baseIncl, List<WorkBreak> workBreaks) {
        if (workBreaks == null || workBreaks.isEmpty()) {
            return baseIncl;
        }

        Map<Integer, BigDecimal> result = new HashMap<>(baseIncl);
        for (WorkBreak brk : workBreaks) {
            for (int year = brk.startYear(); year <= brk.endYear(); year++) {
                if (result.containsKey(year)) {
                    // Zero out contributions for this year (break period)
                    result.put(year, BigDecimal.ZERO);
                }
            }
        }

        return result;
    }

    /* ======================== utils ======================== */

    private static BigDecimal nvl(BigDecimal x){ return x == null ? BigDecimal.ZERO : x; }

    private static BigDecimal pct(BigDecimal a, BigDecimal b){
        return (b == null || b.signum() == 0)
                ? BigDecimal.ZERO
                : a.divide(b, 6, RoundingMode.HALF_UP).multiply(HUNDRED);
    }
}
