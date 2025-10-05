package com.promptoholics.anonymous.ApiBackend.domain.calc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

/**
 * Serie ZUS używane w kalkulatorze:
 * - Wskaźniki waloryzacji KONTA (roczne) - OFICJALNE DANE ZUS 2000-2024,
 * - Wskaźniki waloryzacji SUBKONTA (kwartalne; roczny mnożnik = iloczyn Q1..Q4) - OFICJALNE DANE ZUS,
 * - Przeciętne wynagrodzenie miesięczne (roczne) - OFICJALNE DANE GUS 2024-2025, dalej projekcja.
 *
 * Źródła danych:
 * - Wskaźniki ZUS: https://wskazniki.gofin.pl/
 * - Przeciętne wynagrodzenia GUS: https://stat.gov.pl/
 * - Zaktualizowano: 2025-10-05
 */
public class ZUSMacroSeries {

    private final Map<Integer, BigDecimal> accountAnnualIndex = new HashMap<>();
    private final Map<String, BigDecimal> subaccountQuarterIndex = new HashMap<>();
    private final Map<Integer, BigDecimal> avgWageMonthly = new HashMap<>();

    public ZUSMacroSeries() {
        // --- KONTO: waloryzacja roczna 2000–2024 (OFICJALNE DANE ZUS) ---
        // Źródło: https://wskazniki.gofin.pl/wskaznik/379/
        putAnnual(2000, "112.72"); putAnnual(2001, "106.68"); putAnnual(2002, "101.90");
        putAnnual(2003, "102.00"); putAnnual(2004, "103.63"); putAnnual(2005, "105.55");
        putAnnual(2006, "106.90"); putAnnual(2007, "112.85"); putAnnual(2008, "116.26");
        putAnnual(2009, "107.22"); putAnnual(2010, "103.98"); putAnnual(2011, "105.18");
        putAnnual(2012, "104.68"); putAnnual(2013, "104.54"); putAnnual(2014, "102.06");
        putAnnual(2015, "105.37"); putAnnual(2016, "106.37"); putAnnual(2017, "108.68");
        putAnnual(2018, "109.20"); putAnnual(2019, "108.94"); putAnnual(2020, "105.41");
        putAnnual(2021, "109.33"); putAnnual(2022, "114.40"); putAnnual(2023, "114.87");
        putAnnual(2024, "114.41");

        // --- SUBKONTO: kwartalne wskaźniki (OFICJALNE DANE ZUS) ---
        // Źródło: https://wskazniki.gofin.pl/8,378,2/
        // 2024
        putQuarter(2024, 1, "112.48");
        putQuarter(2024, 2, "105.85");
        putQuarter(2024, 3, "101.60");
        putQuarter(2024, 4, "100.70");
        // 2025
        putQuarter(2025, 1, "111.60");
        putQuarter(2025, 2, "102.09");
        putQuarter(2025, 3, "101.50"); // estimated - do aktualizacji po publikacji
        putQuarter(2025, 4, "101.50"); // estimated - do aktualizacji po publikacji

        // --- Przeciętne wynagrodzenie miesięczne (PLN) - OFICJALNE DANE GUS ---
        // Źródło: https://stat.gov.pl/
        // 2024 - roczne przeciętne wynagrodzenie
        avgWageMonthly.put(2024, new BigDecimal("8181.72")); // GUS obwieszczenie 2024
        // 2025 - Q1 2025
        avgWageMonthly.put(2025, new BigDecimal("8962.28")); // GUS komunikat Q1 2025

        for (int y = 2026; y <= 2080; y++) {
            BigDecimal prev = avgWageMonthly.get(y - 1);
            BigDecimal growth = BigDecimal.ONE.add(new BigDecimal("0.025"))
                    .multiply(BigDecimal.ONE.add(new BigDecimal("0.029")));
            avgWageMonthly.put(y, prev.multiply(growth).setScale(2, RoundingMode.HALF_UP));
        }
    }

    /* === Public API === */
    public BigDecimal accountIndexFactor(int year) {
        return accountAnnualIndex.getOrDefault(year, factor("105.00"));
    }

    public BigDecimal subaccountIndexFactorYear(int year) {
        BigDecimal f = BigDecimal.ONE;
        for (int q = 1; q <= 4; q++) f = f.multiply(subaccountQuarterIndex.getOrDefault(key(year, q), BigDecimal.ONE));
        return f;
    }

    public BigDecimal averageMonthlyWage(int year) {
        return avgWageMonthly.getOrDefault(year, avgWageMonthly.get(2025));
    }

    /** Limit trzydziestokrotności (roczny) = 30 × prognozowane przeciętne wynagrodzenie miesięczne. */
    public BigDecimal limit30k(int year) {
        return averageMonthlyWage(year).multiply(new BigDecimal("30"));
    }

    /* === Helpers === */
    private static BigDecimal factor(String pct) { return new BigDecimal(pct).movePointLeft(2); } // "114.41" -> 1.1441
    private void putAnnual(int year, String pct) { accountAnnualIndex.put(year, factor(pct)); }
    private void putQuarter(int year, int q, String pct) { subaccountQuarterIndex.put(key(year, q), factor(pct)); }
    private static String key(int y, int q) { return y + "Q" + q; }
    private static BigDecimal avgOf(BigDecimal a, BigDecimal b) { return a.add(b).divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP); }
}
