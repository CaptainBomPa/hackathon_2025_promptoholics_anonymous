import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  LocalHospital as SickLeaveIcon,
  TrendingUp as TrendingUpIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
// import { useDashboard } from '../../../contexts/DashboardContext'; // TODO: Integrate with context
import { zusColors } from '../../../constants/zus-colors';

/**
 * Sick Leave Panel Component
 * Manages sick leave calculation options with three modes
 */
const SickLeavePanel = () => {
  // const { state, actions } = useDashboard(); // TODO: Integrate with context
  
  const [sickLeaveMode, setSickLeaveMode] = useState('averaged'); // 'averaged', 'none', 'custom'
  const [customDays, setCustomDays] = useState('');

  const handleModeChange = (event) => {
    const newMode = event.target.value;
    setSickLeaveMode(newMode);
    
    // Clear custom days when switching away from custom mode
    if (newMode !== 'custom') {
      setCustomDays('');
    }
  };

  const handleCustomDaysChange = (event) => {
    const value = event.target.value;
    // Allow only numbers and limit to reasonable range
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 365)) {
      setCustomDays(value);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'averaged':
        return <TrendingUpIcon sx={{ fontSize: 18 }} />;
      case 'none':
        return <BlockIcon sx={{ fontSize: 18 }} />;
      case 'custom':
        return <EditIcon sx={{ fontSize: 18 }} />;
      default:
        return <SickLeaveIcon sx={{ fontSize: 18 }} />;
    }
  };



  const getEstimatedImpact = () => {
    if (sickLeaveMode === 'none') {
      return { text: 'Brak wpływu na emeryturę', color: zusColors.success, emoji: '✅' };
    } else if (sickLeaveMode === 'averaged') {
      return { text: 'Średnie obniżenie emerytury o ~2-4%', color: zusColors.info, emoji: '📊' };
    } else if (sickLeaveMode === 'custom' && customDays) {
      const days = parseInt(customDays);
      if (days === 0) {
        return { text: 'Brak wpływu na emeryturę', color: zusColors.success, emoji: '✅' };
      } else if (days <= 10) {
        return { text: 'Minimalne obniżenie emerytury o ~1-2%', color: zusColors.success, emoji: '🟢' };
      } else if (days <= 30) {
        return { text: 'Umiarkowane obniżenie emerytury o ~3-5%', color: zusColors.secondary, emoji: '🟡' };
      } else {
        return { text: 'Znaczące obniżenie emerytury o ~5-8%', color: zusColors.error, emoji: '🔴' };
      }
    }
    return { text: 'Wybierz opcję aby zobaczyć wpływ', color: zusColors.neutral, emoji: '❓' };
  };

  const impact = getEstimatedImpact();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${zusColors.error} 0%, ${zusColors.secondary} 100%)`,
            boxShadow: `0 4px 12px ${zusColors.error}30`,
          }}
        >
          <SickLeaveIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, ${zusColors.error} 0%, ${zusColors.secondary} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Zwolnienia chorobowe
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
          🏥 Zwolnienia chorobowe wpływają na wysokość emerytury poprzez zmniejszenie składek ZUS. 
          Wybierz sposób uwzględnienia w kalkulacjach.
        </Typography>
      </Alert>

      {/* Mode Selection */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${zusColors.error}05 0%, white 100%)`,
          border: `1px solid ${zusColors.error}15`,
          boxShadow: `0 4px 16px ${zusColors.error}10`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel 
              component="legend" 
              sx={{ 
                fontWeight: 700, 
                color: zusColors.dark,
                mb: 2,
                fontSize: '1.1rem',
              }}
            >
              📋 Sposób uwzględnienia zwolnień chorobowych:
            </FormLabel>
            
            <RadioGroup
              value={sickLeaveMode}
              onChange={handleModeChange}
              sx={{ gap: 2 }}
            >
              {/* Averaged Option */}
              <FormControlLabel
                value="averaged"
                control={
                  <Radio 
                    sx={{ 
                      color: zusColors.info,
                      '&.Mui-checked': { color: zusColors.info }
                    }} 
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Chip
                      icon={getModeIcon('averaged')}
                      label="Średnia dla wieku"
                      size="small"
                      sx={{
                        background: sickLeaveMode === 'averaged' 
                          ? `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.primary} 100%)`
                          : `linear-gradient(135deg, ${zusColors.info}20 0%, ${zusColors.primary}15 100%)`,
                        color: sickLeaveMode === 'averaged' ? 'white' : zusColors.info,
                        fontWeight: 600,
                        minWidth: 160,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
                      📊 Użyj statystycznej średniej dni chorobowych dla Twojego wieku
                    </Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${sickLeaveMode === 'averaged' ? zusColors.info + '40' : 'transparent'}`,
                  background: sickLeaveMode === 'averaged' 
                    ? `linear-gradient(135deg, ${zusColors.info}08 0%, ${zusColors.primary}05 100%)`
                    : 'transparent',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${zusColors.info}05 0%, ${zusColors.primary}03 100%)`,
                  }
                }}
              />

              {/* None Option */}
              <FormControlLabel
                value="none"
                control={
                  <Radio 
                    sx={{ 
                      color: zusColors.neutral,
                      '&.Mui-checked': { color: zusColors.neutral }
                    }} 
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                    <Chip
                      icon={getModeIcon('none')}
                      label="Nie uwzględniać"
                      size="small"
                      sx={{
                        background: sickLeaveMode === 'none' 
                          ? `linear-gradient(135deg, ${zusColors.neutral} 0%, ${zusColors.dark} 100%)`
                          : `linear-gradient(135deg, ${zusColors.neutral}20 0%, ${zusColors.dark}15 100%)`,
                        color: sickLeaveMode === 'none' ? 'white' : zusColors.neutral,
                        fontWeight: 600,
                        minWidth: 160,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
                      🚫 Pomiń zwolnienia chorobowe w kalkulacjach
                    </Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${sickLeaveMode === 'none' ? zusColors.neutral + '40' : 'transparent'}`,
                  background: sickLeaveMode === 'none' 
                    ? `linear-gradient(135deg, ${zusColors.neutral}08 0%, ${zusColors.dark}05 100%)`
                    : 'transparent',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${zusColors.neutral}05 0%, ${zusColors.dark}03 100%)`,
                  }
                }}
              />

              {/* Custom Option */}
              <FormControlLabel
                value="custom"
                control={
                  <Radio 
                    sx={{ 
                      color: zusColors.secondary,
                      '&.Mui-checked': { color: zusColors.secondary }
                    }} 
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, width: '100%' }}>
                    <Chip
                      icon={getModeIcon('custom')}
                      label="Własne"
                      size="small"
                      sx={{
                        background: sickLeaveMode === 'custom' 
                          ? `linear-gradient(135deg, ${zusColors.secondary} 0%, ${zusColors.primary} 100%)`
                          : `linear-gradient(135deg, ${zusColors.secondary}20 0%, ${zusColors.primary}15 100%)`,
                        color: sickLeaveMode === 'custom' ? 'white' : zusColors.secondary,
                        fontWeight: 600,
                        minWidth: 160,
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
                        ✏️ Podaj własną średnią dni chorobowych w roku:
                      </Typography>
                      <TextField
                        size="small"
                        value={customDays}
                        onChange={handleCustomDaysChange}
                        disabled={sickLeaveMode !== 'custom'}
                        placeholder="np. 15"
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: sickLeaveMode === 'custom' ? 'white' : 'transparent',
                            '&.Mui-focused fieldset': {
                              borderColor: zusColors.secondary,
                            }
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.6 }}>
                              dni
                            </Typography>
                          )
                        }}
                      />
                    </Box>
                  </Box>
                }
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${sickLeaveMode === 'custom' ? zusColors.secondary + '40' : 'transparent'}`,
                  background: sickLeaveMode === 'custom' 
                    ? `linear-gradient(135deg, ${zusColors.secondary}08 0%, ${zusColors.primary}05 100%)`
                    : 'transparent',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${zusColors.secondary}05 0%, ${zusColors.primary}03 100%)`,
                  }
                }}
              />
            </RadioGroup>
          </FormControl>
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
              {impact.emoji} Szacowany wpływ na emeryturę
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

          {sickLeaveMode === 'custom' && customDays && (
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: `${impact.color}10` }}>
              <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 500 }}>
                📈 Twoje ustawienie: <strong>{customDays} dni chorobowych rocznie</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
                Średnia krajowa wynosi około 12-15 dni rocznie
              </Typography>
            </Box>
          )}

          {sickLeaveMode === 'averaged' && (
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: `${impact.color}10` }}>
              <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 500 }}>
                📊 Używana będzie statystyczna średnia dla Twojego wieku
              </Typography>
              <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
                Dane oparte na statystykach ZUS i GUS
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SickLeavePanel;