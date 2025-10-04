package com.promptoholics.anonymous.ApiBackend.domain.calc;

import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;

/**
 * Dalsze trwanie życia (miesiące) wg płci i roku przejścia.
 * - Punkty kontrolne + interpolacja liniowa.
 * - Podmień wartości na oficjalne tablice GUS lub wstrzyknij z konfiguracji/DB.
 */
public class LifeTablesGUS {

    private final NavigableMap<Integer, Integer> maleMonths = new TreeMap<>();
    private final NavigableMap<Integer, Integer> femaleMonths = new TreeMap<>();

    public LifeTablesGUS() {
        // ---- PUNKTY KONTROLNE (placeholder – podmień na oficjalne GUS) ----
        // Mężczyźni (~65 lat): ~216 mies. w 2025 (18 lat), delikatny trend wzrostowy
        maleMonths.put(2025, 216);
        maleMonths.put(2030, 220);
        maleMonths.put(2040, 224);
        maleMonths.put(2050, 228);
        maleMonths.put(2060, 232);
        maleMonths.put(2070, 236);
        maleMonths.put(2080, 240);

        // Kobiety (~60 lat): ~264 mies. w 2025 (22 lata), wolniejszy trend
        femaleMonths.put(2025, 264);
        femaleMonths.put(2030, 266);
        femaleMonths.put(2040, 268);
        femaleMonths.put(2050, 270);
        femaleMonths.put(2060, 272);
        femaleMonths.put(2070, 274);
        femaleMonths.put(2080, 276);
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
