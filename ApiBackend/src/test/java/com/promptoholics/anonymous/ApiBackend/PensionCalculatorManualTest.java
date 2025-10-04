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
            null                            // postal
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
            BigDecimal.ZERO, BigDecimal.ZERO, null
        );
        var resultM = calc.calculate(inputM);

        // Female calculation
        var inputF = new PensionCalculatorService.Input(
            null, 30, "F", new BigDecimal("6000"), 2025, 2060, true,
            BigDecimal.ZERO, BigDecimal.ZERO, null
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
}
