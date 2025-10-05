import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Tooltip,
    tooltipClasses,
    IconButton,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Info as InfoIcon, Euro as EuroIcon } from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

/** Subtelny tooltip (jak w SickLeavePanel) */
const FancyTooltip = styled(({ className, ...props }) => (
    <Tooltip arrow placement="top" enterDelay={200} leaveDelay={100} {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,248,250,0.98) 100%)'
                : 'linear-gradient(180deg, rgba(42,42,42,0.98) 0%, rgba(28,28,28,0.98) 100%)',
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        borderRadius: 8,
        padding: '10px 12px',
        backdropFilter: 'blur(4px)',
    },
    [`& .${tooltipClasses.arrow}`]: {
        color:
            theme.palette.mode === 'light'
                ? 'rgba(255,255,255,0.98)'
                : 'rgba(42,42,42,0.98)',
    },
}));

/**
 * ZUS Account Panel Component
 * Only manages ZUS account balance (bez statusów)
 */
const ZUSAccountPanel = () => {
    const { state, actions } = useDashboard();
    const { zusAccount } = state.parameters;

    const [accountBalance, setAccountBalance] = useState(
        (typeof zusAccount?.accountBalance === 'number'
            ? String(zusAccount.accountBalance)
            : zusAccount?.accountBalance) || '25000'
    );
    const [error, setError] = useState('');

    const numValue = useMemo(() => {
        const n = parseFloat(accountBalance);
        return Number.isFinite(n) ? n : 0;
    }, [accountBalance]);

    const handleAccountBalanceChange = (event) => {
        const value = event.target.value;

        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAccountBalance(value);

            const n = parseFloat(value);
            if (value !== '' && !Number.isNaN(n)) {
                if (n < 0) {
                    setError('Kwota nie może być ujemna.');
                } else {
                    setError('');
                }
                actions.updateZUSAccountParameters({ accountBalance: n || 0 });
            } else {
                setError('');
                actions.updateZUSAccountParameters({ accountBalance: 0 });
            }
        }
    };

    const formatCurrency = (value) =>
        (Number.isFinite(value) ? value : 0).toLocaleString('pl-PL', { maximumFractionDigits: 2 });

    return (
        <Box sx={{ display: 'grid', gap: 2.5 }}>

            {/* Karta z polem kwoty */}
            <Card
                sx={{
                    borderRadius: 1,
                    background: 'transparent',   // ⬅️ usuwa tło
                    border: 'none',              // ⬅️ usuwa obramowanie
                    boxShadow: 'none',           // ⬅️ usuwa cień
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* ⬇️ TU dodane „i” (Info) obok tytułu sekcji */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <EuroIcon sx={{ color: zusColors.primary }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Obecne saldo konta ZUS
                        </Typography>
                        <FancyTooltip
                            title={
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        Co to jest?
                                    </Typography>
                                    <Typography variant="body2">
                                        To aktualna wartość środków zgromadzonych na Twoim koncie ZUS. Wpływa bezpośrednio na wysokość emerytury.
                                        Saldo sprawdzisz w PUE ZUS lub aplikacji mZUS.
                                    </Typography>
                                </Box>
                            }
                        >
                            <IconButton size="small" sx={{ ml: -0.5 }}>
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </FancyTooltip>
                    </Box>

                    <TextField
                        fullWidth
                        value={accountBalance}
                        onChange={handleAccountBalanceChange}
                        placeholder="np. 25000"
                        inputMode="decimal"
                        label="Saldo konta ZUS"
                        error={Boolean(error)}
                        helperText={error || 'Podaj kwotę w PLN (możesz użyć kropki dla groszy)'}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">PLN</InputAdornment>,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                '&.Mui-focused fieldset': { borderColor: zusColors.primary },
                            },
                            '& .MuiFormLabel-root.Mui-focused': { color: zusColors.primary },
                        }}
                    />


                </CardContent>
            </Card>
        </Box>
    );
};

export default ZUSAccountPanel;
