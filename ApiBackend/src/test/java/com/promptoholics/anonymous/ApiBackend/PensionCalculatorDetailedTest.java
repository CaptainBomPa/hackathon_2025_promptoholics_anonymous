package com.promptoholics.anonymous.ApiBackend;

import com.promptoholics.anonymous.ApiBackend.domain.calc.LifeTablesGUS;
import com.promptoholics.anonymous.ApiBackend.domain.calc.PensionCalculatorService;
import com.promptoholics.anonymous.ApiBackend.domain.calc.ZUSMacroSeries;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Detailed verification test for pension calculator with 5000 PLN gross salary
 */
public class PensionCalculatorDetailedTest {

    public static void main(String[] args) {
        System.out.println("=== DETAILED PENSION CALCULATOR VERIFICATION ===\n");

        testCase5000PLN();
    }

    private static void testCase5000PLN() {
        System.out.println("TEST: Worker with 5000 PLN gross monthly salary");
        System.out.println("================================================\n");

        PensionCalculatorService calc = new PensionCalculatorService();
        ZUSMacroSeries macro = new ZUSMacroSeries();
        LifeTablesGUS life = new LifeTablesGUS();

        // Scenario: 30 years old in 2025, retire at 65 (2060)
        int currentAge = 30;
        int currentYear = 2025;
        int retirementYear = 2060;
        int retirementAge = 65;
        BigDecimal grossMonthly = new BigDecimal("5000");
        String sex = "M";

        var input = new PensionCalculatorService.Input(
            null,
            currentAge,
            sex,
            grossMonthly,
            currentYear,
            retirementYear,
            true,  // include sick leave
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            null,
            null,
            null,
            PensionCalculatorService.ContractType.UMOWA_O_PRACE
        );

        var result = calc.calculate(input);

        System.out.println("INPUT PARAMETERS:");
        System.out.println("  Current age: " + currentAge);
        System.out.println("  Current year: " + currentYear);
        System.out.println("  Retirement year: " + retirementYear);
        System.out.println("  Years of contributions: " + (retirementYear - currentYear));
        System.out.println("  Gross monthly salary (2025): " + grossMonthly + " PLN");
        System.out.println("  Include sick leave: YES (2% for men)");
        System.out.println();

        System.out.println("RESULTS:");
        System.out.println("  Nominal monthly pension (2060): " + result.actualMonthly().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("  Real monthly pension (2025 prices): " + result.realMonthly2025().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("  Replacement rate: " + result.replacementPct().setScale(2, RoundingMode.HALF_UP) + "%");
        System.out.println("  Wage at retirement (excl sick): " + result.wageExclSickMonthly().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("  Wage at retirement (incl sick): " + result.wageInclSickMonthly().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println();

        // Manual step-by-step calculation for verification
        System.out.println("STEP-BY-STEP VERIFICATION:");
        System.out.println("---------------------------");

        // Step 1: Calculate contribution base with sick leave
        BigDecimal sickLeaveImpact = new BigDecimal("0.02"); // 2% for men
        BigDecimal annualGrossAfterSick = grossMonthly
                .multiply(new BigDecimal("12"))
                .multiply(BigDecimal.ONE.subtract(sickLeaveImpact));

        System.out.println("\n1. ANNUAL CONTRIBUTION BASE (2025):");
        System.out.println("   Gross annual (before sick): " + grossMonthly.multiply(new BigDecimal("12")).setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Sick leave impact: -" + sickLeaveImpact.multiply(new BigDecimal("100")) + "%");
        System.out.println("   Gross annual (after sick): " + annualGrossAfterSick.setScale(2, RoundingMode.HALF_UP) + " PLN");

        // Check 30x limit
        BigDecimal limit2025 = macro.limit30k(2025);
        System.out.println("   30x limit (2025): " + limit2025.setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Capped? " + (annualGrossAfterSick.compareTo(limit2025) > 0 ? "YES" : "NO"));

        // Step 2: Calculate contributions
        BigDecimal contributionRate = new BigDecimal("0.1952"); // 19.52% total
        BigDecimal annualContribution = annualGrossAfterSick.multiply(contributionRate);

        System.out.println("\n2. ANNUAL CONTRIBUTIONS (2025):");
        System.out.println("   Contribution rate: " + contributionRate.multiply(new BigDecimal("100")) + "%");
        System.out.println("   Annual contribution: " + annualContribution.setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   To account (15%): " + annualGrossAfterSick.multiply(new BigDecimal("0.15")).setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   To subaccount (4.52%): " + annualGrossAfterSick.multiply(new BigDecimal("0.0452")).setScale(2, RoundingMode.HALF_UP) + " PLN");

        // Step 3: Estimate total capital accumulation
        System.out.println("\n3. CAPITAL ACCUMULATION ESTIMATE:");

        // Simple calculation: contributions * years * average valorization
        int years = retirementYear - currentYear;
        // Average historical valorization ~1.08 per year (8%)
        BigDecimal avgValorization = new BigDecimal("1.08");

        // Approximate future value of annuity
        BigDecimal fv = BigDecimal.ZERO;
        BigDecimal currentContribution = annualContribution;

        for (int i = 0; i < years; i++) {
            fv = fv.add(currentContribution);
            fv = fv.multiply(avgValorization);
            // Contribution grows with wages (approx 5.4% per year based on macro)
            currentContribution = currentContribution.multiply(new BigDecimal("1.054"));
        }

        System.out.println("   Years of contributions: " + years);
        System.out.println("   Estimated capital (rough): " + fv.setScale(2, RoundingMode.HALF_UP) + " PLN");

        // Step 4: Life expectancy
        int lifeMonths = life.months(sex, retirementYear);
        double lifeYears = lifeMonths / 12.0;

        System.out.println("\n4. LIFE EXPECTANCY (2060):");
        System.out.println("   Months: " + lifeMonths);
        System.out.println("   Years: " + String.format("%.2f", lifeYears));

        // Step 5: Estimated monthly pension
        BigDecimal estimatedMonthlyPension = fv.divide(new BigDecimal(lifeMonths), 2, RoundingMode.HALF_UP);

        System.out.println("\n5. ESTIMATED MONTHLY PENSION:");
        System.out.println("   Capital / Months: " + estimatedMonthlyPension + " PLN (nominal 2060)");

        // Step 6: Compare with actual result
        System.out.println("\n6. COMPARISON:");
        System.out.println("   Calculator result (nominal): " + result.actualMonthly().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Our estimate (nominal): " + estimatedMonthlyPension + " PLN");
        BigDecimal difference = result.actualMonthly().subtract(estimatedMonthlyPension);
        BigDecimal diffPct = difference.divide(estimatedMonthlyPension, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        System.out.println("   Difference: " + difference.setScale(2, RoundingMode.HALF_UP) + " PLN (" + diffPct.setScale(2, RoundingMode.HALF_UP) + "%)");

        // Step 7: Wage projection at retirement
        BigDecimal wage2060 = grossMonthly;
        for (int y = currentYear + 1; y <= retirementYear; y++) {
            BigDecimal growth = macro.averageMonthlyWage(y)
                    .divide(macro.averageMonthlyWage(y - 1), 10, RoundingMode.HALF_UP);
            wage2060 = wage2060.multiply(growth);
        }

        System.out.println("\n7. WAGE PROJECTION:");
        System.out.println("   Starting wage (2025): " + grossMonthly + " PLN");
        System.out.println("   Projected wage (2060): " + wage2060.setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Growth factor: " + wage2060.divide(grossMonthly, 2, RoundingMode.HALF_UP) + "x");

        // Step 8: Verify replacement rate
        BigDecimal calculatedReplacement = result.actualMonthly()
                .divide(wage2060, 6, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        System.out.println("\n8. REPLACEMENT RATE VERIFICATION:");
        System.out.println("   Monthly pension: " + result.actualMonthly().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Monthly wage at retirement: " + wage2060.setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Calculated replacement: " + calculatedReplacement.setScale(2, RoundingMode.HALF_UP) + "%");
        System.out.println("   Reported replacement: " + result.replacementPct().setScale(2, RoundingMode.HALF_UP) + "%");
        System.out.println("   Match? " + (calculatedReplacement.subtract(result.replacementPct()).abs().compareTo(new BigDecimal("0.01")) < 0 ? "YES" : "NO"));

        // Step 9: Deflation to 2025
        BigDecimal deflator = BigDecimal.ONE;
        for (int y = currentYear + 1; y <= retirementYear; y++) {
            deflator = deflator.multiply(new BigDecimal("1.025")); // 2.5% inflation
        }
        BigDecimal realPension = result.actualMonthly().divide(deflator, 2, RoundingMode.HALF_UP);

        System.out.println("\n9. DEFLATION TO 2025 PRICES:");
        System.out.println("   Nominal pension (2060): " + result.actualMonthly().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Deflator (35 years @ 2.5%): " + deflator.setScale(4, RoundingMode.HALF_UP));
        System.out.println("   Calculated real (2025): " + realPension + " PLN");
        System.out.println("   Reported real (2025): " + result.realMonthly2025().setScale(2, RoundingMode.HALF_UP) + " PLN");
        System.out.println("   Match? " + (realPension.subtract(result.realMonthly2025()).abs().compareTo(new BigDecimal("1")) < 0 ? "YES" : "NO"));

        // Final assessment
        System.out.println("\n" + "=".repeat(80));
        System.out.println("ASSESSMENT:");
        System.out.println("=".repeat(80));

        boolean reasonable = true;

        // Check if replacement rate is within expected range (20-40% for current system)
        if (result.replacementPct().compareTo(new BigDecimal("15")) < 0 ||
            result.replacementPct().compareTo(new BigDecimal("45")) > 0) {
            System.out.println("⚠️  WARNING: Replacement rate outside typical range (20-40%)");
            reasonable = false;
        } else {
            System.out.println("✅ Replacement rate within expected range");
        }

        // Check if real pension is reasonable compared to current salary
        BigDecimal realRatio = result.realMonthly2025().divide(grossMonthly, 4, RoundingMode.HALF_UP);
        if (realRatio.compareTo(new BigDecimal("0.4")) < 0 || realRatio.compareTo(new BigDecimal("1.2")) > 0) {
            System.out.println("⚠️  WARNING: Real pension ratio to current salary seems unusual: " + realRatio.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
            reasonable = false;
        } else {
            System.out.println("✅ Real pension ratio to current salary is reasonable: " + realRatio.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
        }

        if (reasonable) {
            System.out.println("\n✅✅✅ CALCULATIONS APPEAR CORRECT ✅✅✅");
        } else {
            System.out.println("\n⚠️⚠️⚠️  REVIEW NEEDED ⚠️⚠️⚠️");
        }
    }
}
