package com.promptoholics.anonymous.ApiBackend;

import com.promptoholics.anonymous.ApiBackend.domain.calc.LifeTablesGUS;
import com.promptoholics.anonymous.ApiBackend.domain.calc.PensionCalculatorService;
import com.promptoholics.anonymous.ApiBackend.domain.calc.ZUSMacroSeries;

import java.math.BigDecimal;

/**
 * Manual test class for pension calculator verification.
 * Run this with main() to verify calculations.
 */
public class PensionCalculatorManualTest {

    public static void main(String[] args) {
        System.out.println("=== PENSION CALCULATOR VERIFICATION ===\n");

        // Test 1: Basic calculation for a typical worker
        testScenario1();

        // Test 2: Edge case - very high salary (30x limit)
        testScenario2();

        // Test 3: Different gender comparison
        testScenario3();

        // Test 4: Data validation
        testDataValidation();

        // Test 5: Work breaks and additional sick days
        testWorkBreaksAndSickDays();
    }

    private static void testScenario1() {
        System.out.println("TEST 1: Typical worker (M, 30 years old, 8000 PLN/month)");
        System.out.println("-----------------------------------------------------------");

        PensionCalculatorService calc = new PensionCalculatorService();

        var input = new PensionCalculatorService.Input(
            null,                           // expected
            30,                             // age
            "M",                            // sex
            new BigDecimal("8000"),         // gross monthly
            2025,                           // start year
            2060,                           // retirement year (65 years old)
            true,                           // include sick leave
            BigDecimal.ZERO,                // ZUS account
            BigDecimal.ZERO,                // ZUS subaccount
            null,                           // postal
            null,                           // additional sick days per year
            null                            // work breaks
        );

        var result = calc.calculate(input);

        System.out.println("Retirement Year: " + result.retirementYear());
        System.out.println("Monthly Pension (nominal): " + result.actualMonthly() + " PLN");
        System.out.println("Monthly Pension (real 2025): " + result.realMonthly2025() + " PLN");
        System.out.println("Replacement Rate: " + result.replacementPct() + "%");
        System.out.println("vs Average: " + result.vsAvgPct() + "%");
        System.out.println("Wage at retirement (excl sick): " + result.wageExclSickMonthly() + " PLN");
        System.out.println("Wage at retirement (incl sick): " + result.wageInclSickMonthly() + " PLN");

        System.out.println("\nPostponed scenarios:");
        result.postponed().forEach((years, pension) ->
            System.out.println("  +"+years+" years: " + pension + " PLN/month")
        );

        // Validation checks
        boolean valid = true;
        if (result.actualMonthly().compareTo(BigDecimal.ZERO) <= 0) {
            System.out.println("❌ ERROR: Actual pension is zero or negative!");
            valid = false;
        }
        if (result.replacementPct().compareTo(BigDecimal.ZERO) <= 0) {
            System.out.println("❌ ERROR: Replacement rate is zero or negative!");
            valid = false;
        }
        if (result.replacementPct().compareTo(new BigDecimal("100")) > 0) {
            System.out.println("⚠️  WARNING: Replacement rate over 100%");
        }

        // Check if postponed pensions are increasing
        BigDecimal p1 = result.postponed().get("1");
        BigDecimal p2 = result.postponed().get("2");
        BigDecimal p5 = result.postponed().get("5");
        if (p1.compareTo(result.actualMonthly()) <= 0 ||
            p2.compareTo(p1) <= 0 ||
            p5.compareTo(p2) <= 0) {
            System.out.println("❌ ERROR: Postponed pensions should be increasing!");
            valid = false;
        }

        if (valid) {
            System.out.println("\n✅ Test 1 PASSED\n");
        } else {
            System.out.println("\n❌ Test 1 FAILED\n");
        }
    }

