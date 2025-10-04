import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Assessment,
  Timeline,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import { zusColors } from '../../constants/zus-colors';
import { formatCurrency } from '../../utils/pension-formatting';

/**
 * Dashboard Main Content Component
 * Displays charts, results, and visualizations in responsive grid layout
 */
const DashboardMainContent = () => {
  const { state, computed } = useDashboard();

  return (
    <Box sx={{ flex: 1, p: 3 }}>
      {/* Error display */}
      {computed.hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Wykryto błędy w parametrach. Sprawdź ustawienia w panelu bocznym.
          </Typography>
        </Alert>
      )}

      {/* Loading indicator */}
      {state.uiState.isCalculating && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Przeliczanie wyników...
          </Typography>
        </Box>
      )}

      {/* Main content grid */}
      <Grid container spacing={3}>
        {/* Results Summary Cards */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: zusColors.dark }}>
            Podsumowanie wyników
          </Typography>
        </Grid>

        {/* Key metrics cards */}
        <Grid item xs={12} sm={6} md={3}>
          <ResultCard
            title="Emerytura rzeczywista"
            value={state.results.realAmountDeflated || 2950}
            subtitle="w dzisiejszych cenach"
            icon={<AccountBalance />}
            color={zusColors.info}
            loading={state.uiState.isCalculating}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ResultCard
            title="Emerytura nominalna"
            value={state.results.actualAmountPLN || 3850}
            subtitle="w przyszłych cenach"
            icon={<TrendingUp />}
            color={zusColors.success}
            loading={state.uiState.isCalculating}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ResultCard
            title="Stopa zastąpienia"
            value={state.results.replacementRatePct || 68.5}
            subtitle="% ostatniego wynagrodzenia"
            icon={<Assessment />}
            color={zusColors.primary}
            isPercentage
            loading={state.uiState.isCalculating}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ResultCard
            title="Vs średnia emerytura"
            value={state.results.vsAverageInRetirementYearPct || 12.3}
            subtitle="punkty proc. różnicy"
            icon={<Timeline />}
            color={state.results.vsAverageInRetirementYearPct > 0 ? zusColors.success : zusColors.error}
            isPercentage
            showSign
            loading={state.uiState.isCalculating}
          />
        </Grid>

        {/* Charts section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: zusColors.dark, mt: 2 }}>
            Wizualizacje
          </Typography>
        </Grid>

        {/* ZUS Account Growth Chart placeholder */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Wzrost środków na koncie ZUS
            </Typography>
            <Box 
              sx={{ 
                height: 320, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'background.default',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                borderStyle: 'dashed',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Wykres wzrostu środków ZUS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Implementacja w toku
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Salary projection chart placeholder */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Projekcja wynagrodzeń
            </Typography>
            <Box 
              sx={{ 
                height: 320, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'background.default',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                borderStyle: 'dashed',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Timeline sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Timeline wynagrodzeń
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Implementacja w toku
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Comparison table placeholder */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Porównanie scenariuszy
            </Typography>
            <Box 
              sx={{ 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'background.default',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                borderStyle: 'dashed',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Tabela porównawcza scenariuszy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zapisanych scenariuszy: {computed.totalScenarios}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * Result Card Component
 * Displays key metrics with icons and formatting
 */
const ResultCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  isPercentage = false, 
  showSign = false,
  loading = false 
}) => {
  const formatValue = (val) => {
    if (loading) return '';
    if (isPercentage) {
      const sign = showSign && val > 0 ? '+' : '';
      return `${sign}${val.toFixed(1)}%`;
    }
    return formatCurrency(val);
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: color + '15',
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>

        {loading ? (
          <Skeleton variant="text" width="80%" height={40} />
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: color,
              mb: 1,
            }}
          >
            {formatValue(value)}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardMainContent;