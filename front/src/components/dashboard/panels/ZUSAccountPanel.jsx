import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Alert,
  Chip,
  Slider,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Euro as EuroIcon,
  Info as InfoIcon,

  Work as WorkIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

/**
 * ZUS Account Panel Component
 * Manages ZUS account balance and additional contributions
 */
const ZUSAccountPanel = () => {
  const { state, actions } = useDashboard();
  const { zusAccount } = state.parameters;

  const [accountBalance, setAccountBalance] = useState(zusAccount?.accountBalance || '25000');
  const [workAfterRetirement, setWorkAfterRetirement] = useState(zusAccount?.workAfterRetirement || 0);

  const handleAccountBalanceChange = (event) => {
    const value = event.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAccountBalance(value);
      
      // Update context
      actions.updateZUSAccountParameters({
        accountBalance: parseFloat(value) || 0,
      });
    }
  };

  const handleWorkAfterRetirementChange = (event, newValue) => {
    setWorkAfterRetirement(newValue);
    
    // Update context
    actions.updateZUSAccountParameters({
      workAfterRetirement: newValue,
    });
  };

  const formatCurrency = (value) => {
    if (!value) return '0';
    return parseFloat(value).toLocaleString('pl-PL');
  };

  const getBalanceStatus = () => {
    const balance = parseFloat(accountBalance) || 0;
    if (balance === 0) {
      return { text: 'Brak środków na koncie', color: zusColors.neutral, emoji: '⚪' };
    } else if (balance < 10000) {
      return { text: 'Niskie saldo konta', color: zusColors.error, emoji: '🔴' };
    } else if (balance < 50000) {
      return { text: 'Średnie saldo konta', color: zusColors.secondary, emoji: '🟡' };
    } else {
      return { text: 'Wysokie saldo konta', color: zusColors.success, emoji: '🟢' };
    }
  };

  const getEstimatedImpact = () => {
    const balance = parseFloat(accountBalance) || 0;
    const workYears = workAfterRetirement;
    const totalAmount = balance + (workYears * 15000); // Extra work contributes ~15k per year

    if (totalAmount === 0 && workYears === 0) {
      return { text: 'Brak wpływu na emeryturę', color: zusColors.neutral };
    } else if (totalAmount < 50000 && workYears === 0) {
      return { text: 'Zwiększenie emerytury o ~50-150 PLN miesięcznie', color: zusColors.info };
    } else if (totalAmount < 150000 && workYears <= 2) {
      return { text: 'Zwiększenie emerytury o ~150-400 PLN miesięcznie', color: zusColors.success };
    } else {
      const workBonus = workYears > 0 ? ` + ${workYears * 200}-${workYears * 350} PLN za pracę po emeryturze` : '';
      return { text: `Znaczące zwiększenie emerytury o ~400+ PLN miesięcznie${workBonus}`, color: zusColors.primary };
    }
  };

  const getWorkAfterRetirementStatus = () => {
    if (workAfterRetirement === 0) {
      return { text: 'Przejście na emeryturę w wieku emerytalnym', color: zusColors.neutral, emoji: '🏖️' };
    } else if (workAfterRetirement <= 2) {
      return { text: 'Krótkoterminowa praca po emeryturze', color: zusColors.info, emoji: '💼' };
    } else if (workAfterRetirement <= 5) {
      return { text: 'Średnioterminowa praca po emeryturze', color: zusColors.secondary, emoji: '🚀' };
    } else {
      return { text: 'Długoterminowa praca po emeryturze', color: zusColors.success, emoji: '💪' };
    }
  };

  const balanceStatus = getBalanceStatus();
  const impact = getEstimatedImpact();
  const workStatus = getWorkAfterRetirementStatus();

  // Get postponed benefits from backend data
  const getPostponedBenefitText = () => {
    const postponedData = state.results?.ifPostponedYears;
    

    
    if (!postponedData || postponedData.length === 0) {
      // Fallback to estimated values
      return `💰 Szacowane dodatkowe świadczenie: ${workAfterRetirement * 200}-${workAfterRetirement * 350} PLN miesięcznie`;
    }
    
    // Find exact match first
    const exactMatch = postponedData.find(item => {
      const itemYears = parseInt(item.year || item.postponedByYears || item.years || 0);
      return itemYears === workAfterRetirement;
    });
    
    if (exactMatch) {
      const currentPension = state.results?.actualAmountPLN || 0;
      const postponedPension = exactMatch.actualAmountPLN || 0;
      const difference = postponedPension - currentPension;
      
      const yearsText = workAfterRetirement === 1 ? 'rok' : workAfterRetirement < 5 ? 'lata' : 'lat';
      return `💰 Pracując ${workAfterRetirement} ${yearsText} po emeryturze otrzymasz ${Math.round(postponedPension).toLocaleString('pl-PL')} PLN miesięcznie (o ${Math.round(difference)} PLN więcej niż standardowo)`;
    }
    
    // If no exact match, try to interpolate/extrapolate
    const sortedData = postponedData
      .map(item => ({
        years: parseInt(item.year || 0),
        amount: item.actualAmountPLN || 0
      }))
      .sort((a, b) => a.years - b.years);
    
    if (sortedData.length >= 2) {
      const currentPension = state.results?.actualAmountPLN || 0;
      let estimatedAmount = 0;
      
      // Find two closest points for interpolation/extrapolation
      if (workAfterRetirement <= sortedData[0].years) {
        // Extrapolate below minimum
        const point1 = sortedData[0];
        const point2 = sortedData[1];
        const slope = (point2.amount - point1.amount) / (point2.years - point1.years);
        estimatedAmount = point1.amount + slope * (workAfterRetirement - point1.years);
      } else if (workAfterRetirement >= sortedData[sortedData.length - 1].years) {
        // Extrapolate above maximum
        const point1 = sortedData[sortedData.length - 2];
        const point2 = sortedData[sortedData.length - 1];
        const slope = (point2.amount - point1.amount) / (point2.years - point1.years);
        estimatedAmount = point2.amount + slope * (workAfterRetirement - point2.years);
      } else {
        // Interpolate between two points
        for (let i = 0; i < sortedData.length - 1; i++) {
          const point1 = sortedData[i];
          const point2 = sortedData[i + 1];
          
          if (workAfterRetirement >= point1.years && workAfterRetirement <= point2.years) {
            const ratio = (workAfterRetirement - point1.years) / (point2.years - point1.years);
            estimatedAmount = point1.amount + ratio * (point2.amount - point1.amount);
            break;
          }
        }
      }
      
      const difference = Math.round(estimatedAmount - currentPension);
      const yearsText = workAfterRetirement === 1 ? 'rok' : workAfterRetirement < 5 ? 'lata' : 'lat';
      return `💰 Szacunkowo: pracując ${workAfterRetirement} ${yearsText} po emeryturze otrzymasz ~${Math.round(estimatedAmount).toLocaleString('pl-PL')} PLN miesięcznie (o ~${difference} PLN więcej)`;
    }
    
    // Fallback: show available options
    const availableOptions = postponedData.map(item => {
      const years = parseInt(item.year || 0);
      const amount = item.actualAmountPLN || 0;
      const currentPension = state.results?.actualAmountPLN || 0;
      const difference = Math.round(amount - currentPension);
      
      const yearText = years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat';
      return `${years} ${yearText}: +${difference} PLN`;
    }).join(', ');
    
    return `💰 Dostępne opcje: ${availableOptions}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.success} 100%)`,
            boxShadow: `0 4px 12px ${zusColors.primary}30`,
          }}
        >
          <AccountBalanceIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.success} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Konto ZUS
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${zusColors.info}08 0%, white 100%)`,
          border: `1px solid ${zusColors.info}20`,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          🏦 Środki na koncie ZUS oraz dodatkowe wpłaty wpływają bezpośrednio na wysokość emerytury.
          Możesz sprawdzić swoje saldo na stronie ZUS lub w aplikacji mZUS.
        </Typography>
      </Alert>

      {/* Account Balance */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${zusColors.primary}05 0%, white 100%)`,
          border: `1px solid ${zusColors.primary}15`,
          boxShadow: `0 4px 16px ${zusColors.primary}10`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <EuroIcon sx={{ color: zusColors.primary, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: zusColors.dark }}>
              💰 Obecne saldo konta ZUS
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Saldo konta ZUS"
            value={accountBalance}
            onChange={handleAccountBalanceChange}
            placeholder="25000"
            helperText="Aktualne środki zgromadzone na Twoim koncie ZUS"
            InputProps={{
              startAdornment: <InputAdornment position="start">PLN</InputAdornment>,
              sx: {
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: zusColors.primary,
                  }
                }
              }
            }}
            sx={{
              mb: 2,
              '& .MuiFormLabel-root.Mui-focused': {
                color: zusColors.primary,
              }
            }}
          />

          {/* Balance Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`${balanceStatus.emoji} ${balanceStatus.text}`}
              sx={{
                background: `linear-gradient(135deg, ${balanceStatus.color}15 0%, ${balanceStatus.color}08 100%)`,
                color: balanceStatus.color,
                fontWeight: 600,
                border: `1px solid ${balanceStatus.color}30`,
              }}
            />
            <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
              Saldo: <strong>{formatCurrency(accountBalance)} PLN</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>



      {/* Work After Retirement Slider */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${zusColors.secondary}05 0%, white 100%)`,
          border: `1px solid ${zusColors.secondary}15`,
          boxShadow: `0 4px 16px ${zusColors.secondary}10`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <WorkIcon sx={{ color: zusColors.secondary, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: zusColors.dark }}>
              💼 Praca po wieku emerytalnym
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8, mb: 3 }}>
            🚀 Wybierz ile lat chcesz pracować po osiągnięciu wieku emerytalnego.
            Praca po emeryturze znacząco zwiększa wysokość świadczenia!
          </Typography>

          <Box sx={{ px: 2, mb: 3 }}>
            <Slider
              value={workAfterRetirement}
              onChange={handleWorkAfterRetirementChange}
              min={0}
              max={10}
              step={1}
              marks={[
                { value: 0, label: '0 lat' },
                { value: 2, label: '2 lata' },
                { value: 5, label: '5 lat' },
                { value: 10, label: '10 lat' },
              ]}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => `${value} ${value === 1 ? 'rok' : value < 5 ? 'lata' : 'lat'}`}
              sx={{
                color: zusColors.secondary,
                height: 8,
                '& .MuiSlider-track': {
                  background: `linear-gradient(90deg, ${zusColors.secondary} 0%, ${zusColors.primary} 100%)`,
                  border: 'none',
                },
                '& .MuiSlider-thumb': {
                  height: 24,
                  width: 24,
                  background: `linear-gradient(135deg, ${zusColors.secondary} 0%, ${zusColors.primary} 100%)`,
                  border: `3px solid white`,
                  boxShadow: `0 4px 12px ${zusColors.secondary}40`,
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: `0 6px 16px ${zusColors.secondary}50`,
                    transform: 'scale(1.1)',
                  },
                  '&::before': {
                    display: 'none',
                  },
                },
                '& .MuiSlider-valueLabel': {
                  background: `linear-gradient(135deg, ${zusColors.secondary} 0%, ${zusColors.primary} 100%)`,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  '&::before': {
                    borderTopColor: zusColors.secondary,
                  },
                },
                '& .MuiSlider-mark': {
                  backgroundColor: `${zusColors.secondary}60`,
                  height: 4,
                  width: 4,
                  borderRadius: '50%',
                },
                '& .MuiSlider-markActive': {
                  backgroundColor: zusColors.secondary,
                },
                '& .MuiSlider-markLabel': {
                  color: zusColors.dark,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  opacity: 0.8,
                },
              }}
            />
          </Box>

          {/* Work Status Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={`${workStatus.emoji} ${workStatus.text}`}
              sx={{
                background: `linear-gradient(135deg, ${workStatus.color}15 0%, ${workStatus.color}08 100%)`,
                color: workStatus.color,
                fontWeight: 600,
                border: `1px solid ${workStatus.color}30`,
              }}
            />
          </Box>

          {workAfterRetirement > 0 && (
            <Box sx={{ p: 2, borderRadius: 2, background: `${workStatus.color}10` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTimeIcon sx={{ color: workStatus.color, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 600 }}>
                  Dodatkowy okres pracy: <strong>{workAfterRetirement} {workAfterRetirement === 1 ? 'rok' : workAfterRetirement < 5 ? 'lata' : 'lat'}</strong>
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 500, mb: 0.5 }}>
                  {getPostponedBenefitText()}
                </Typography>
                <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
                  🎯 Dane z systemu kalkulacji emerytalnej
                </Typography>
              </Box>
            </Box>
          )}

          {workAfterRetirement === 0 && (
            <Box sx={{ p: 2, borderRadius: 2, background: `${zusColors.neutral}10` }}>
              <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 500 }}>
                🏖️ Przejdziesz na emeryturę w standardowym wieku emerytalnym
              </Typography>
              <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
                Możesz zawsze zmienić zdanie i pracować dłużej dla wyższej emerytury
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card
        sx={{
          borderRadius: 3,
          background: `linear-gradient(135deg, ${impact.color}08 0%, white 100%)`,
          border: `1px solid ${impact.color}20`,
          boxShadow: `0 4px 16px ${impact.color}15`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: zusColors.dark }}>
              🎯 Szacowany wpływ na emeryturę
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: impact.color,
              fontWeight: 600,
              mb: 2,
            }}
          >
            {impact.text}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
                Obecne saldo:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: zusColors.primary }}>
                {formatCurrency(accountBalance)} PLN
              </Typography>
            </Box>


          </Box>

          <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: `${impact.color}10` }}>
            <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 500 }}>
              💡 Wskazówka: Praca po wieku emerytalnym może znacząco zwiększyć Twoją przyszłą emeryturę
            </Typography>
            <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
              Każdy rok pracy po emeryturze to około 200-350 PLN więcej emerytury miesięcznie
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ZUSAccountPanel;