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
} from '@mui/material';
import {
    AccountBalance as AccountBalanceIcon,
    Euro as EuroIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

/**
 * ZUS Account Panel Component
 * Now ONLY manages ZUS account balance
 */
const ZUSAccountPanel = () => {
    const { state, actions } = useDashboard();
    const { zusAccount } = state.parameters;

    const [accountBalance, setAccountBalance] = useState(zusAccount?.accountBalance || '25000');

    const handleAccountBalanceChange = (event) => {
        const value = event.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAccountBalance(value);
            actions.updateZUSAccountParameters({
                accountBalance: parseFloat(value) || 0,
            });
        }
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

    const balanceStatus = getBalanceStatus();

    return (
        <Box sx={{ p: 3 }}>

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

            {/* Account Balance ONLY */}
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
                                '&.Mui-focused fieldset': { borderColor: zusColors.primary }
                            },
                            '& .MuiFormLabel-root.Mui-focused': { color: zusColors.primary }
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
        </Box>
    );
};

export default ZUSAccountPanel;
