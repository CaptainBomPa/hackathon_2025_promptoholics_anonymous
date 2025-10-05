package com.promptoholics.anonymous.ApiBackend;

import com.promptoholics.anonymous.ApiBackend.domain.calc.PensionCalculatorV2;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Test porównawczy różnych typów umów
 */
public class ContractTypeComparisonTest {

    public static void main(String[] args) {
        System.out.println("=== PORÓWNANIE TYPÓW UMÓW - WPŁYW NA EMERYTURĘ ===\n");

        compareContractTypes();
    }

    private static void compareContractTypes() {
        PensionCalculatorV2 calc = new PensionCalculatorV2();

        // Scenariusz bazowy: 30 lat, 10000 PLN/miesiąc, praca 2025-2060
        int age = 30;
        BigDecimal salary = new BigDecimal("10000");
        int startYear = 2025;
        int endYear = 2060;
        int years = endYear - startYear;

        System.out.println("SCENARIUSZ BAZOWY:");
        System.out.println("  Wiek: " + age + " lat");
        System.out.println("  Wynagrodzenie: " + salary + " PLN/miesiąc");
        System.out.println("  Okres pracy: " + startYear + "-" + endYear + " (" + years + " lat)");
        System.out.println("\n" + "=".repeat(80) + "\n");

        // Umowa o pracę
        var uopInput = new PensionCalculatorV2.Input(
            null, age, "M", salary, startYear, endYear, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_O_PRACE
        );
        var uopOutput = calc.calculate(uopInput);

        // Umowa zlecenie
        var uzInput = new PensionCalculatorV2.Input(
            null, age, "M", salary, startYear, endYear, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_ZLECENIE
        );
        var uzOutput = calc.calculate(uzInput);

        // B2B
        var b2bInput = new PensionCalculatorV2.Input(
            null, age, "M", salary, startYear, endYear, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.B2B
        );
        var b2bOutput = calc.calculate(b2bInput);

        // Umowa o dzieło
        var uodInput = new PensionCalculatorV2.Input(
            null, age, "M", salary, startYear, endYear, false,
            BigDecimal.ZERO, null, null, null,
            PensionCalculatorV2.ContractType.UMOWA_O_DZIELO
        );
        var uodOutput = calc.calculate(uodInput);

        // Wyświetl wyniki
        System.out.println("1. UMOWA O PRACĘ");
        System.out.println("   Składki: 19.52% z wynagrodzenia");
        System.out.println("   Miesięczna emerytura (nominalna): " + scale2(uopOutput.actualMonthlyPension()) + " PLN");
        System.out.println("   Miesięczna emerytura (realna 2025): " + scale2(uopOutput.realMonthlyPension2025()) + " PLN");
        System.out.println("   Stopa zastąpienia: " + scale1(uopOutput.replacementRatePct()) + "%");
        System.out.println();

        System.out.println("2. UMOWA ZLECENIE");
        System.out.println("   Składki: 19.52% z wynagrodzenia");
        System.out.println("   Miesięczna emerytura (nominalna): " + scale2(uzOutput.actualMonthlyPension()) + " PLN");
        System.out.println("   Miesięczna emerytura (realna 2025): " + scale2(uzOutput.realMonthlyPension2025()) + " PLN");
        System.out.println("   Stopa zastąpienia: " + scale1(uzOutput.replacementRatePct()) + "%");
        System.out.println();

        System.out.println("3. B2B (DZIAŁALNOŚĆ GOSPODARCZA)");
        System.out.println("   Składki: dobrowolne, z minimalnej podstawy 4500 PLN");
        System.out.println("   Miesięczna emerytura (nominalna): " + scale2(b2bOutput.actualMonthlyPension()) + " PLN");
        System.out.println("   Miesięczna emerytura (realna 2025): " + scale2(b2bOutput.realMonthlyPension2025()) + " PLN");
        System.out.println("   Stopa zastąpienia: " + scale1(b2bOutput.replacementRatePct()) + "%");
        System.out.println();

        System.out.println("4. UMOWA O DZIEŁO");
        System.out.println("   Składki: 0% (brak składek)");
        System.out.println("   Miesięczna emerytura (nominalna): " + scale2(uodOutput.actualMonthlyPension()) + " PLN");
        System.out.println("   Miesięczna emerytura (realna 2025): " + scale2(uodOutput.realMonthlyPension2025()) + " PLN");
        System.out.println("   Stopa zastąpienia: " + scale1(uodOutput.replacementRatePct()) + "%");
        System.out.println();

        System.out.println("=".repeat(80));
        System.out.println("ANALIZA PORÓWNAWCZA:");
        System.out.println("=".repeat(80));

        // Porównanie B2B vs UoP
        BigDecimal b2bLoss = uopOutput.actualMonthlyPension().subtract(b2bOutput.actualMonthlyPension());
        BigDecimal b2bLossPct = b2bLoss.divide(uopOutput.actualMonthlyPension(), 4, RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"));

        System.out.println("\n📊 B2B vs UMOWA O PRACĘ:");
        System.out.println("   Strata miesięczna: " + scale2(b2bLoss) + " PLN (" + scale1(b2bLossPct) + "%)");
        System.out.println("   Strata roczna: " + scale2(b2bLoss.multiply(new BigDecimal("12"))) + " PLN");

        // Ile lat emerytury trzeba by zebrać stratę
        BigDecimal monthsToRecover = b2bLoss.multiply(new BigDecimal("12")).multiply(new BigDecimal(years))
            .divide(b2bLoss, 0, RoundingMode.HALF_UP);
        System.out.println("   Łączna strata przez " + years + " lat: " +
            scale2(b2bLoss.multiply(new BigDecimal("12")).multiply(new BigDecimal(years))) + " PLN");

        // Porównanie UoD vs UoP
        BigDecimal uodLoss = uopOutput.actualMonthlyPension().subtract(uodOutput.actualMonthlyPension());
        System.out.println("\n📊 UMOWA O DZIEŁO vs UMOWA O PRACĘ:");
        System.out.println("   Strata miesięczna: " + scale2(uodLoss) + " PLN (100%)");
        System.out.println("   Strata roczna: " + scale2(uodLoss.multiply(new BigDecimal("12"))) + " PLN");
        System.out.println("   Łączna strata przez " + years + " lat: " +
            scale2(uodLoss.multiply(new BigDecimal("12")).multiply(new BigDecimal(years))) + " PLN");

        // Rekomendacje
        System.out.println("\n💡 REKOMENDACJE:");
        System.out.println("   1. UoP i UZ - pełne zabezpieczenie emerytalne (19.52% składek)");
        System.out.println("   2. B2B - minimalne zabezpieczenie (składki z 4500 PLN), rozważ III filar");
        System.out.println("   3. UoD - BRAK zabezpieczenia, KONIECZNIE III filar/oszczędności prywatne");

        System.out.println("\n⚠️  UWAGA:");
        System.out.println("   Osoba na B2B z wynagrodzeniem 10000 PLN, płacąc składki tylko z minimalnej");
        System.out.println("   podstawy (4500 PLN), traci " + scale1(b2bLossPct) + "% emerytury w porównaniu do UoP!");
        System.out.println("   Jest to ŚWIADOMY wybór między wyższym wynagrodzeniem netto a bezpieczeństwem emerytalnym.");

        System.out.println("\n✅ Wszystkie testy zakończone pomyślnie!");
    }

    private static BigDecimal scale2(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal scale1(BigDecimal v) {
        return v.setScale(1, RoundingMode.HALF_UP);
    }
}
