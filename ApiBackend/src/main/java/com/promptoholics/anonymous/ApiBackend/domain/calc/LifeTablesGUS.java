package com.promptoholics.anonymous.ApiBackend.domain.calc;

import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;

/**
 * Dalsze trwanie życia (miesiące) wg płci i roku przejścia.
 * - Punkty kontrolne z OFICJALNYCH TABLIC GUS + interpolacja liniowa.
 * - Dane aktualne na 2024/2025 z komunikatów GUS.
 *
 * Źródła:
 * - GUS komunikat 26.03.2024: https://stat.gov.pl/sygnalne/komunikaty-i-obwieszczenia/lista-komunikatow-i-obwieszczen/komunikat-w-sprawie-tablicy-sredniego-dalszego-trwania-zycia-kobiet-i-mezczyzn,285,13.html
 * - Zaktualizowano: 2025-10-05
 */
public class LifeTablesGUS {

    private final NavigableMap<Integer, Integer> maleMonths = new TreeMap<>();
    private final NavigableMap<Integer, Integer> femaleMonths = new TreeMap<>();

    public LifeTablesGUS() {
        // ---- PUNKTY KONTROLNE - OFICJALNE DANE GUS ----

        // Mężczyźni (wiek emerytalny 65 lat)
        // GUS 2024: 218.9 miesięcy (18.24 lat) dla 65-latków
        // GUS 2025: 220.8 miesięcy (18.40 lat) dla 65-latków
        maleMonths.put(2024, 219); // 218.9 rounded
        maleMonths.put(2025, 221); // 220.8 rounded
        // Projekcje (trend wzrostowy ~0.5-1 miesiąc/rok)
        maleMonths.put(2030, 225);
        maleMonths.put(2040, 234);
        maleMonths.put(2050, 243);
        maleMonths.put(2060, 252);
        maleMonths.put(2070, 261);
        maleMonths.put(2080, 270);

        // Kobiety (wiek emerytalny 60 lat)
        // GUS 2024: 264.2 miesięcy (22.02 lat) dla 60-latek
        // GUS 2025: 266.4 miesięcy (22.20 lat) dla 60-latek
        femaleMonths.put(2024, 264); // 264.2 rounded
        femaleMonths.put(2025, 266); // 266.4 rounded
        // Projekcje (trend wzrostowy ~0.3-0.5 miesiąc/rok - wolniejszy niż mężczyźni)
        femaleMonths.put(2030, 269);
        femaleMonths.put(2040, 273);
        femaleMonths.put(2050, 277);
        femaleMonths.put(2060, 281);
        femaleMonths.put(2070, 285);
        femaleMonths.put(2080, 289);
    }

    /** Zwraca liczbę miesięcy dalszego trwania życia (płeć × rok) z interpolacją. */
    public int months(String sex, int retirementYear) {
        NavigableMap<Integer, Integer> table = "M".equalsIgnoreCase(sex) ? maleMonths : femaleMonths;
        Map.Entry<Integer, Integer> floor = table.floorEntry(retirementYear);
        Map.Entry<Integer, Integer> ceil  = table.ceilingEntry(retirementYear);

        if (floor == null && ceil == null) {
            return "M".equalsIgnoreCase(sex) ? 240 : 260; // bezpieczna stała
        }
        if (floor != null && ceil != null) {
            if (floor.getKey().equals(ceil.getKey())) return floor.getValue();
            int y0 = floor.getKey(), m0 = floor.getValue();
            int y1 = ceil.getKey(),  m1 = ceil.getValue();
            if (y1 == y0) return m0;
            double t = (retirementYear - y0) / (double)(y1 - y0);
            return (int)Math.round(m0 + t * (m1 - m0));
        }
        return (floor == null ? ceil.getValue() : floor.getValue());
    }
}
