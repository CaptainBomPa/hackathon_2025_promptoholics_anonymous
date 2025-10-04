import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  MonetizationOn,
  TrendingUp,
  Info,
  AccountBalance,
} from '@mui/icons-material';
import CountUp from 'react-countup';
import { useSpring, animated } from '@react-spring/web';
import {
  formatCurrency,
  getAnimationDuration,
} from '../../utils/pension-formatting';
import { generateCurrencyAriaLabel } from '../../utils/pension-accessibility';
import { zusColors } from '../../constants/zus-colors';

/**
 * @typedef {Object} PensionAmountCardProps
 * @property {number} amount - The pension amount to display
 * @property {string} title - The title of the card
 * @property {string} [subtitle] - Optional subtitle
 * @property {'real' | 'adjusted'} type - The type of pension amount
 * @property {boolean} [loading] - Whether the card is in loading state
 * @property {number} [animationDelay] - Delay before animation starts
 * @property {Function} [onInfoClick] - Callback for info button click
 */

/**
 * PensionAmountCard component displays a single pension amount with animations and accessibility features
 * @param {PensionAmountCardProps} props
 * @returns {JSX.Element}
 */
const PensionAmountCard = React.memo(({
  amount,
  title,
  subtitle,
  type,
  loading = false,
  animationDelay = 0,
  onInfoClick,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  // Animation for card entrance
  const cardAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(20px) scale(0.95)',
    config: {
      duration: getAnimationDuration(600),
      tension: 280,
      friction: 60,
    },
    delay: getAnimationDuration(animationDelay),
  });

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Color scheme based on type
  const getCardColor = () => {
    switch (type) {
      case 'real':
        return {
          primary: zusColors.info,
          background: alpha(zusColors.info, 0.1),
          border: alpha(zusColors.info, 0.3),
        };
      case 'adjusted':
        return {
          primary: zusColors.success,
          background: alpha(zusColors.success, 0.1),
          border: alpha(zusColors.success, 0.3),
        };
      default:
        return {
          primary: theme.palette.primary.main,
          background: alpha(theme.palette.primary.main, 0.1),
          border: alpha(theme.palette.primary.main, 0.3),
        };
    }
  };

  const colors = getCardColor();

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case 'real':
        return <AccountBalance sx={{ fontSize: 32 }} />;
      case 'adjusted':
        return <TrendingUp sx={{ fontSize: 32 }} />;
      default:
        return <MonetizationOn sx={{ fontSize: 32 }} />;
    }
  };

  // Tooltip content
  const getTooltipContent = () => {
    switch (type) {
      case 'real':
        return 'Rzeczywista wysokość emerytury to kwota, którą otrzymasz w przyszłości, wyrażona w dzisiejszych cenach.';
      case 'adjusted':
        return 'Urealniona wysokość emerytury to kwota uwzględniająca inflację i siłę nabywczą pieniądza w przyszłości.';
      default:
        return 'Prognozowana wysokość emerytury';
    }
  };

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          minHeight: 200,
          background: `linear-gradient(135deg, ${colors.background} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
          border: 1,
          borderColor: colors.border,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                backgroundColor: colors.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  height: 20,
                  backgroundColor: alpha(colors.primary, 0.2),
                  borderRadius: 1,
                  mb: 1,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <Box
                sx={{
                  height: 40,
                  backgroundColor: alpha(colors.primary, 0.3),
                  borderRadius: 1,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const AnimatedCard = animated(Card);

  return (
    <AnimatedCard
      style={cardAnimation}
      sx={{
        height: '100%',
        minHeight: 200,
        background: `linear-gradient(135deg, ${colors.background} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
        border: 1,
        borderColor: colors.border,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: `0 8px 32px ${alpha(colors.primary, 0.2)}`,
          borderColor: colors.primary,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${colors.primary}, ${alpha(colors.primary, 0.7)})`,
        },
      }}
      role="region"
      aria-label={generateCurrencyAriaLabel(amount, title)}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(colors.primary, 0.15),
                color: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.25),
                  transform: 'scale(1.1)',
                },
              }}
            >
              {getIcon()}
            </Box>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, mb: 0.5 }}
              >
                {title}
              </Typography>
              <Chip
                label={type === 'real' ? 'Rzeczywista' : 'Urealniona'}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.primary, 0.1),
                  color: colors.primary,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>
          
          <Tooltip title={getTooltipContent()} arrow placement="top">
            <IconButton 
              size="small" 
              sx={{ color: 'text.secondary' }}
              onClick={onInfoClick}
              aria-label={`Informacje o ${title.toLowerCase()}`}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Amount */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.primary,
              lineHeight: 1.2,
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
            aria-live="polite"
          >
            <CountUp
              end={amount}
              duration={getAnimationDuration(2)}
              separator=" "
              prefix=""
              suffix=" zł"
              preserveValue
            />
          </Typography>
          
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                lineHeight: 1.5,
                fontSize: '0.875rem',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Footer with additional info */}
        <Box 
          sx={{ 
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: alpha(colors.primary, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Prognoza miesięczna
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MonetizationOn sx={{ fontSize: 16, color: colors.primary }} />
            <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600 }}>
              {formatCurrency(amount)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </AnimatedCard>
  );
});

export default PensionAmountCard;