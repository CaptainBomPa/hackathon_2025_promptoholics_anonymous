import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Paper,
  alpha,
} from '@mui/material';
import { CompareArrows } from '@mui/icons-material';
import PensionAmountCard from './PensionAmountCard';
import { generateComparisonAriaLabels } from '../../utils/pension-accessibility';
import { zusColors } from '../../constants/zus-colors';

/**
 * @typedef {Object} AmountComparisonProps
 * @property {number} realAmount - The real pension amount
 * @property {number} adjustedAmount - The adjusted pension amount
 * @property {boolean} [loading] - Whether the component is in loading state
 * @property {Function} [onInfoClick] - Callback for info button clicks
 */

/**
 * AmountComparison component displays side-by-side comparison of real vs adjusted pension amounts
 * @param {AmountComparisonProps} props
 * @returns {JSX.Element}
 */
const AmountComparison = React.memo(({
  realAmount,
  adjustedAmount,
  loading = false,
  onInfoClick,
}) => {
  // Generate accessible labels for screen readers
  const ariaLabels = generateComparisonAriaLabels(realAmount, adjustedAmount);
  
  // Calculate difference for comparison indicator
  const difference = adjustedAmount - realAmount;
  const differencePercentage = realAmount > 0 ? ((difference / realAmount) * 100).toFixed(1) : 0;

  const handleInfoClick = (type) => {
    if (onInfoClick) {
      onInfoClick(type);
    }
  };

  return (
    <Box
      sx={{ width: '100%' }}
      role="region"
      aria-label="Porównanie wysokości emerytury"
    >
      {/* Section Title */}
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: zusColors.dark,
          textAlign: 'center',
          mb: 3,
        }}
      >
        Prognozowana wysokość emerytury
      </Typography>

      {/* Comparison Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <PensionAmountCard
            amount={realAmount}
            title="Wysokość rzeczywista"
            subtitle="Kwota w dzisiejszych cenach"
            type="real"
            loading={loading}
            animationDelay={0}
            onInfoClick={() => handleInfoClick('real')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PensionAmountCard
            amount={adjustedAmount}
            title="Wysokość urealniona"
            subtitle="Kwota uwzględniająca inflację"
            type="adjusted"
            loading={loading}
            animationDelay={200}
            onInfoClick={() => handleInfoClick('adjusted')}
          />
        </Grid>
      </Grid>

      {/* Comparison Indicator */}
      {!loading && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${alpha(zusColors.neutral, 0.1)} 0%, ${alpha(zusColors.primary, 0.05)} 100%)`,
            border: 1,
            borderColor: alpha(zusColors.neutral, 0.2),
            textAlign: 'center',
          }}
          role="region"
          aria-label={ariaLabels.comparison}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <CompareArrows 
              sx={{ 
                fontSize: 24, 
                color: zusColors.info,
                mr: 1,
              }} 
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: zusColors.dark,
              }}
            >
              Porównanie kwot
            </Typography>
          </Box>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {difference > 0 ? (
              <>
                Urealniona emerytura jest <strong>wyższa</strong> o{' '}
                <span style={{ color: zusColors.success, fontWeight: 600 }}>
                  {Math.abs(difference).toLocaleString('pl-PL')} zł
                </span>
                {' '}({differencePercentage}%)
              </>
            ) : difference < 0 ? (
              <>
                Urealniona emerytura jest <strong>niższa</strong> o{' '}
                <span style={{ color: zusColors.error, fontWeight: 600 }}>
                  {Math.abs(difference).toLocaleString('pl-PL')} zł
                </span>
                {' '}({Math.abs(differencePercentage)}%)
              </>
            ) : (
              'Obie kwoty są identyczne'
            )}
          </Typography>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: 'italic' }}
          >
            Różnica wynika z uwzględnienia inflacji i zmian siły nabywczej pieniądza
          </Typography>
        </Paper>
      )}

      {/* Loading state for comparison indicator */}
      {loading && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            background: alpha(zusColors.neutral, 0.1),
            border: 1,
            borderColor: alpha(zusColors.neutral, 0.2),
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              height: 60,
              backgroundColor: alpha(zusColors.neutral, 0.2),
              borderRadius: 1,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            }}
          />
        </Paper>
      )}

      {/* Screen reader announcement */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {!loading && ariaLabels.comparison}
      </div>
    </Box>
  );
});

export default AmountComparison;