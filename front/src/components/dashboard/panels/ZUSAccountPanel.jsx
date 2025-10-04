import { useState } from 'react';
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

  const handleWorkAfterRetirementChange = (_, newValue) => {
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
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">PLN</InputAdornment>,
              }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': {
                  borderColor: zusColors.primary,
                }
              },
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
              label={`${getWorkAfterRetirementStatus().emoji} ${getWorkAfterRetirementStatus().text}`}
              sx={{
                background: `linear-gradient(135deg, ${getWorkAfterRetirementStatus().color}15 0%, ${getWorkAfterRetirementStatus().color}08 100%)`,
                color: getWorkAfterRetirementStatus().color,
                fontWeight: 600,
                border: `1px solid ${getWorkAfterRetirementStatus().color}30`,
              }}
            />
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, background: `${zusColors.info}08`, mt: 2 }}>
            <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 500, mb: 1 }}>
              {workAfterRetirement > 0 
                ? `🎯 Wybrano ${workAfterRetirement} ${workAfterRetirement === 1 ? 'rok' : workAfterRetirement < 5 ? 'lata' : 'lat'} dodatkowej pracy`
                : '🏖️ Przejście na emeryturę w standardowym wieku'
              }
            </Typography>
            <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
              {workAfterRetirement > 0 
                ? 'Szczegółowe wyniki znajdziesz w sekcji wyników powyżej'
                : 'Przesuń slider aby zobaczyć korzyści z dłuższej pracy'
              }
            </Typography>
          </Box>
        </CardContent>
      </Card>


    </Box>
  );
};

export default ZUSAccountPanel;