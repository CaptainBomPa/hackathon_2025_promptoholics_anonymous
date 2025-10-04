import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  Slider,
  Alert,
} from '@mui/material';
import { useDashboard } from '../../../contexts/DashboardContext';

/**
 * Indexation Panel Component
 * Handles wage growth rate and inflation settings
 */
const IndexationPanel = () => {
  const { state, actions } = useDashboard();
  const { indexation } = state.parameters;
  const { errors } = state.uiState;

  const handleIndexationChange = (field, value) => {
    actions.updateIndexation({
      [field]: value,
    });
  };

  // Predefined scenarios for quick selection
  const scenarios = [
    { name: 'Konserwatywny', wage: 2.5, inflation: 2.0 },
    { name: 'Umiarkowany', wage: 3.5, inflation: 2.5 },
    { name: 'Optymistyczny', wage: 5.0, inflation: 3.0 },
  ];

  const applyScenario = (scenario) => {
    actions.updateIndexation({
      wageGrowthRate: scenario.wage,
      inflationRate: scenario.inflation,
    });
  };

  const realWageGrowth = indexation.wageGrowthRate - indexation.inflationRate;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Indeksacja i inflacja
      </Typography>

      <Grid container spacing={2}>
        {/* Wage Growth Rate */}
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            Wzrost płac: {indexation.wageGrowthRate}% rocznie
          </Typography>
          <Slider
            value={indexation.wageGrowthRate}
            onChange={(_, value) => handleIndexationChange('wageGrowthRate', value)}
            min={0}
            max={10}
            step={0.1}
            marks={[
              { value: 0, label: '0%' },
              { value: 2.5, label: '2.5%' },
              { value: 5, label: '5%' },
              { value: 7.5, label: '7.5%' },
              { value: 10, label: '10%' },
            ]}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Wzrost płac"
            type="number"
            value={indexation.wageGrowthRate || ''}
            onChange={(e) => handleIndexationChange('wageGrowthRate', Number(e.target.value))}
            error={!!errors.wageGrowthRate}
            helperText={errors.wageGrowthRate || 'Średni roczny wzrost wynagrodzeń'}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ min: 0, max: 20, step: 0.1 }}
          />
        </Grid>

        {/* Inflation Rate */}
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Inflacja: {indexation.inflationRate}% rocznie
          </Typography>
          <Slider
            value={indexation.inflationRate}
            onChange={(_, value) => handleIndexationChange('inflationRate', value)}
            min={0}
            max={8}
            step={0.1}
            marks={[
              { value: 0, label: '0%' },
              { value: 2, label: '2%' },
              { value: 4, label: '4%' },
              { value: 6, label: '6%' },
              { value: 8, label: '8%' },
            ]}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Inflacja"
            type="number"
            value={indexation.inflationRate || ''}
            onChange={(e) => handleIndexationChange('inflationRate', Number(e.target.value))}
            error={!!errors.inflationRate}
            helperText={errors.inflationRate || 'Średnia roczna inflacja'}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            inputProps={{ min: 0, max: 15, step: 0.1 }}
          />
        </Grid>
      </Grid>

      {/* Real wage growth indicator */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Realny wzrost płac:
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: realWageGrowth > 0 ? 'success.main' : realWageGrowth < 0 ? 'error.main' : 'text.primary',
            fontWeight: 600,
          }}
        >
          {realWageGrowth > 0 ? '+' : ''}{realWageGrowth.toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {realWageGrowth > 0 
            ? 'Płace rosną szybciej niż inflacja' 
            : realWageGrowth < 0 
              ? 'Inflacja przewyższa wzrost płac'
              : 'Wzrost płac równy inflacji'
          }
        </Typography>
      </Box>

      {/* Quick scenarios */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
          Szybkie scenariusze:
        </Typography>
        <Grid container spacing={1}>
          {scenarios.map((scenario) => (
            <Grid item xs={12} key={scenario.name}>
              <Box
                onClick={() => applyScenario(scenario)}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {scenario.name}
                </Typography>
                <Typography variant="caption">
                  Płace: {scenario.wage}%, Inflacja: {scenario.inflation}%
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Warning for extreme values */}
      {(indexation.wageGrowthRate > 8 || indexation.inflationRate > 6) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Uwaga: Bardzo wysokie wartości mogą prowadzić do nierealistycznych prognoz.
          </Typography>
        </Alert>
      )}

      {realWageGrowth < -2 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Uwaga: Ujemny realny wzrost płac może znacząco obniżyć przyszłą emeryturę.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default IndexationPanel;