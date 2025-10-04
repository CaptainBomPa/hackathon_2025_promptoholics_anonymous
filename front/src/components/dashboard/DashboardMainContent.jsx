import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Skeleton,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    TrendingUp,
    AccountBalance,
    Assessment,
    Timeline,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import { zusColors } from '../../constants/zus-colors';
import { formatCurrency } from '../../utils/pension-formatting';
import { ZUSAccountGrowthChart, SalaryProjectionChart } from './charts';

const CARD_MIN_HEIGHT = 180; // równa wysokość

const DashboardMainContent = () => {
    const { state, computed } = useDashboard();

    return (
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
            {/* Error display */}
            {computed.hasErrors && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        Wykryto błędy w parametrach. Sprawdź ustawienia w panelu bocznym.
                    </Typography>
                </Alert>
            )}

            {/* Loading indicator */}
            {state.uiState.isCalculating && (
                <Box sx={{ mb: 3 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Przeliczanie wyników...
                    </Typography>
                </Box>
            )}

            {/* Results Summary Section */}
            <Box
                sx={{
                    mb: 4,
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 4,
                    backdropFilter: 'blur(6px)',
                    background: `linear-gradient(135deg, ${zusColors.primary}0A 0%, ${zusColors.info}08 100%)`,
                    border: `1px solid ${zusColors.primary}26`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    minWidth: 0,
                }}
                aria-label="Podsumowanie wyników"
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        mb: 3,
                        flexWrap: 'wrap',
                        minWidth: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <Box
                            sx={{
                                p: 1.25,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.info} 100%)`,
                                boxShadow: `0 6px 20px ${zusColors.primary}30`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Assessment sx={{ color: 'white', fontSize: 26 }} />
                        </Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: 0.2,
                                background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.dark} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Podsumowanie wyników
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Tooltip
                            title="Metryki bazują na aktualnych parametrach z panelu. Wartości mogą się zmieniać po korektach."
                            arrow
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 1.25,
                                    py: 0.75,
                                    borderRadius: 2,
                                    border: `1px solid ${zusColors.info}33`,
                                    backgroundColor: `${zusColors.info}10`,
                                    color: zusColors.dark,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Ostatnia aktualizacja: {state.uiState.isCalculating ? 'trwa…' : 'przed chwilą'}
                            </Typography>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Metrics grid – 1col xs, 2col sm/md, 4col xl+ */}
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2.5,
                        alignItems: 'stretch',
                        gridAutoFlow: 'row dense',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            xl: 'repeat(4, minmax(0, 1fr))',
                        },
                        minWidth: 0,
                    }}
                >
                    <MetricCard
                        title="Emerytura rzeczywista"
                        value={state.results.realAmountDeflated ?? 2950}
                        subtitle="w dzisiejszych cenach"
                        icon={<AccountBalance />}
                        color={zusColors.info}
                        loading={state.uiState.isCalculating}
                        valueFormatter={formatCurrency}
                        trend={state.results?.realAmountDeflatedDeltaPct}
                    />

                    <MetricCard
                        title="Emerytura nominalna"
                        value={state.results.actualAmountPLN ?? 3850}
                        subtitle="w przyszłych cenach"
                        icon={<TrendingUp />}
                        color={zusColors.primary}
                        loading={state.uiState.isCalculating}
                        valueFormatter={formatCurrency}
                        trend={state.results?.nominalDeltaPct}
                    />

                    <MetricCard
                        title="Stopa zastąpienia"
                        value={state.results.replacementRatePct ?? 68.5}
                        subtitle="% ostatniego wynagrodzenia"
                        icon={<Assessment />}
                        color={zusColors.secondary}
                        loading={state.uiState.isCalculating}
                        isPercentage
                        trend={state.results?.replacementDeltaPct}
                    />

                    <MetricCard
                        title="Vs średnia emerytura"
                        value={state.results.vsAverageInRetirementYearPct ?? 12.3}
                        subtitle="p.p. różnicy względem średniej"
                        icon={<Timeline />}
                        color={
                            (state.results.vsAverageInRetirementYearPct ?? 0) >= 0
                                ? zusColors.success
                                : zusColors.error
                        }
                        loading={state.uiState.isCalculating}
                        isPercentage
                        showSign
                        trend={state.results?.vsAverageDeltaPct}
                    />
                </Box>
            </Box>

            {/* Visualizations Section */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 4,
                        p: 2,
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${zusColors.info}10 0%, ${zusColors.primary}10 50%, ${zusColors.secondary}10 100%)`,
                        border: `1px solid ${zusColors.info}30`,
                    }}
                >
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.primary} 100%)`,
                            boxShadow: `0 6px 20px ${zusColors.info}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Timeline sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            background: `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.primary} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Wizualizacje
                    </Typography>
                </Box>

                {/* ZUS Account Growth Chart */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            height: 520,
                            width: '100%',
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${zusColors.primary}05 0%, white 50%, ${zusColors.info}05 100%)`,
                            border: `1px solid ${zusColors.primary}20`,
                            boxShadow: `0 8px 32px ${zusColors.primary}15`,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: `0 12px 40px ${zusColors.primary}25`,
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.success} 100%)`,
                                    boxShadow: `0 4px 12px ${zusColors.primary}30`,
                                }}
                            >
                                <AccountBalance sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: zusColors.dark }}>
                                Wzrost środków na koncie ZUS
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            <ZUSAccountGrowthChart
                                data={state.results.accountGrowthProjection}
                                loading={state.uiState.isCalculating}
                            />
                        </Box>
                    </Paper>
                </Box>

                {/* Salary Projection Chart */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            height: 520,
                            width: '100%',
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${zusColors.info}05 0%, white 50%, ${zusColors.secondary}05 100%)`,
                            border: `1px solid ${zusColors.info}20`,
                            boxShadow: `0 8px 32px ${zusColors.info}15`,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: `0 12px 40px ${zusColors.info}25`,
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.secondary} 100%)`,
                                    boxShadow: `0 4px 12px ${zusColors.info}30`,
                                }}
                            >
                                <Timeline sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: zusColors.dark }}>
                                Projekcja wynagrodzeń
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            <SalaryProjectionChart
                                data={state.results.salaryProjection}
                                loading={state.uiState.isCalculating}
                            />
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

/** TrendChip */
const TrendChip = ({ trend }) => {
    if (trend == null || Number.isNaN(trend)) return null;
    const up = trend > 0;
    const label = `${up ? '▲' : '▼'} ${Math.abs(trend).toFixed(1)}%`;
    return (
        <Box
            component="span"
            sx={{
                ml: 1,
                px: 1,
                py: 0.25,
                borderRadius: 1.5,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.2,
                color: up ? '#0f5132' : '#842029',
                backgroundColor: up ? '#d1e7dd' : '#f8d7da',
                border: `1px solid ${up ? '#badbcc' : '#f5c2c7'}`,
                lineHeight: 1.2,
            }}
            aria-label={`Zmiana ${up ? 'w górę' : 'w dół'} o ${Math.abs(trend).toFixed(1)}%`}
        >
            {label}
        </Box>
    );
};

/** MetricCard */
const MetricCard = ({
                        title,
                        value,
                        subtitle,
                        icon,
                        color,
                        loading = false,
                        isPercentage = false,
                        showSign = false,
                        valueFormatter,
                        trend,
                    }) => {
    const formatVal = (v) => {
        if (loading) return '';
        if (isPercentage) {
            const sign = showSign && v > 0 ? '+' : '';
            const num = Number(v) || 0;
            return `${sign}${num.toFixed(1)}%`;
        }
        return valueFormatter ? valueFormatter(v) : String(v);
    };

    return (
        <Card
            elevation={0}
            sx={{
                width: '100%',
                minWidth: 0,
                minHeight: CARD_MIN_HEIGHT,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 3,
                background: `linear-gradient(180deg, ${color}10 0%, #fff 55%)`,
                border: `1px solid ${color}24`,
                boxShadow: `0 8px 28px ${color}1f`,
                transition: 'transform .25s ease, box-shadow .25s ease',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 14px 36px ${color}33`,
                },
            }}
        >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, minWidth: 0 }}>
                    <Box
                        sx={{
                            mr: 1.5,
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            background: `linear-gradient(135deg, ${color}, ${zusColors.dark})`,
                            boxShadow: `0 6px 16px ${color}40`,
                            color: '#fff',
                            flexShrink: 0,
                        }}
                    >
                        {icon || <Assessment />}
                    </Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 0.2,
                            color: zusColors.dark,
                            opacity: 0.9,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                        }}
                        title={title}
                    >
                        {title}
                    </Typography>
                    {!loading && <TrendChip trend={trend} />}
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {loading ? (
                        <>
                            <Skeleton variant="text" width="70%" height={42} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="40%" height={18} />
                        </>
                    ) : (
                        <>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 900,
                                    lineHeight: 1.15,
                                    background: `linear-gradient(135deg, ${color} 0%, ${zusColors.dark} 100%)`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 0.5,
                                    fontSize: { xs: '1.65rem', sm: '1.85rem', md: '2rem' },
                                }}
                            >
                                {formatVal(value)}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: zusColors.dark, opacity: 0.7, fontWeight: 600 }}
                            >
                                {subtitle}
                            </Typography>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default DashboardMainContent;
