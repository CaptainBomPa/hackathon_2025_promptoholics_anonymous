import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  CompareArrows,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import PensionAmountCard from './PensionAmountCard';
import {
  formatCurrency,
  formatAmountDifference,
  getAnimationDuration,
} from '@/utils';
import { zusColors } from '@/types';

interface AmountComparisonProps {
  realAmount: number;
  adjustedAmount: number;
  loading?: boolean;
  onInfoClick?: (type: 'real' | 'adjusted') => void;
}

const AmountComparison: React.FC<AmountComparisonProps> = ({
  realAmount,
  adjustedAmount,
  loading = false,
  onInfoClick,
}) => {
  const theme = useTheme();
  
  // Calculate difference
  const difference = adjustedAmount - realAmount;
  const percentageDifference = realAmount > 0 ? ((difference / realAmount) * 100) : 0;
  
  // Animation for comparison section
  const comparisonAnimation = useSpring({
    opacity: loading ? 0 : 1,
    transform: loading ? 'translateY(20px)' : 'translateY(0px)',
    config: {
      duration: getAnimationDuration(800),
      tension: 280,
      friction: 60,
    },
    delay: getAnimationDuration(400),
  });

  // Get comparison color and icon
  const getComparisonStyle = () => {
    if (difference > 0) {
      return {
        color: zusColors.success,
        icon: <TrendingUp />,
        text: 'wyższa',
        bgColor: alpha(zusColors.success, 0.1),
      };
    } else if (difference < 0) {
      return {
        color: zusColors.error,
        icon: <TrendingDown />,
        text: 'niższa',
        bgColor: alpha(zusColors.error, 0.1),
      };
    } else {
      return {
        color: zusColors.neutral,
        icon: <CompareArrows />,
        text: 'równa',
        bgColor: alpha(zusColors.neutral, 0.1),
      };
    }
  };

  const comparisonStyle = getComparisonStyle();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Amount Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <PensionAmountCard
            amount={realAmount}
            title="Wysokość rzeczywista"
            subtitle="Kwota w dzisiejszych cenach"
            type="real"
            loading={loading}
            animationDelay={0}
            onInfoClick={() => onInfoClick?.('real')}
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
            onInfoClick={() => onInfoClick?.('adjusted')}
          />
        </Grid>
      </Grid>

      {/* Comparison Section */}
      <animated.div style={comparisonAnimation}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${comparisonStyle.bgColor} 0%, ${alpha(comparisonStyle.color, 0.05)} 100%)`,
            border: 1,
            borderColor: alpha(comparisonStyle.color, 0.2),
            borderRadius: 2,
          }}
          role="region"
          aria-label="Porównanie wysokości emerytury"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(comparisonStyle.color, 0.1),
                color: comparisonStyle.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              {comparisonStyle.icon}
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Porównanie kwot
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3} alignItems="center">
            {/* Difference Amount */}
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Różnica kwotowa
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: comparisonStyle.color }}
                >
                  {formatAmountDifference(difference)}
                </Typography>
              </Box>
            </Grid>

            {/* Percentage Difference */}
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Różnica procentowa
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: comparisonStyle.color }}
                >
                  {difference >= 0 ? '+' : ''}{percentageDifference.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>

            {/* Explanation */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="body1" color="text.primary" gutterBottom>
                  <strong>Wysokość urealniona</strong> jest{' '}
                  <span style={{ color: comparisonStyle.color, fontWeight: 'bold' }}>
                    {comparisonStyle.text}
                  </span>{' '}
                  od rzeczywistej
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {difference > 0 
                    ? 'Uwzględnienie inflacji zwiększa wartość emerytury'
                    : difference < 0
                    ? 'Inflacja zmniejsza realną wartość emerytury'
                    : 'Obie kwoty są identyczne'
                  }
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Box 
            sx={{ 
              mt: 3,
              pt: 2,
              borderTop: 1,
              borderColor: alpha(comparisonStyle.color, 0.1),
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              💡 <strong>Wyjaśnienie:</strong> Wysokość rzeczywista pokazuje ile będziesz otrzymywać 
              w przyszłości wyrażone w dzisiejszych cenach. Wysokość urealniona uwzględnia 
              przewidywaną inflację i pokazuje realną siłę nabywczą Twojej emerytury.
            </Typography>
          </Box>
        </Paper>
      </animated.div>
    </Box>
  );
};

export default AmountComparison;