import { useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Slider } from '@mui/material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

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
                    mb: 3,
                    borderRadius: 1,
                    background: `linear-gradient(135deg, ${zusColors.success}08 0%, #fff 100%)`,
                    border: `1px solid ${zusColors.success}20`,
                    boxShadow: `0 6px 20px ${zusColors.success}14`,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: zusColors.dark, opacity: 0.85, mb: 3, fontWeight: 500 }}
                    >
                        🚀 Wybierz liczbę lat pracy po osiągnięciu wieku emerytalnego. Suwak działa skokowo (co 1 rok).
                    </Typography>

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

                    <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
                        Podgląd wartości masz w dymku nad suwakiem.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default WorkAfterRetirementPanel;
