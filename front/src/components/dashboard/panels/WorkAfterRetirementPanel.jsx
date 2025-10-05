import { useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Slider, Tooltip, IconButton, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Info as InfoIcon } from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

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

const WorkAfterRetirementPanel = () => {
    const { state, actions } = useDashboard();
    const { zusAccount } = state.parameters;

    const [workAfterRetirement, setWorkAfterRetirement] = useState(
        zusAccount?.workAfterRetirement ?? 0
    );

    const handleWorkAfterRetirementChange = (_event, newValue) => {
        setWorkAfterRetirement(newValue);
        actions.updateZUSAccountParameters({ workAfterRetirement: newValue });
    };

    const marks = useMemo(
        () =>
            Array.from({ length: 11 }, (_, i) => ({
                value: i,
                label: [0, 5, 10].includes(i) ? `${i} lat` : '',
            })),
        []
    );

    const valueLabelFormat = (value) =>
        `${value} ${value === 1 ? 'rok' : value < 5 ? 'lata' : 'lat'}`;

    return (
        <Box sx={{ p: 3 }}>
            <Card
                sx={{
                    borderRadius: 1,
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* 🔹 Nagłówek z tooltipem */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                        >
                            Praca po emeryturze
                        </Typography>
                        <FancyTooltip
                            title={
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        Dlaczego to ważne?
                                    </Typography>
                                    <Typography variant="body2">
                                        Każdy dodatkowy rok pracy po osiągnięciu wieku emerytalnego zwiększa Twoje świadczenie.
                                        Suwak pozwala wybrać liczbę lat dodatkowej aktywności zawodowej (od 0 do 10).
                                    </Typography>
                                </Box>
                            }
                        >
                            <IconButton size="small">
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </FancyTooltip>
                    </Box>

                    <Box sx={{ px: 1, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>Minimalnie</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>Maksymalnie</Typography>
                    </Box>

                    <Box sx={{ px: 1, mb: 3 }}>
                        <Slider
                            aria-label="Lata pracy po emeryturze"
                            value={workAfterRetirement}
                            onChange={handleWorkAfterRetirementChange}
                            min={0}
                            max={10}
                            step={1}
                            marks={marks}
                            valueLabelDisplay="on"
                            valueLabelFormat={valueLabelFormat}
                            sx={{
                                height: 10,
                                '& .MuiSlider-rail': {
                                    opacity: 1,
                                    backgroundColor: `${zusColors.neutral}40`,
                                    borderRadius: 999,
                                },
                                '& .MuiSlider-track': {
                                    border: 'none',
                                    backgroundColor: zusColors.success,
                                    borderRadius: 999,
                                },
                                '& .MuiSlider-thumb': {
                                    height: 26,
                                    width: 26,
                                    backgroundColor: '#fff',
                                    border: `4px solid ${zusColors.success}`,
                                    boxShadow: `0 6px 14px ${zusColors.success}40`,
                                    position: 'absolute',
                                    top: '50% !important',
                                    marginTop: '0 !important',
                                    transform: 'translate(-50%, -50%) !important',
                                    transformOrigin: 'center center',
                                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                                    '&:hover, &.Mui-focusVisible, &.Mui-active': {
                                        borderColor: zusColors.success,
                                        boxShadow: `0 8px 18px ${zusColors.success}60`,
                                    },
                                    '&::before': { display: 'none' },
                                },
                                '& .MuiSlider-mark': {
                                    width: 3,
                                    height: 3,
                                    borderRadius: '50%',
                                    backgroundColor: `${zusColors.success}70`,
                                },
                                '& .MuiSlider-markActive': {
                                    backgroundColor: zusColors.success,
                                },
                                '& .MuiSlider-markLabel': {
                                    color: zusColors.dark,
                                    fontWeight: 600,
                                    opacity: 0.75,
                                },
                                '& .MuiSlider-valueLabel': {
                                    top: -40,
                                    borderRadius: 8,
                                    padding: '4px 8px',
                                    fontWeight: 700,
                                    backgroundColor: zusColors.success,
                                    '&::before': { display: 'none' },
                                    transform: 'none',
                                },
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default WorkAfterRetirementPanel;
