import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Person sx={{ color: zusColors.primary, fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: zusColors.primary }}>
          Parametry podstawowe
        </Typography>
      </Box>

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

        {/* Work Type */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            select
            label="Typ pracy"
            value={basic.workType || 'employment'}
            onChange={(e) => handleBasicParameterChange('workType', e.target.value)}
            helperText="Rodzaj umowy wpływa na wysokość składek ZUS"
          >
            <MenuItem value="employment">💼 Umowa o pracę</MenuItem>
            <MenuItem value="mandate">📋 Umowa o zlecenie</MenuItem>
            <MenuItem value="business">🏢 Jednoosobowa działalność gospodarcza (JDG)</MenuItem>
            <MenuItem value="contract">📝 Umowa o dzieło</MenuItem>
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
      <Box 
        sx={{ 
          mt: 3, 
          p: 3, 
          background: `linear-gradient(135deg, ${zusColors.primary}05 0%, ${zusColors.info}03 100%)`,
          border: `1px solid ${zusColors.primary}15`,
          borderRadius: 2,
          boxShadow: `0 2px 8px ${zusColors.primary}10`,
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: zusColors.primary, 
            fontWeight: 600, 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          📊 Podsumowanie parametrów
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
              Lata pracy:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: zusColors.primary }}>
              {workingYears > 0 ? workingYears : 0} lat
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
              Do emerytury:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: zusColors.info }}>
              {yearsToRetirement > 0 ? yearsToRetirement : 0} lat
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
              Roczne wynagrodzenie:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: zusColors.secondary }}>
              {(basic.grossSalary * 12).toLocaleString('pl-PL')} PLN
            </Typography>
          </Box>
        </Box>
        
        {workingYears < 25 && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              background: `linear-gradient(135deg, ${zusColors.error}08 0%, ${zusColors.error}05 100%)`,
              border: `1px solid ${zusColors.error}20`,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: zusColors.error, fontWeight: 600 }}>
              ⚠️ Uwaga: Mniej niż 25 lat pracy może znacząco obniżyć emeryturę
            </Typography>
          </Box>
        )}
        
        {yearsToRetirement < 0 && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              background: `linear-gradient(135deg, ${zusColors.error}08 0%, ${zusColors.error}05 100%)`,
              border: `1px solid ${zusColors.error}20`,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: zusColors.error, fontWeight: 600 }}>
              ⚠️ Uwaga: Planowany rok emerytury jest w przeszłości
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BasicParametersPanel;