import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  alpha,
} from '@mui/material';
import AmountComparison from './AmountComparison';
import { zusColors } from '../../constants/zus-colors';
import './pension-results.css';

/**
 * @typedef {Object} SimulationResults
 * @property {number} realAmount - Rzeczywista wysokość emerytury
 * @property {number} adjustedAmount - Urealniona wysokość emerytury
 * @property {number} averagePensionAtRetirement - Średnia wysokość emerytury w roku przejścia
 * @property {number} replacementRate - Stopa zastąpienia (w procentach)
 * @property {number} salaryWithoutSickLeave - Wynagrodzenie bez okresów chorobowych
 * @property {number} salaryWithSickLeave - Wynagrodzenie z okresami chorobowymi
 * @property {number} pensionWithoutSickLeave - Emerytura bez okresów chorobowych
 * @property {number} pensionWithSickLeave - Emerytura z okresami chorobowymi
 * @property {Object} delayBenefits - Korzyści z odroczenia emerytury
 * @property {number} delayBenefits.oneYear - Korzyść z odroczenia o 1 rok
 * @property {number} delayBenefits.twoYears - Korzyść z odroczenia o 2 lata
 * @property {number} delayBenefits.fiveYears - Korzyść z odroczenia o 5 lat
 * @property {number} retirementYear - Rok przejścia na emeryturę
 * @property {number} currentAge - Obecny wiek użytkownika
 * @property {boolean} includedSickLeave - Czy uwzględniono okresy chorobowe
 */

/**
 * @typedef {Object} UserExpectations
 * @property {number} expectedAmount - Oczekiwana wysokość emerytury
 * @property {number} [additionalWorkYearsNeeded] - Dodatkowe lata pracy potrzebne
 */

/**
 * @typedef {Object} PensionResultsDisplayProps
 * @property {SimulationResults} simulationResults - Results from pension simulation
 * @property {UserExpectations} userExpectations - User's initial expectations
 * @property {boolean} [loading] - Whether the component is in loading state
 * @property {Function} [onNavigateToDetails] - Callback for navigation to details
 */

/**
 * PensionResultsDisplay is the main container component for displaying pension simulation results
 * Implements point 1.3 of the app specification
 * @param {PensionResultsDisplayProps} props
 * @returns {JSX.Element}
 */
const PensionResultsDisplay = React.memo(({
  simulationResults,
  userExpectations,
  loading = false,
  onNavigateToDetails,
}) => {
  const handleInfoClick = (type) => {
    console.log(`Info clicked for ${type} amount`);
    // Here you could open a modal or navigate to detailed explanation
    if (onNavigateToDetails) {
      onNavigateToDetails(type);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(zusColors.primary, 0.1)} 0%, ${alpha(zusColors.info, 0.1)} 100%)`,
          border: 1,
          borderColor: alpha(zusColors.primary, 0.2),
          textAlign: 'center',
        }}
        role="banner"
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: zusColors.dark,
            mb: 2,
          }}
        >
          Wyniki Symulacji Emerytury
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Oto prognoza Twojej przyszłej emerytury na podstawie wprowadzonych danych
        </Typography>
      </Paper>

      {/* Main Content */}
      <Box sx={{ mb: 4 }} role="main">
        <AmountComparison
          realAmount={simulationResults.realAmount}
          adjustedAmount={simulationResults.adjustedAmount}
          loading={loading}
          onInfoClick={handleInfoClick}
        />
      </Box>

      {/* Placeholder for additional sections */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: alpha(zusColors.neutral, 0.1),
          border: 1,
          borderColor: alpha(zusColors.neutral, 0.3),
          borderStyle: 'dashed',
        }}
        role="region"
        aria-label="Sekcje w trakcie implementacji"
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          🚧 W trakcie implementacji
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kolejne sekcje (porównanie ze średnią, stopa zastąpienia, wpływ zwolnień, 
          korzyści z odroczenia) będą dodane w następnych zadaniach.
        </Typography>
        
        {/* Preview of upcoming sections */}
        <Box sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Planowane sekcje:
          </Typography>
          <ul style={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            <li>Porównanie ze średnią emeryturą w {simulationResults.retirementYear} roku</li>
            <li>Stopa zastąpienia: {simulationResults.replacementRate}%</li>
            <li>Wpływ zwolnień lekarskich na wysokość emerytury</li>
            <li>Korzyści z odroczenia emerytury o 1, 2 i 5 lat</li>
            {userExpectations.additionalWorkYearsNeeded && (
              <li>Dodatkowe {userExpectations.additionalWorkYearsNeeded} lat pracy dla osiągnięcia oczekiwanej emerytury</li>
            )}
          </ul>
        </Box>
      </Paper>

      {/* Skip link for accessibility */}
      <a
        href="#main-navigation"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.target.style.position = 'static';
          e.target.style.left = 'auto';
          e.target.style.width = 'auto';
          e.target.style.height = 'auto';
          e.target.style.overflow = 'visible';
        }}
        onBlur={(e) => {
          e.target.style.position = 'absolute';
          e.target.style.left = '-10000px';
          e.target.style.width = '1px';
          e.target.style.height = '1px';
          e.target.style.overflow = 'hidden';
        }}
      >
        Przejdź do nawigacji głównej
      </a>
    </Container>
  );
});

export default PensionResultsDisplay;