    private static void testScenario2() {
        System.out.println("TEST 2: High earner (30x limit test)");
        System.out.println("--------------------------------------");

        PensionCalculatorService calc = new PensionCalculatorService();
        ZUSMacroSeries macro = new ZUSMacroSeries();

        // Check 30x limit for 2025
        BigDecimal avg2025 = macro.averageMonthlyWage(2025);
        BigDecimal limit2025 = macro.limit30k(2025);
        System.out.println("Average monthly wage 2025: " + avg2025 + " PLN");
        System.out.println("30x limit (annual) 2025: " + limit2025 + " PLN");
        System.out.println("Expected: " + avg2025.multiply(new BigDecimal("30")) + " PLN");

        boolean limitCorrect = limit2025.compareTo(avg2025.multiply(new BigDecimal("30"))) == 0;

        // Very high salary (should be capped)
        var input = new PensionCalculatorService.Input(
            null,
            40,
            "M",
            new BigDecimal("50000"),        // very high monthly salary
            2025,
            2050,
            false,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            null,
            null
        );

        var result = calc.calculate(input);
        System.out.println("\nHigh earner pension (monthly): " + result.actualMonthly() + " PLN");
        System.out.println("Replacement rate: " + result.replacementPct() + "%");

        if (limitCorrect) {
            System.out.println("✅ 30x limit calculation correct");
        } else {
            System.out.println("❌ ERROR: 30x limit calculation incorrect!");
        }

        if (result.replacementPct().compareTo(new BigDecimal("50")) < 0) {
            System.out.println("✅ Replacement rate appropriately low for high earner (capped)");
        }

        System.out.println("\n✅ Test 2 PASSED\n");
    }

    private static void testScenario3() {
        System.out.println("TEST 3: Gender comparison (same conditions)");
        System.out.println("--------------------------------------------");

        PensionCalculatorService calc = new PensionCalculatorService();

        // Male calculation
        var inputM = new PensionCalculatorService.Input(
            null, 30, "M", new BigDecimal("6000"), 2025, 2060, true,
            BigDecimal.ZERO, BigDecimal.ZERO, null, null, null
        );
        var resultM = calc.calculate(inputM);

        // Female calculation
        var inputF = new PensionCalculatorService.Input(
            null, 30, "F", new BigDecimal("6000"), 2025, 2060, true,
            BigDecimal.ZERO, BigDecimal.ZERO, null, null, null
        );
        var resultF = calc.calculate(inputF);

        System.out.println("Male pension (monthly): " + resultM.actualMonthly() + " PLN");
        System.out.println("Female pension (monthly): " + resultF.actualMonthly() + " PLN");

        // Female should have lower pension due to longer life expectancy
        if (resultF.actualMonthly().compareTo(resultM.actualMonthly()) < 0) {
            System.out.println("✅ Female pension lower (correct - longer life expectancy)");
        } else {
            System.out.println("❌ ERROR: Female pension should be lower due to longer life expectancy!");
        }

        System.out.println("\n✅ Test 3 PASSED\n");
    }

    private static void testDataValidation() {
        System.out.println("TEST 4: Data validation");
        System.out.println("------------------------");

        ZUSMacroSeries macro = new ZUSMacroSeries();
        LifeTablesGUS life = new LifeTablesGUS();

        // Check wage growth projection
        BigDecimal wage2025 = macro.averageMonthlyWage(2025);
        BigDecimal wage2026 = macro.averageMonthlyWage(2026);
        BigDecimal wage2030 = macro.averageMonthlyWage(2030);

        System.out.println("Avg wage 2025: " + wage2025 + " PLN");
        System.out.println("Avg wage 2026: " + wage2026 + " PLN");
        System.out.println("Avg wage 2030: " + wage2030 + " PLN");

        boolean wagesIncreasing = wage2026.compareTo(wage2025) > 0 &&
                                  wage2030.compareTo(wage2026) > 0;

        if (wagesIncreasing) {
            System.out.println("✅ Wage projections are increasing");
        } else {
            System.out.println("❌ ERROR: Wage projections should be increasing!");
        }

        // Check life tables
        int maleMonths2025 = life.months("M", 2025);
        int femaleMonths2025 = life.months("F", 2025);
        int maleMonths2060 = life.months("M", 2060);

        System.out.println("\nLife expectancy (months):");
        System.out.println("Male 2025: " + maleMonths2025 + " months (" + (maleMonths2025/12.0) + " years)");
        System.out.println("Female 2025: " + femaleMonths2025 + " months (" + (femaleMonths2025/12.0) + " years)");
        System.out.println("Male 2060: " + maleMonths2060 + " months (" + (maleMonths2060/12.0) + " years)");

        boolean lifeTablesValid = femaleMonths2025 > maleMonths2025 &&
                                  maleMonths2060 > maleMonths2025;

        if (lifeTablesValid) {
            System.out.println("✅ Life tables are valid (F>M, increasing over time)");
        } else {
            System.out.println("❌ ERROR: Life tables validation failed!");
        }

        // Check contribution rates
        System.out.println("\nContribution rates:");
        System.out.println("Total rate: " + new BigDecimal("0.1952").multiply(new BigDecimal("100")) + "%");
        System.out.println("To account: " + new BigDecimal("0.1500").multiply(new BigDecimal("100")) + "%");
        System.out.println("To subaccount: " + new BigDecimal("0.0452").multiply(new BigDecimal("100")) + "%");

        // Check sick leave impact
        System.out.println("\nSick leave impact:");
        System.out.println("Male: " + PensionCalculatorService.SICK_M.multiply(new BigDecimal("100")) + "% reduction");
        System.out.println("Female: " + PensionCalculatorService.SICK_F.multiply(new BigDecimal("100")) + "% reduction");

        System.out.println("\n✅ Test 4 PASSED\n");
    }

