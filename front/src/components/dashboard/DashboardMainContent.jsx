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
import { ZUSAccountGrowthChart, SalaryProjectionChart } from './charts';

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

      {/* Results Summary Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${zusColors.primary}08 0%, ${zusColors.info}05 100%)`,
          border: `1px solid ${zusColors.primary}20`,
          boxShadow: '0 4px 20px rgba(0, 153, 63, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.info} 100%)`,
              boxShadow: `0 6px 20px ${zusColors.primary}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Assessment sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Podsumowanie wyników
          </Typography>
        </Box>

        {/* Key metrics cards - różnorodne kolory */}
        <Grid container spacing={3}>
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
              color={zusColors.primary}
              loading={state.uiState.isCalculating}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ResultCard
              title="Stopa zastąpienia"
              value={state.results.replacementRatePct || 68.5}
              subtitle="% ostatniego wynagrodzenia"
              icon={<Assessment />}
              color={zusColors.secondary}
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
        </Grid>
      </Box>

      {/* Visualizations Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${zusColors.info}10 0%, ${zusColors.primary}10 50%, ${zusColors.secondary}10 100%)`,
            border: `1px solid ${zusColors.info}30`,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.primary} 100%)`,
              boxShadow: `0 6px 20px ${zusColors.info}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Timeline sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.primary} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Wizualizacje
          </Typography>
        </Box>

        {/* ZUS Account Growth Chart - Full Width */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              height: 520,
              minWidth: '100%',
              width: '100%',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${zusColors.primary}05 0%, white 50%, ${zusColors.info}05 100%)`,
              border: `1px solid ${zusColors.primary}20`,
              boxShadow: `0 8px 32px ${zusColors.primary}15`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: `0 12px 40px ${zusColors.primary}25`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.success} 100%)`,
                  boxShadow: `0 4px 12px ${zusColors.primary}30`,
                }}
              >
                <AccountBalance sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: zusColors.dark,
                }}
              >
                Wzrost środków na koncie ZUS
              </Typography>
            </Box>
            <Box sx={{ width: '100%', minWidth: 800 }}>
              <ZUSAccountGrowthChart
                data={state.results.accountGrowthProjection}
                loading={state.uiState.isCalculating}
              />
            </Box>
          </Paper>
        </Box>

        {/* Salary Projection Chart - Full Width */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              height: 520,
              minWidth: '100%',
              width: '100%',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${zusColors.info}05 0%, white 50%, ${zusColors.secondary}05 100%)`,
              border: `1px solid ${zusColors.info}20`,
              boxShadow: `0 8px 32px ${zusColors.info}15`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: `0 12px 40px ${zusColors.info}25`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.secondary} 100%)`,
                  boxShadow: `0 4px 12px ${zusColors.info}30`,
                }}
              >
                <Timeline sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: zusColors.dark,
                }}
              >
                Projekcja wynagrodzeń
              </Typography>
            </Box>
            <Box sx={{ width: '100%', minWidth: 800 }}>
              <SalaryProjectionChart
                data={state.results.salaryProjection}
                loading={state.uiState.isCalculating}
              />
            </Box>
          </Paper>
        </Box>


      </Box>
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
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}08 0%, white 70%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        boxShadow: `0 4px 20px ${color}15`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: `0 8px 32px ${color}25`,
          border: `1px solid ${color}40`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
              color: 'white',
              mr: 2,
              boxShadow: `0 4px 12px ${color}30`,
              transition: 'all 0.3s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 48,
              minHeight: 48,
            }}
          >
            {icon || <Assessment />}
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: zusColors.dark,
              opacity: 0.8,
            }}
          >
            {title}
          </Typography>
        </Box>

        {loading ? (
          <Box>
            <Skeleton variant="text" width="80%" height={48} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${color} 0%, ${zusColors.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              }}
            >
              {formatValue(value)}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: zusColors.dark,
                opacity: 0.7,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardMainContent;