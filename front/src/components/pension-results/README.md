# Pension Results Display Components

This module implements the pension simulation results display as specified in point 1.3 of the app specification. It provides a comprehensive, accessible, and visually appealing interface for displaying pension calculation results.

## Components

### PensionResultsDisplay
Main container component that orchestrates the entire results display.

**Props:**
- `simulationResults` (SimulationResults) - Results from pension simulation
- `userExpectations` (UserExpectations) - User's initial expectations
- `loading` (boolean, optional) - Loading state
- `onNavigateToDetails` (function, optional) - Navigation callback

### PensionAmountCard
Displays individual pension amounts with animations and accessibility features.

**Props:**
- `amount` (number) - The pension amount to display
- `title` (string) - Card title
- `subtitle` (string, optional) - Card subtitle
- `type` ('real' | 'adjusted') - Type of pension amount
- `loading` (boolean, optional) - Loading state
- `animationDelay` (number, optional) - Animation delay in ms
- `onInfoClick` (function, optional) - Info button callback

### AmountComparison
Side-by-side comparison of real vs adjusted pension amounts.

**Props:**
- `realAmount` (number) - Real pension amount
- `adjustedAmount` (number) - Adjusted pension amount
- `loading` (boolean, optional) - Loading state
- `onInfoClick` (function, optional) - Info button callback

## Features

### Accessibility (WCAG 2.0 Compliant)
- Screen reader support with proper ARIA labels
- Keyboard navigation with logical tab order
- High contrast mode support
- Reduced motion preference support
- Focus management and skip links

### Animations
- CountUp animations for amount display
- Card entrance animations with react-spring
- Hover effects and smooth transitions
- Respects user's motion preferences

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Print-friendly styles

### ZUS Branding
- Official ZUS color palette
- Consistent typography and spacing
- Brand-compliant visual design

## Usage

```jsx
import { PensionResultsDisplay } from '../components/pension-results';

const simulationResults = {
  realAmount: 3500,
  adjustedAmount: 2800,
  averagePensionAtRetirement: 3200,
  replacementRate: 65,
  // ... other properties
};

const userExpectations = {
  expectedAmount: 4000,
  additionalWorkYearsNeeded: 2,
};

<PensionResultsDisplay
  simulationResults={simulationResults}
  userExpectations={userExpectations}
  loading={false}
  onNavigateToDetails={(type) => console.log(`Navigate to ${type}`)}
/>
```

## Data Types

### SimulationResults
```javascript
{
  realAmount: number,              // Rzeczywista wysokość emerytury
  adjustedAmount: number,          // Urealniona wysokość emerytury
  averagePensionAtRetirement: number, // Średnia wysokość emerytury w roku przejścia
  replacementRate: number,         // Stopa zastąpienia (w procentach)
  salaryWithoutSickLeave: number,  // Wynagrodzenie bez okresów chorobowych
  salaryWithSickLeave: number,     // Wynagrodzenie z okresami chorobowymi
  pensionWithoutSickLeave: number, // Emerytura bez okresów chorobowych
  pensionWithSickLeave: number,    // Emerytura z okresami chorobowymi
  delayBenefits: {
    oneYear: number,               // Korzyść z odroczenia o 1 rok
    twoYears: number,              // Korzyść z odroczenia o 2 lata
    fiveYears: number,             // Korzyść z odroczenia o 5 lat
  },
  retirementYear: number,          // Rok przejścia na emeryturę
  currentAge: number,              // Obecny wiek użytkownika
  includedSickLeave: boolean,      // Czy uwzględniono okresy chorobowe
}
```

### UserExpectations
```javascript
{
  expectedAmount: number,          // Oczekiwana wysokość emerytury
  additionalWorkYearsNeeded?: number, // Dodatkowe lata pracy potrzebne
}
```

## Dependencies

- React 19.1.1+
- Material-UI 7.3.3+
- react-countup (for amount animations)
- @react-spring/web (for component animations)

## Performance Optimizations

- React.memo for component memoization
- Lazy loading for heavy animation components
- Reduced motion preference support
- Optimized bundle size

## Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)
- Screen readers (NVDA, JAWS, VoiceOver)

## Testing

The components include comprehensive accessibility features and have been tested for:
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- Responsive design
- Animation performance

## Future Enhancements

The current implementation includes placeholders for:
- Detailed comparison with average pensions
- Replacement rate visualization
- Sick leave impact analysis
- Retirement delay benefits calculator
- Interactive charts and graphs