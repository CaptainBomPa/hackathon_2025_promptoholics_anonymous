import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    TextField,
    InputAdornment,
    FormHelperText,
    Tooltip,
    tooltipClasses,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Block as BlockIcon,
    Edit as EditIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';

/** Subtelny tooltip */
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

/** Przyciski trybu – kanciaste, bez pigułek */
const ModeButton = styled(ToggleButton)(({ theme }) => ({
    textTransform: 'none',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
        : 'linear-gradient(180deg, #2a2a2a 0%, #222 100%)',
    transition: 'all .16s ease',
    display: 'grid',
    gridTemplateColumns: '22px auto',
    gap: 8,
    alignItems: 'center',
    '& .modeTitle': { fontWeight: 600, fontSize: 14 },
    '& .modeSub': { fontSize: 12, opacity: 0.7, lineHeight: 1.2 },
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    },
    '&.Mui-selected': {
        borderColor: theme.palette.primary.main,
        boxShadow: '0 8px 22px rgba(25,118,210,0.14)',
        background: `linear-gradient(180deg, ${theme.palette.primary.light}10 0%, transparent 100%)`,
    },
}));

const SickLeavePanel = () => {
    const { state, actions } = useDashboard();
    const initial = state?.parameters?.sickLeave || {};
    const [sickLeaveMode, setSickLeaveMode] = useState(initial.mode || 'none');
    const [customDays, setCustomDays] = useState(
        typeof initial.customDays === 'number' ? String(initial.customDays) : ''
    );
    const [error, setError] = useState('');

    useEffect(() => {
        if (!initial.mode) actions.setSickLeaveMode('none');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleModeChange = useCallback((_e, newMode) => {
        if (!newMode) return;
        setSickLeaveMode(newMode);
        actions.setSickLeaveMode(newMode);
        if (newMode !== 'custom') {
            setCustomDays('');
            setError('');
            actions.updateSickLeaveParameters({ mode: newMode, customDays: 0 });
        }
    }, [actions]);

    const handleCustomDaysChange = useCallback((e) => {
        const val = e.target.value.trim();
        if (val === '') {
            setCustomDays('');
            setError('');
            actions.updateSickLeaveParameters({ mode: 'custom', customDays: 0 });
            return;
        }
        if (!/^\d+$/.test(val)) {
            setError('Podaj liczbę całkowitą 0–365.');
            setCustomDays(val);
            return;
        }
        const n = parseInt(val, 10);
        if (n < 0 || n > 365) {
            setError('Zakres dozwolony: 0–365 dni.');
        } else {
            setError('');
            actions.updateSickLeaveParameters({ mode: 'custom', customDays: n });
        }
        setCustomDays(val);
    }, [actions]);

    return (
        <Box sx={{ display: 'grid', gap: 2.5 }}>
            {/* Sekcja wyboru – info dymek wpięty w nagłówek */}
            <Paper
                variant="outlined"
                sx={(theme) => ({
                    p: 2,
                    border: '0px',
                    background:
                        theme.palette.mode === 'light'
                            ? 'linear-gradient(180deg, #fff 0%, #fbfbfc 100%)'
                            : 'linear-gradient(180deg, #222 0%, #1b1b1b 100%)',
                })}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Sposób uwzględnienia
                        </Typography>
                        <FancyTooltip
                            title={
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Co to jest?</Typography>
                                    <Typography variant="body2">
                                        Zwolnienia chorobowe mogą obniżać przyszłą emeryturę przez niższe składki ZUS.
                                        Wybierz, jak je ująć: średnia, własna wartość lub pominięcie.
                                    </Typography>
                                </Box>
                            }
                        >
                            <IconButton size="small">
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </FancyTooltip>
                    </Box>
                </Box>

                <ToggleButtonGroup
                    exclusive
                    value={sickLeaveMode}
                    onChange={handleModeChange}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                        gap: 1,

                        // 🔧 naprawa brakującej krawędzi
                        '& .MuiToggleButtonGroup-grouped': {
                            margin: 0,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '8px !important',
                            '&.Mui-selected': {
                                borderColor: 'primary.main',
                            },
                            '&:not(:first-of-type)': {
                                borderLeft: '1px solid',
                                borderColor: 'divider',
                            },
                        },
                    }}
                >
                    <FancyTooltip
                        title={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Średnia</Typography>
                                <Typography variant="body2">
                                    Statystyczna średnia dla Twojej grupy (ZUS/GUS). Szacowany wpływ: ~2–4%.
                                </Typography>
                            </Box>
                        }
                    >
                        <ModeButton value="averaged">
                            <TrendingUpIcon fontSize="small" />
                            <Box>
                                <div className="modeTitle">Średnia</div>
                                <div className="modeSub">bazuj na statystyce</div>
                            </Box>
                        </ModeButton>
                    </FancyTooltip>

                    <FancyTooltip
                        title={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Nie uwzględniać</Typography>
                                <Typography variant="body2">Pomija zwolnienia w modelu. Wpływ: brak.</Typography>
                            </Box>
                        }
                    >
                        <ModeButton value="none">
                            <BlockIcon fontSize="small" />
                            <Box>
                                <div className="modeTitle">Nie uwzględniać</div>
                                <div className="modeSub">pomiń zwolnienia</div>
                            </Box>
                        </ModeButton>
                    </FancyTooltip>

                    <FancyTooltip
                        title={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Własne</Typography>
                                <Typography variant="body2">
                                    Ustal własną średnią liczbę dni w roku. Przykład: średnia krajowa ~12–15 dni.
                                </Typography>
                            </Box>
                        }
                    >
                        <ModeButton value="custom">
                            <EditIcon fontSize="small" />
                            <Box>
                                <div className="modeTitle">Własne</div>
                                <div className="modeSub">podaj swoją wartość</div>
                            </Box>
                        </ModeButton>
                    </FancyTooltip>
                </ToggleButtonGroup>

                {sickLeaveMode === 'custom' && (
                    <>
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 365 }}
                                value={customDays}
                                onChange={handleCustomDaysChange}
                                placeholder="np. 8"
                                sx={{ width: 180 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {/* Ikona opcjonalna — jeśli chcesz, odkomentuj i dodaj import:
                      <LocalHospitalIcon fontSize="small" /> */}
                                        </InputAdornment>
                                    ),
                                    endAdornment: <InputAdornment position="end">dni/rok</InputAdornment>,
                                }}
                            />
                            <FancyTooltip title="Wskazówka: średnia krajowa to ok. 12–15 dni rocznie. Użyj 0, jeśli chcesz przyjąć brak zwolnień.">
                                <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </FancyTooltip>
                        </Box>
                        <FormHelperText error={Boolean(error)}>
                            {error || 'Podaj liczbę z zakresu 0–365.'}
                        </FormHelperText>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default SickLeavePanel;
