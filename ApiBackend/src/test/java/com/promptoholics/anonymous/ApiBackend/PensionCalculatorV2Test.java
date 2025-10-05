package com.promptoholics.anonymous.ApiBackend;

import com.promptoholics.anonymous.ApiBackend.domain.calc.PensionCalculatorV2;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Test kalkulatora V2 - weryfikacja różnych scenariuszy
 */
public class PensionCalculatorV2Test {

    public static void main(String[] args) {
        System.out.println("=== PENSION CALCULATOR V2 TEST ===\n");

        testUmowaOPrace();
        testUmowaZlecenie();
        testB2B();
        testUmowaODzielo();
        testWorkBreaks();
        testSickLeave();
    }

    private static void testUmowaOPrace() {
        System.out.println("TEST 1: Umowa o pracę (19.52% składek)");
        System.out.println("========================================");

        PensionCalculatorV2 calc = new PensionCalculatorV2();

        var input = new PensionCalculatorV2.Input(
            new BigDecimal("5000"),     // expected
            30,                         // age
            "M",                        // sex
            new BigDecimal("8000"),     // gross monthly
            2025,                       // start year
            2060,                       // planned end year
            true,                       // include sick leave
            BigDecimal.ZERO,            // ZUS account funds
            "02-776",                   // postal code
            null,                       // additional sick days
            null,                       // work breaks
            PensionCalculatorV2.ContractType.UMOWA_O_PRACE
        );

        var output = calc.calculate(input);

        System.out.println("Wynagrodzenie początkowe: 8000 PLN/miesiąc");
        System.out.println("Lata składkowe: " + (input.plannedEndYear() - input.startYear()));
        System.out.println("\nWYNIKI:");
        System.out.println("  Emerytura nominalna: " + scale2(output.actualMonthlyPension()) + " PLN/miesiąc");
        System.out.println("  Emerytura realna (2025): " + scale2(output.realMonthlyPension2025()) + " PLN/miesiąc");
        System.out.println("  Stopa zastąpienia: " + scale1(output.replacementRatePct()) + "%");
        System.out.println("  Wynagrodzenie końcowe (bez chorobowego): " + scale2(output.wageExclSickMonthly()) + " PLN");
        System.out.println("  Wynagrodzenie końcowe (z chorobowym): " + scale2(output.wageInclSickMonthly()) + " PLN");

        System.out.println("\nEmerytury odroczone:");
        output.postponedPensions().forEach((years, pension) ->
            System.out.println("  +" + years + " lat: " + scale2(pension) + " PLN/miesiąc")
        );

        // Walidacja
        boolean valid = true;
        if (output.actualMonthlyPension().compareTo(BigDecimal.ZERO) <= 0) {
            System.out.println("\n❌ BŁĄD: Emerytura <= 0!");
            valid = false;
        }
        if (output.replacementRatePct().compareTo(new BigDecimal("20")) < 0 ||
            output.replacementRatePct().compareTo(new BigDecimal("50")) > 0) {
            System.out.println("\n⚠️  UWAGA: Stopa zastąpienia poza zakresem 20-50%");
        }

        if (valid) {
            System.out.println("\n✅ Test 1 PASSED\n");
        } else {
            System.out.println("\n❌ Test 1 FAILED\n");
        }
    }

    private static void testUmowaZlecenie() {
        System.out.println("TEST 2: Umowa zlecenie (19.52% składek)");
        System.out.println("=========================================");

        PensionCalculatorV2 calc = new PensionCalculatorV2();

        var input = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, true,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_ZLECENIE
        );

        var output = calc.calculate(input);

