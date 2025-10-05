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
            // 1) System kapitałowy
            "ZUS prowadzi indywidualne konto emerytalne, na którym ewidencjonuje Twoje składki oraz ich coroczną waloryzację.",

            // 2) Subkonto
            "Oprócz konta głównego masz w ZUS tzw. subkonto – trafiają tam m.in. środki przeniesione z OFE oraz część składek po 2011 r.",

            // 3) Waloryzacja roczna
            "Zapisane na koncie środki są co roku waloryzowane – waloryzacja zwiększa zapis księgowy, nie jest realnym przelewem pieniędzy.",

            // 4) Waloryzacja świadczeń
            "Wypłacane emerytury podlegają corocznej waloryzacji – zwykle od marca – aby ograniczać wpływ inflacji na realną wartość świadczeń.",

            // 5) Kapitał początkowy
            "Osoby pracujące przed 1999 r. mają ustalany kapitał początkowy, który odtwarza historyczny staż i zarobki sprzed reformy.",

            // 6) Wiek emerytalny
            "Podstawowy wiek emerytalny w Polsce wynosi 60 lat dla kobiet i 65 lat dla mężczyzn (ustawowy wiek powszechny).",

            // 7) Minimalna emerytura
            "Minimalna emerytura przysługuje po spełnieniu warunku stażowego – wymagane są odpowiednie lata okresów składkowych i nieskładkowych.",

            // 8) Okresy nieskładkowe
            "Do stażu emerytalnego dolicza się okresy nieskładkowe (np. studia, chorobowe), ale liczą się one tylko w określonej proporcji.",

            // 9) 13. emerytura
            "Tzw. 13. emerytura to dodatkowe roczne świadczenie wypłacane co do zasady wszystkim uprawnionym do emerytur z ZUS.",

            // 10) 14. emerytura
            "14. emerytura ma próg dochodowy i zasadę „złotówka za złotówkę” – pełna kwota przysługuje do określonego poziomu świadczenia.",

            // 11) Emerytura a praca
            "Po osiągnięciu wieku emerytalnego możesz dorabiać bez limitów – przed osiągnięciem wieku limity przychodu mogą zmniejszać lub zawieszać świadczenie.",

            // 12) Emerytura a podatki
            "Emerytura jest opodatkowana podatkiem dochodowym oraz objęta składką zdrowotną – ZUS rozlicza zaliczki i potrącenia automatycznie.",

            // 13) Świadczenia rodzinne
            "Po śmierci ubezpieczonego bliscy mogą mieć prawo do renty rodzinnej – świadczenie przysługuje m.in. małżonkowi i dzieciom w określonych warunkach.",

            // 14) Przeliczenie emerytury
            "ZUS może przeliczyć emeryturę po dołożeniu nowych okresów składkowych lub dokumentów płac – wniosek warto złożyć, gdy masz nowe dowody zarobków.",

            // 15) Emerytura i staż
            "Wysokość emerytury zależy od sumy zwaloryzowanych składek i statystycznego dalszego trwania życia – dłuższa praca zwykle zwiększa świadczenie.",

            // 16) Dalsze trwanie życia
            "Dzielnik emerytalny opiera się na prognozowanym dalszym trwaniu życia – im dłuższy przewidywany okres pobierania, tym niższe świadczenie miesięczne.",

            // 17) Koordynacja UE
            "Jeśli pracowałeś w kilku krajach UE/EOG, okresy ubezpieczenia można łączyć – ZUS koordynuje świadczenia z instytucjami zagranicznymi.",

            // 18) ZUS PUE
            "Przez Platformę Usług Elektronicznych (PUE) sprawdzisz stan konta, historię składek, złożysz wnioski i korespondujesz z ZUS online.",

            // 19) Historia składek
            "Na PUE ZUS w zakładce „Informacje o stanie konta ubezpieczonego” zobaczysz, ile składek wpłynęło na Twoje konto i subkonto.",

            // 20) Świadczenie przedemerytalne
            "Osobom, które utraciły pracę i spełniają określone warunki, może przysługiwać świadczenie przedemerytalne – to nie jest emerytura.",

            // 21) ZUS a OFE
            "Po 2014 r. część środków z OFE została zapisana na subkontach w ZUS; subkonto jest dziedziczone na zasadach określonych w przepisach.",

            // 22) Dziedziczenie subkonta
            "Środki na subkoncie podlegają podziałowi w razie rozwodu oraz są dziedziczone – można wskazać osoby uprawnione.",

            // 23) Emerytura a urlopy
            "Okresy urlopu macierzyńskiego/rodzicielskiego są traktowane jako okresy składkowe – budują staż emerytalny.",

            // 24) Umowy cywilne
            "Zlecenie co do zasady podlega ubezpieczeniom społecznym, ale dzieło nie – to wpływa na przyszłą emeryturę (brak składek = brak kapitału).",

            // 25) 30-krotność
            "Składki emerytalno-rentowe mają roczny limit podstawy: tzw. 30-krotność przeciętnego wynagrodzenia – po osiągnięciu limitu składek nie pobiera się.",

            // 26) Emerytura minimalna a staż
            "Brak wymaganego stażu może oznaczać emeryturę niższą niż minimalna – wtedy minimalna nie przysługuje z automatu.",

            // 27) Uzupełnianie dokumentów
            "Warto dbać o komplet dokumentów płacowych (np. Rp-7). Lepsze udokumentowanie zarobków sprzed 1999 r. może podnieść kapitał początkowy.",

            // 28) Termin wypłaty
            "ZUS wypłaca świadczenia w ustalonych terminach w miesiącu – dzień wypłaty zależy m.in. od przydzielonego terminu dla danej grupy.",

            // 29) Wybór rachunku
            "Emeryturę można otrzymywać na rachunek bankowy lub przekazem pocztowym – wybór formy wpływa na ewentualne koszty i wygodę.",

            // 30) ZUS a PPK/PPE
            "System ZUS to filar publiczny; PPK i PPE to dobrowolne programy oszczędzania w III filarze – środki z PPK/PPE są prywatne i odrębne od ZUS.",

            // 31) Ulga dla seniorów (PIT-0)
            "Osoby, które osiągnęły wiek emerytalny, ale nie pobierają świadczenia i pracują, mogą korzystać z tzw. PIT-0 dla seniorów – to ulga podatkowa.",

            // 32) Praca na emeryturze a składki
            "Jeśli pracujesz już na emeryturze i odprowadzane są składki, możesz wnioskować o przeliczenie świadczenia z uwzględnieniem nowych okresów.",

            // 33) Emerytura częściowa
            "W polskim systemie nie funkcjonuje powszechna „emerytura częściowa” – przejście na świadczenie następuje po spełnieniu warunków ustawowych.",

            // 34) Renta z tytułu niezdolności
            "Niezdolność do pracy może uprawniać do renty – świadczenie to jest inne niż emerytura i ma własne kryteria medyczne oraz stażowe.",

            // 35) Okresy składkowe z zagranicy
            "Praca poza UE może być również zaliczona – zależy to od umów o zabezpieczeniu społecznym między Polską a danym państwem.",

            // 36) Zgłoszenia i kody
            "Pracodawcy zgłaszają ubezpieczonych do ZUS odpowiednimi kodami tytułu ubezpieczenia – od tego zależy zakres składek i uprawnień.",

            // 37) Świadczenia a rozwód
            "Podział majątku małżonków może obejmować środki z subkonta w ZUS – prawo przewiduje mechanizm podziału w razie rozwodu.",

            // 38) ZUS a KRUS
            "System KRUS dotyczy rolników i ma odrębne zasady – przechodzenie między ZUS a KRUS jest możliwe, ale wymaga spełnienia warunków.",

            // 39) Emerytura pomostowa
            "Niektóre zawody mogą uprawniać do emerytur pomostowych – dotyczy to prac w szczególnych warunkach lub o szczególnym charakterze.",

            // 40) Odwołanie od decyzji
            "Od decyzji ZUS przysługuje odwołanie do sądu – warto dołączyć dokumenty i argumenty, które mogą zmienić rozstrzygnięcie.",

            // 41) Emerytura a staż „brutto”
            "Do stażu emerytalnego wlicza się okresy składkowe i nieskładkowe – ale nieskładkowe liczą się zwykle w ograniczonym wymiarze.",

            // 42) Waloryzacja kapitału początkowego
            "Ustalony kapitał początkowy także podlega waloryzacji – dzięki temu rośnie razem z kontem głównym.",

            // 43) Dorabianie przed wiekiem
            "Przed osiągnięciem wieku emerytalnego dorabianie podlega limtom przychodu – przekroczenie progów może zmniejszyć albo zawiesić świadczenie.",

            // 44) Emerytura a działalność
            "Prowadzenie działalności gospodarczej wiąże się z obowiązkiem ubezpieczeń społecznych – preferencje (np. „mały ZUS”) wpływają na przyszłą emeryturę.",

            // 45) Emerytura nauczycielska
            "Część nauczycieli może korzystać z odrębnych rozwiązań emerytalnych – wynikają one ze specustaw i przepisów branżowych.",

            // 46) Wskaźniki roczne
            "ZUS co roku publikuje wskaźniki do obliczeń (np. roczne wskaźniki waloryzacji, tablice trwania życia) – są one kluczowe w kalkulacjach.",

            // 47) Data nabycia prawa
            "Prawo do emerytury nabywa się z dniem spełnienia warunków – wniosek można złożyć wcześniej, ale świadczenie przysługuje od spełnienia warunków.",

            // 48) Wybór momentu przejścia
            "Każdy dodatkowy miesiąc pracy po spełnieniu warunków zwykle podnosi emeryturę – rośnie kapitał, a dzielnik może maleć.",

            // 49) Dokumenty elektroniczne
            "Coraz więcej spraw emerytalnych można załatwić elektronicznie – profil zaufany i PUE ZUS znacząco ułatwiają formalności.",

            // 50) Ustalenie stażu automatycznie
            "ZUS korzysta z danych z kont płatników i rejestrów – część stażu ustala się automatycznie, ale dokumenty historyczne warto uzupełniać samemu.",

            // 51) Renta rodzinna a nauka
            "Dzieci uprawnione do renty rodzinnej mogą pobierać świadczenie do ukończenia nauki – są limity wieku i wymogi potwierdzania kontynuacji nauki.",

            // 52) Przeliczanie po roku pracy
            "Po przepracowaniu pełnego roku kalendarzowego na emeryturze można wystąpić o przeliczenie świadczenia – dolicza się nowe składki.",

            // 53) Emerytura a urlop wychowawczy
            "Okres urlopu wychowawczego jest okresem nieskładkowym – wpływa na staż, ale w ograniczonej części.",

            // 54) ZUS a PIT-11A/40A
            "ZUS wystawia emerytom i rencistom informacje podatkowe (np. PIT-40A/PIT-11A) – służą do rozliczenia rocznego.",

            // 55) Świadczenia a egzekucja
            "Emerytura może podlegać egzekucji komorniczej, ale obowiązują limity potrąceń i kwoty wolne, które chronią część świadczenia.",

            // 56) Emerytura a rozwód – alimenty
            "Renta rodzinna po osobie zmarłej nie wygasa z powodu rozwodu rodziców – liczą się przesłanki ustawowe, a nie status małżeński dziecka.",

            // 57) Ustalenie kapitału po latach
            "Kapitał początkowy można ustalić także po latach – warto to zrobić przed złożeniem wniosku o emeryturę, by uniknąć opóźnień.",

            // 58) Emerytura z kilku tytułów
            "Co do zasady świadczenia emerytalne nie sumują się – przepisy określają, który tytuł jest dominujący w wypłacie.",

            // 59) ZUS a adres korespondencyjny
            "Zmiana adresu lub numeru konta wymaga poinformowania ZUS – to kluczowe dla terminowej wypłaty i korespondencji.",

            // 60) Symulacje a rzeczywistość
            "Szacunki kalkulatorów różnią się od decyzji ZUS – decydują aktualne wskaźniki, tablice życia oraz komplet dowodów i dokumentów."
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
