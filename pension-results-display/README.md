# Pension Results Display Module

Moduł wyświetlania wyników symulacji emerytury - implementacja punktu 1.3 specyfikacji ZUS.

## 🎯 Cel projektu

Ten moduł skupia się na warstwie wizualnej prezentacji wyników symulacji emerytury. Implementuje wymagania z punktu 1.3 specyfikacji, koncentrując się na:

- Wyświetlaniu wysokości rzeczywistej i urealninej emerytury
- Porównaniu z średnimi świadczeniami
- Wizualizacji stopy zastąpienia
- Wpływie okresów chorobowych
- Korzyściach z odroczenia emerytury
- Porównaniu z oczekiwaniami użytkownika

## 🚀 Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev

# Build produkcyjny
npm run build

# Testy
npm run test
```

## 🎨 Design System

Projekt wykorzystuje kolorystykę zgodną z Księgą Znaku ZUS:

- **Primary**: #FFB34F (R: 255; G:179; B:79)
- **Success**: #009F3F (R: 0; G: 153; B: 63)
- **Info**: #3F84D2 (R: 63; G: 132; B: 210)
- **Dark**: #00416E (R: 0: G: 65; B: 110)
- **Error**: #F05E5E (R: 240; G: 94; B: 94)

## 📱 Funkcjonalności

### ✅ Zaimplementowane
- [x] Struktura projektu i konfiguracja
- [x] Typy danych TypeScript
- [x] Utilities formatowania i dostępności
- [x] Komponenty wyświetlania kwot emerytury
- [x] Porównanie kwot rzeczywistej i urealninej
- [x] Animacje i micro-interactions
- [x] Responsywny design
- [x] Zgodność z WCAG 2.0

### 🚧 W trakcie implementacji
- [ ] Porównanie ze średnią emeryturą
- [ ] Wskaźnik stopy zastąpienia
- [ ] Wpływ okresów chorobowych
- [ ] Korzyści z odroczenia emerytury
- [ ] Porównanie z oczekiwaniami
- [ ] Podsumowanie wyników

## 🏗️ Architektura

```
src/
├── components/           # Komponenty React
│   ├── PensionAmounts/  # Wyświetlanie kwot
│   ├── ComparisonMetrics/ # Metryki porównawcze
│   ├── SickLeaveImpact/ # Wpływ zwolnień
│   ├── RetirementDelay/ # Odroczenie emerytury
│   └── ...
├── hooks/               # Custom hooks
├── types/               # Definicje TypeScript
├── utils/               # Utilities
│   ├── formatting.ts    # Formatowanie
│   └── accessibility.ts # Dostępność
└── main.tsx            # Entry point
```

## 🎭 Demo

Aplikacja zawiera demo z przykładowymi danymi do testowania komponentów. Użyj przycisków w górnej części strony do:

- **Replay Animations**: Ponowne odtworzenie animacji
- **Nowe Dane**: Wygenerowanie nowych przykładowych danych

## 📊 Dane wejściowe

Moduł oczekuje danych w formacie:

```typescript
interface SimulationResults {
  realAmount: number;           // Wysokość rzeczywista
  adjustedAmount: number;       // Wysokość urealniona
  averagePensionAtRetirement: number;
  replacementRate: number;      // Stopa zastąpienia (%)
  // ... inne pola
}
```

## ♿ Dostępność

- Zgodność z WCAG 2.0 AA
- Obsługa czytników ekranu
- Nawigacja klawiaturą
- Wysokie kontrasty kolorów
- Wsparcie dla reduced motion

## 🔧 Technologie

- **React 18** + TypeScript
- **Material-UI 5** - komponenty UI
- **React Spring** - animacje
- **Chart.js** - wykresy (planowane)
- **React CountUp** - animowane liczniki
- **Vite** - bundler

## 📝 Status implementacji

Aktualnie zaimplementowane są podstawowe komponenty wyświetlania kwot emerytury. Kolejne funkcjonalności będą dodawane zgodnie z planem zadań w `.kiro/specs/pension-results-display/tasks.md`.