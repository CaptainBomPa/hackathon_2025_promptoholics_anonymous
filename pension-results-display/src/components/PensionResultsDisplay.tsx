import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { AmountComparison } from './PensionAmounts';
import { PensionResultsDisplayProps } from '@/types';
import { zusColors } from '@/types';

const PensionResultsDisplay: React.FC<PensionResultsDisplayProps> = ({
  simulationResults,
  userExpectations,
  loading = false,
  onNavigateToDetails,
}) => {
  const theme = useTheme();

  const handleInfoClick = (type: 'real' | 'adjusted') => {
    console.log(`Info clicked for ${type} amount`);
    // Here you could open a modal or navigate to detailed explanation
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
      <Box sx={{ mb: 4 }}>
        <AmountComparison
          realAmount={simulationResults.realAmount}
          adjustedAmount={simulationResults.adjustedAmount}
          loading={loading}
          onInfoClick={handleInfoClick}
        />
      </Box>

      {/* Placeholder for other components */}
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
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          🚧 W trakcie implementacji
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kolejne sekcje (porównanie ze średnią, stopa zastąpienia, wpływ zwolnień, 
          korzyści z odroczenia) będą dodane w następnych zadaniach.
        </Typography>
      </Paper>
    </Container>
  );
};

export default PensionResultsDisplay;