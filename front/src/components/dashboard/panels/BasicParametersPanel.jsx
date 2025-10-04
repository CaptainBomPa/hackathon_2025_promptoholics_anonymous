import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { useDashboard } from '../../../contexts/DashboardContext';

/**
 * Basic Parameters Panel Component
 * Handles age, gender, salary, and work years controls
 */
const BasicParametersPanel = () => {
  const { state, actions } = useDashboard();
  const { basic } = state.parameters;
  const { errors } = state.uiState;

  const handleBasicParameterChange = (field, value) => {
    // Convert string values to numbers where appropriate
    const numericFields = ['age', 'grossSalary', 'startYear', 'plannedEndYear', 'expectedPension'];
    const processedValue = numericFields.includes(field) ? Number(value) || 0 : value;
    
    actions.setBasicParameters({
      [field]: processedValue,
    });
  };

  const currentYear = new Date().getFullYear();
  const workingYears = basic.plannedEndYear - basic.startYear;
  const yearsToRetirement = basic.plannedEndYear - currentYear;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Parametry podstawowe
      </Typography>

      <Grid container spacing={2}>
        {/* Age */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Wiek"
            type="number"
            value={basic.age || ''}
            onChange={(e) => handleBasicParameterChange('age', e.target.value)}
            error={!!errors.age}
            helperText={errors.age || 'Obecny wiek (16-80 lat)'}
            inputProps={{ min: 16, max: 80 }}
          />
        </Grid>

        {/* Gender */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            select
            label="Płeć"
            value={basic.gender || 'F'}
            onChange={(e) => handleBasicParameterChange('gender', e.target.value)}
          >
            <MenuItem value="F">Kobieta</MenuItem>
            <MenuItem value="M">Mężczyzna</MenuItem>
          </TextField>
        </Grid>

        {/* Gross Salary */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Wynagrodzenie brutto"
            type="number"
            value={basic.grossSalary || ''}
            onChange={(e) => handleBasicParameterChange('grossSalary', e.target.value)}
            error={!!errors.grossSalary}
            helperText={errors.grossSalary || 'Miesięczne wynagrodzenie brutto w PLN'}
            InputProps={{
              endAdornment: <InputAdornment position="end">PLN/mc</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />
        </Grid>

        {/* Start Year */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Rok rozpoczęcia pracy"
            type="number"
            value={basic.startYear || ''}
            onChange={(e) => handleBasicParameterChange('startYear', e.target.value)}
            error={!!errors.startYear}
            helperText={errors.startYear || 'Rok rozpoczęcia kariery zawodowej'}
            inputProps={{ min: 1960, max: currentYear }}
          />
        </Grid>

        {/* Planned End Year */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Planowany rok emerytury"
            type="number"
            value={basic.plannedEndYear || ''}
            onChange={(e) => handleBasicParameterChange('plannedEndYear', e.target.value)}
            error={!!errors.plannedEndYear}
            helperText={errors.plannedEndYear || 'Rok przejścia na emeryturę'}
            inputProps={{ min: currentYear, max: currentYear + 50 }}
          />
        </Grid>

        {/* Expected Pension */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Oczekiwana emerytura"
            type="number"
            value={basic.expectedPension || ''}
            onChange={(e) => handleBasicParameterChange('expectedPension', e.target.value)}
            helperText="Miesięczna emerytura, którą chciałbyś otrzymywać"
            InputProps={{
              endAdornment: <InputAdornment position="end">PLN/mc</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />
        </Grid>
      </Grid>

      {/* Summary information */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Podsumowanie:
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Lata pracy:</strong> {workingYears > 0 ? workingYears : 0} lat
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Do emerytury:</strong> {yearsToRetirement > 0 ? yearsToRetirement : 0} lat
        </Typography>
        <Typography variant="body2">
          <strong>Roczne wynagrodzenie:</strong> {(basic.grossSalary * 12).toLocaleString('pl-PL')} PLN
        </Typography>
        
        {workingYears < 25 && (
          <FormHelperText error sx={{ mt: 1 }}>
            ⚠️ Uwaga: Mniej niż 25 lat pracy może znacząco obniżyć emeryturę
          </FormHelperText>
        )}
        
        {yearsToRetirement < 0 && (
          <FormHelperText error sx={{ mt: 1 }}>
            ⚠️ Uwaga: Planowany rok emerytury jest w przeszłości
          </FormHelperText>
        )}
      </Box>
    </Box>
  );
};

export default BasicParametersPanel;