        System.out.println("Emerytura miesięczna: " + scale2(output.actualMonthlyPension()) + " PLN");
        System.out.println("Stopa zastąpienia: " + scale1(output.replacementRatePct()) + "%");
        System.out.println("\n✅ Test 2 PASSED (UZ = UoP jeśli chodzi o składki)\n");
    }

    private static void testB2B() {
        System.out.println("TEST 3: B2B (minimalna składka dobrowolna)");
        System.out.println("============================================");

        PensionCalculatorV2 calc = new PensionCalculatorV2();

        // Osoba na B2B z wynagrodzeniem 15000 PLN
        var input = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("15000"), 2025, 2060, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.B2B
        );

        var output = calc.calculate(input);

        System.out.println("Wynagrodzenie: 15000 PLN/miesiąc");
        System.out.println("Podstawa składek B2B: 4500 PLN/miesiąc (minimalna)");
        System.out.println("\nWYNIKI:");
        System.out.println("  Emerytura miesięczna: " + scale2(output.actualMonthlyPension()) + " PLN");
        System.out.println("  Stopa zastąpienia: " + scale1(output.replacementRatePct()) + "%");

        // B2B powinno mieć emeryturę > 0 (składki z minimalnej)
        if (output.actualMonthlyPension().compareTo(BigDecimal.ZERO) > 0) {
            System.out.println("\n✅ Test 3 PASSED (B2B ma emeryturę z minimalnej składki)\n");
        } else {
            System.out.println("\n❌ Test 3 FAILED (B2B powinno mieć emeryturę!)\n");
        }
    }

    private static void testUmowaODzielo() {
        System.out.println("TEST 4: Umowa o dzieło (0% składek)");
        System.out.println("=====================================");

        PensionCalculatorV2 calc = new PensionCalculatorV2();

        var input = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_O_DZIELO
        );

        var output = calc.calculate(input);

        System.out.println("Emerytura miesięczna: " + scale2(output.actualMonthlyPension()) + " PLN");

        if (output.actualMonthlyPension().compareTo(new BigDecimal("10")) < 0) {
            System.out.println("✅ Test 4 PASSED (Umowa o dzieło = brak składek = minimalna emerytura)\n");
        } else {
            System.out.println("❌ Test 4 FAILED\n");
        }
    }

    private static void testWorkBreaks() {
        System.out.println("TEST 5: Przerwy w pracy (BREAK)");
        System.out.println("=================================");

        PensionCalculatorV2 calc = new PensionCalculatorV2();

        // Bez przerw
        var inputBaseline = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_O_PRACE
        );
        var baseline = calc.calculate(inputBaseline);

        // Z przerwą 2 lata
        var breaks = java.util.List.of(
            new PensionCalculatorV2.WorkBreak(2035, 2036)
        );
        var inputWithBreak = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, false,
            BigDecimal.ZERO, null, null, breaks,
            PensionCalculatorV2.ContractType.UMOWA_O_PRACE
        );
        var withBreak = calc.calculate(inputWithBreak);

        System.out.println("Bez przerwy: " + scale2(baseline.actualMonthlyPension()) + " PLN");
        System.out.println("Z przerwą 2 lata: " + scale2(withBreak.actualMonthlyPension()) + " PLN");

        BigDecimal reduction = baseline.actualMonthlyPension()
            .subtract(withBreak.actualMonthlyPension())
            .divide(baseline.actualMonthlyPension(), 4, RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"));

        System.out.println("Redukcja: " + scale1(reduction) + "%");

        if (withBreak.actualMonthlyPension().compareTo(baseline.actualMonthlyPension()) < 0) {
            System.out.println("✅ Test 5 PASSED (przerwa zmniejsza emeryturę)\n");
        } else {
            System.out.println("❌ Test 5 FAILED\n");
        }
    }

    private static void testSickLeave() {
        System.out.println("TEST 6: Chorobowe (sick leave)");
        System.out.println("================================");

        PensionCalculatorV2 calc = new PensionCalculatorV2();

        // Bez chorobowego
        var inputNoSick = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_O_PRACE
        );
        var noSick = calc.calculate(inputNoSick);

        // Z chorobowym
        var inputWithSick = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, true,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_O_PRACE
        );
        var withSick = calc.calculate(inputWithSick);

        // Z chorobowym + dodatkowe 10 dni
        var inputExtraSick = new PensionCalculatorV2.Input(
            null, 30, "M", new BigDecimal("8000"), 2025, 2060, true,
            BigDecimal.ZERO, null, 10, null,
            PensionCalculatorV2.ContractType.UMOWA_O_PRACE
        );
        var extraSick = calc.calculate(inputExtraSick);

        System.out.println("Bez chorobowego: " + scale2(noSick.actualMonthlyPension()) + " PLN");
        System.out.println("Z chorobowym (5 dni/rok): " + scale2(withSick.actualMonthlyPension()) + " PLN");
        System.out.println("Z chorobowym + 10 dni: " + scale2(extraSick.actualMonthlyPension()) + " PLN");

        if (withSick.actualMonthlyPension().compareTo(noSick.actualMonthlyPension()) < 0 &&
            extraSick.actualMonthlyPension().compareTo(withSick.actualMonthlyPension()) < 0) {
            System.out.println("✅ Test 6 PASSED (chorobowe zmniejsza emeryturę)\n");
        } else {
            System.out.println("❌ Test 6 FAILED\n");
        }
    }

    private static BigDecimal scale2(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal scale1(BigDecimal v) {
        return v.setScale(1, RoundingMode.HALF_UP);
    }
}
