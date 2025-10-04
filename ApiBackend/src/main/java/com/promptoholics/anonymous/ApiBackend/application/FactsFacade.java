package com.promptoholics.anonymous.ApiBackend.application;

import com.promptoholics.anonymous.ApiBackend.schemas.dtos.FactDto;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

@Component
public class FactsFacade {

    private final Random random = new Random();

    private static final List<String> FACTS_PL = List.of(
            // 1) Rekordowa emerytura
            "Czy wiesz, że najwyższą emeryturę w Polsce pobiera mieszkaniec województwa śląskiego? " +
                    "Co miesiąc otrzymuje ponad 51 tys. zł brutto, a na emeryturę przeszedł po 62 latach i 5 miesiącach pracy, bez zwolnień lekarskich " +
                    "(źródło: Bankier, 23.09.2025; Business Insider, 20.09.2023).",

            // 2) Średnia emerytura
            "Przeciętna emerytura (I–VI 2025) wyniosła 3 986,91 zł brutto — o 9,1% więcej r/r " +
                    "(źródło: TVN24 za ZUS, 16.09.2025).",

            // 3) Ilu mamy emerytów
            "W maju 2025 r. ZUS wypłacał świadczenia 6,366 mln emerytów — to wyraźny wzrost rok do roku " +
                    "(źródło: Money.pl, 18.07.2025).",

            // 4) Ile osób ma wysokie świadczenia
            "Po marcowej waloryzacji 2025 r. liczba osób z emeryturą powyżej 7 tys. zł wzrosła do ok. 622,7 tys. " +
                    "(źródło: Prawo.pl na podstawie danych ZUS, 22.05.2025).",

            // 5) 13. emerytura
            "13. emerytura w 2025 r. wyniosła 1 878,91 zł brutto (równa minimalnej emeryturze); ZUS wypłaca ją w kwietniu " +
                    "(źródła: Infor, 24.04.2025; Onet, 11.04.2025).",

            // 6) 14. emerytura
            "14. emerytura w 2025 r. to maksymalnie 1 878,91 zł brutto (pełna kwota dla świadczeń do 2 900 zł brutto; powyżej działa zasada „złotówka za złotówkę”). " +
                    "(źródła: ZUS, komunikat 19.08.2025; Infor, 15.09.2025)."
    );

    private static final List<String> FACTS_EN = List.of(
            "Poland’s highest pension is paid to a resident of Silesia: over PLN 51,000 gross per month; he retired after 62 years and 5 months of work with no sick leave (sources: Bankier 2025-09-23; Business Insider 2023-09-20).",
            "The average Polish pension in H1 2025 was PLN 3,986.91 gross, up 9.1% y/y (source: TVN24 citing ZUS, 2025-09-16).",
            "ZUS paid pensions to 6.366 million people in May 2025 (source: Money.pl, 2025-07-18).",
            "After the March 2025 indexation, c. 622.7k people received pensions above PLN 7,000 (source: Prawo.pl based on ZUS, 2025-05-22).",
            "The 13th pension in 2025 equaled the minimum pension: PLN 1,878.91 gross (sources: Infor 2025-04-24; Onet 2025-04-11).",
            "The 14th pension in 2025: up to PLN 1,878.91 gross (full amount for main benefits up to PLN 2,900; ‘zloty-for-zloty’ reduction above that; sources: ZUS 2025-08-19; Infor 2025-09-15)."
    );

    public FactDto getRandomFact(String locale) {
        final boolean polish = isPolish(locale);
        final List<String> pool = polish ? FACTS_PL : FACTS_EN;

        String text = pool.get(random.nextInt(pool.size()));

        FactDto dto = new FactDto();
        dto.setId(UUID.randomUUID().toString());
        dto.setText(text);
        dto.setGeneratedAt(OffsetDateTime.now());

        return dto;
    }

    private boolean isPolish(String locale) {
        if (locale == null || locale.isBlank()) return true;
        Locale l = Locale.forLanguageTag(locale);
        String lang = l.getLanguage();
        return lang.isBlank() || lang.equalsIgnoreCase("pl");
    }
}