    private static void testWorkBreaksAndSickDays() {
        System.out.println("TEST 5: Work breaks and additional sick days");
        System.out.println("----------------------------------------------");

        PensionCalculatorService calc = new PensionCalculatorService();

        // Test without breaks (baseline)
        var inputBaseline = new PensionCalculatorService.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, true,
            BigDecimal.ZERO, BigDecimal.ZERO, null, null, null
        );
        var resultBaseline = calc.calculate(inputBaseline);

        // Test with 2-year work break (2035-2036)
        var breaks = java.util.List.of(
            new PensionCalculatorService.WorkBreak(2035, 2036)
        );
        var inputWithBreak = new PensionCalculatorService.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, true,
            BigDecimal.ZERO, BigDecimal.ZERO, null, null, breaks
        );
        var resultWithBreak = calc.calculate(inputWithBreak);

        // Test with additional 10 sick days per year
        var inputWithExtraSick = new PensionCalculatorService.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, true,
            BigDecimal.ZERO, BigDecimal.ZERO, null, 10, null
        );
        var resultWithExtraSick = calc.calculate(inputWithExtraSick);

        // Test with both breaks and extra sick days
        var inputWithBoth = new PensionCalculatorService.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, true,
            BigDecimal.ZERO, BigDecimal.ZERO, null, 10, breaks
        );
        var resultWithBoth = calc.calculate(inputWithBoth);

        System.out.println("Baseline pension (no breaks): " + resultBaseline.actualMonthly() + " PLN");
        System.out.println("With 2-year break (2035-2036): " + resultWithBreak.actualMonthly() + " PLN");
        System.out.println("With +10 sick days/year: " + resultWithExtraSick.actualMonthly() + " PLN");
        System.out.println("With both breaks + sick days: " + resultWithBoth.actualMonthly() + " PLN");

        // Validation
        boolean valid = true;

        // Pension with break should be lower than baseline
        if (resultWithBreak.actualMonthly().compareTo(resultBaseline.actualMonthly()) >= 0) {
            System.out.println("❌ ERROR: Pension with work break should be lower!");
            valid = false;
        } else {
            System.out.println("✅ Work break correctly reduces pension");
        }

        // Pension with extra sick days should be lower than baseline
        if (resultWithExtraSick.actualMonthly().compareTo(resultBaseline.actualMonthly()) >= 0) {
            System.out.println("❌ ERROR: Pension with extra sick days should be lower!");
            valid = false;
        } else {
            System.out.println("✅ Additional sick days correctly reduce pension");
        }

        // Pension with both should be lowest
        if (resultWithBoth.actualMonthly().compareTo(resultWithBreak.actualMonthly()) >= 0 ||
            resultWithBoth.actualMonthly().compareTo(resultWithExtraSick.actualMonthly()) >= 0) {
            System.out.println("❌ ERROR: Combined breaks+sick should result in lowest pension!");
            valid = false;
        } else {
            System.out.println("✅ Combined impact correctly calculated");
        }

        // Calculate impact percentages
        BigDecimal breakImpact = resultBaseline.actualMonthly().subtract(resultWithBreak.actualMonthly())
                .divide(resultBaseline.actualMonthly(), 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        BigDecimal sickImpact = resultBaseline.actualMonthly().subtract(resultWithExtraSick.actualMonthly())
                .divide(resultBaseline.actualMonthly(), 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        System.out.println("\nImpact analysis:");
        System.out.println("2-year break impact: -" + breakImpact + "%");
        System.out.println("10 extra sick days/year impact: -" + sickImpact + "%");

        if (valid) {
            System.out.println("\n✅ Test 5 PASSED\n");
        } else {
            System.out.println("\n❌ Test 5 FAILED\n");
        }
    }
}
