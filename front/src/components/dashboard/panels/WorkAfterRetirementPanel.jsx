import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Slider,
} from '@mui/material';
import { Work as WorkIcon } from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

/**
 * Work After Retirement Panel
 * Manages years of working after statutory retirement age
 */
const WorkAfterRetirementPanel = () => {
    const { state, actions } = useDashboard();
    const { zusAccount } = state.parameters;

    const [workAfterRetirement, setWorkAfterRetirement] = useState(
        zusAccount?.workAfterRetirement || 0
    );

    const handleWorkAfterRetirementChange = (_, newValue) => {
        setWorkAfterRetirement(newValue);
        actions.updateZUSAccountParameters({
            workAfterRetirement: newValue,
        });
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

    return (
        <Box sx={{ p: 3 }}>

            {/* Slider Card */}
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
                    <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8, mb: 3 }}>
                        🚀 Wybierz ile lat chcesz pracować po osiągnięciu wieku emerytalnego.
                        Praca po emeryturze może znacząco zwiększyć wysokość świadczenia.
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
                                    '&::before': { display: 'none' },
                                },
                                '& .MuiSlider-valueLabel': {
                                    background: `linear-gradient(135deg, ${zusColors.secondary} 0%, ${zusColors.primary} 100%)`,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    '&::before': { borderTopColor: zusColors.secondary },
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

                    {/* Status */}
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
                                : '🏖️ Przejście na emeryturę w standardowym wieku'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7 }}>
                            {workAfterRetirement > 0
                                ? 'Szczegółowe wyniki znajdziesz w sekcji wyników powyżej'
                                : 'Przesuń slider, aby zobaczyć korzyści z dłuższej pracy'}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default WorkAfterRetirementPanel;
