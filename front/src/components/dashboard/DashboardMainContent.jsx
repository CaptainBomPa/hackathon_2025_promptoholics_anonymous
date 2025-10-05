import React from 'react'
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Skeleton,
    Alert,
} from '@mui/material'
import {
    TrendingUp,
    Assessment,
    Timeline,
    Work,
    LocalHospital,
    CheckCircle,
    HourglassBottom
} from '@mui/icons-material'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { styled } from '@mui/material/styles'
import { tooltipClasses } from '@mui/material/Tooltip'
import Tooltip from '@mui/material/Tooltip'
import { useDashboard } from '../../contexts/DashboardContext'
import { zusColors } from '../../constants/zus-colors'
import { formatCurrency } from '../../utils/pension-formatting'
import { ZUSAccountGrowthChart, SalaryProjectionChart } from './charts'
import { useCountUp } from '../../hooks/useCountUp'

const CARD_MIN_HEIGHT = 180

/* ===== FancyTooltip (stylowana wersja MUI Tooltip) ===== */
const FancyTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
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
        color: zusColors.primary
    }
}))

const DashboardMainContent = () => {
    const { state, computed } = useDashboard()

    return (
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
            {computed.hasErrors && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        Wykryto błędy w parametrach. Sprawdź ustawienia w panelu bocznym.
                    </Typography>
                </Alert>
            )}

            {state.uiState.isCalculating && (
                <Box sx={{ mb: 3 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Przeliczanie wyników...
                    </Typography>
                </Box>
            )}

            <Box
                id="report-summary"
                sx={{
                    mb: 0,
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 1,
                    backdropFilter: 'blur(6px)',
                    background: `linear-gradient(135deg, ${zusColors.primary}0A 0%, ${zusColors.info}08 100%)`,
                    border: `1px solid ${zusColors.primary}26`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    minWidth: 0
                }}
                aria-label="Podsumowanie wyników"
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        mb: 3,
                        flexWrap: 'wrap',
                        minWidth: 0
                    }}
                >
                    <SectionHeader
                        icon={<Assessment />}
                        title="Podsumowanie wyników"
                        from={zusColors.primary}
                        to={zusColors.info}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FancyTooltip title="Metryki bazują na aktualnych parametrach z panelu. Wartości mogą się zmieniać po korektach.">
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 1.25,
                                    py: 0.75,
                                    borderRadius: 1,
                                    border: `1px solid ${zusColors.info}33`,
                                    // backgroundColor: `${zusColors.info}10`,
                                    // color: zusColors.dark,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    cursor: 'help'
                                }}
                            >
                                Aktualne parametry
                            </Typography>
                        </FancyTooltip>
                    </Box>
                </Box>

                {/* === METRICS GRID === */}
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2.5,
                        alignItems: 'stretch',
                        gridAutoFlow: 'row dense',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            xl: 'repeat(4, minmax(0, 1fr))'
                        },
                        minWidth: 0
                    }}
                >
                    <MetricCard
                        title="Emerytura rzeczywista"
                        value={state.results.realAmountDeflated ?? 2950}
                        subtitle="w dzisiejszych cenach"
                        icon={<MonetizationOnIcon />}
                        color={zusColors.info}
                        loading={state.uiState.isCalculating}
                        valueFormatter={(v) => formatCurrency(Math.round(v))}
                        trend={state.results?.realAmountDeflatedDeltaPct}
                        tooltip="Kwota emerytury przeliczona do dzisiejszych cen (po inflacji). Pokazuje realną siłę nabywczą świadczenia."
                    />

                    <MetricCard
                        title="Emerytura nominalna"
                        value={state.results.actualAmountPLN ?? 3850}
                        subtitle="w przyszłych cenach"
                        icon={<TrendingUp />}
                        color={zusColors.primary}
                        loading={state.uiState.isCalculating}
                        valueFormatter={(v) => formatCurrency(Math.round(v))}
                        trend={state.results?.nominalDeltaPct}
                        tooltip="Prognozowana kwota w cenach z roku przejścia na emeryturę (bez deflowania). To „kwota na pasku” w przyszłości."
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
                        tooltip="Procent pierwszej emerytury względem ostatniego wynagrodzenia w modelu. Pomaga ocenić utrzymanie poziomu dochodów."
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
                        tooltip="Różnica (w p.p.) Twojej stopy zastąpienia względem prognozowanej średniej w roku przejścia na emeryturę. Dodatnia = powyżej średniej."
                    />
                </Box>
            </Box>

            {/* === CHARTS === */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Paper
                        id="report-zus-chart"
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            height: 520,
                            width: '100%',
                            borderRadius: 1,
                            background: `linear-gradient(135deg, ${zusColors.primary}05 0%, white 50%, ${zusColors.info}05 100%)`,
                            border: `1px solid ${zusColors.primary}20`,
                            boxShadow: `0 8px 32px ${zusColors.primary}15`,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: `0 12px 40px ${zusColors.primary}25`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <SectionHeader
                            icon={<MonetizationOnIcon />}
                            title="Wzrost środków na koncie ZUS"
                            from={zusColors.primary}
                            to={zusColors.success}
                            sx={{ mb: 3 }}
                        />
                        <Box sx={{ width: '100%' }}>
                            <ZUSAccountGrowthChart
                                data={state.results.accountGrowthProjection}
                                loading={state.uiState.isCalculating}
                            />
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Paper
                        id="report-salary-chart"
                        elevation={0}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            height: 520,
                            width: '100%',
                            borderRadius: 1,
                            background: `linear-gradient(135deg, ${zusColors.info}05 0%, white 50%, ${zusColors.secondary}05 100%)`,
                            border: `1px solid ${zusColors.info}20`,
                            boxShadow: `0 8px 32px ${zusColors.info}15`,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: `0 12px 40px ${zusColors.info}25`,
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <SectionHeader
                            icon={<Timeline />}
                            title="Projekcja wynagrodzeń"
                            from={zusColors.info}
                            to={zusColors.secondary}
                            sx={{ mb: 3 }}
                        />
                        <Box sx={{ width: '100%' }}>
                            <SalaryProjectionChart
                                data={state.results.salaryProjection}
                                loading={state.uiState.isCalculating}
                            />
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* === DODATKOWE KARTY === */}
            {(() => {
                const cards = []
                if (state.parameters.sickLeave?.mode !== 'none') {
                    cards.push(
                        <SickLeaveCard
                            key="sick"
                            sickLeaveMode={state.parameters.sickLeave?.mode}
                            customDays={state.parameters.sickLeave?.customDays}
                            currentPension={state.results?.actualAmountPLN}
                            wageWithSickLeave={state.results?.wageInclSickLeavePLN}
                            wageWithoutSickLeave={state.results?.wageExclSickLeavePLN}
                            loading={state.uiState.isCalculating}
                        />
                    )
                }
                if (state.parameters.zusAccount?.workAfterRetirement > 0) {
                    cards.push(
                        <WorkAfterRetirementCard
                            key="work"
                            workAfterRetirement={state.parameters.zusAccount.workAfterRetirement}
                            postponedData={state.results?.ifPostponedYears}
                            currentPension={state.results?.actualAmountPLN}
                            loading={state.uiState.isCalculating}
                        />
                    )
                }
                cards.push(
                    <ExpectationStatusCard
                        key="expect"
                        meetsExpectation={state.results?.meetsExpectation}
                        loading={state.uiState.isCalculating}
                    />
                )
                return cards.length ? (
                    <Box
                        sx={{
                            mt: 4,
                            display: 'grid',
                            gap: 3,
                            alignItems: 'stretch',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(auto-fit, minmax(320px, 1fr))'
                            }
                        }}
                    >
                        {cards}
                    </Box>
                ) : null
            })()}
        </Box>
    )
}

/* === POMOCNICZE KOMPONENTY === */

const TrendChip = ({ trend }) => {
    if (trend == null || Number.isNaN(trend)) return null
    const up = trend > 0
    const label = `${up ? '▲' : '▼'} ${Math.abs(trend).toFixed(1)}%`
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
                lineHeight: 1.2
            }}
            aria-label={`Zmiana ${up ? 'w górę' : 'w dół'} o ${Math.abs(trend).toFixed(1)}%`}
        >
            {label}
        </Box>
    )
}

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
                        tooltip
                    }) => {
    const numericValue = Number(value) || 0
    const decimals = isPercentage ? 1 : 0
    const animatedValue = useCountUp(numericValue, 1500, decimals, !loading)
    const formatVal = (v) => {
        if (loading) return ''
        if (isPercentage) {
            const sign = showSign && v > 0 ? '+' : ''
            return `${sign}${v.toFixed(1)}%`
        }
        return valueFormatter ? valueFormatter(v) : String(Math.round(v))
    }

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
                borderRadius: 1,
                background: `linear-gradient(180deg, ${color}10 0%, #fff 55%)`,
                border: `1px solid ${color}24`,
                boxShadow: `0 8px 28px ${color}1f`,
                transition: 'transform .25s ease, box-shadow .25s ease',
                overflow: 'hidden',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 14px 36px ${color}33` }
            }}
        >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, minWidth: 0 }}>
                    <IconBadge from={color} to={zusColors.dark}>{icon || <Assessment />}</IconBadge>
                    <Typography
                        variant="body2"
                        sx={{
                            ml: 1.5,
                            fontWeight: 800,
                            letterSpacing: 0.2,
                            color: zusColors.dark,
                            opacity: 0.9,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                        }}
                        title={title}
                    >
                        {title}
                    </Typography>
                    {tooltip && !loading && (
                        <FancyTooltip title={tooltip}>
                            <InfoOutlinedIcon
                                aria-label={`Informacja: ${title}`}
                                sx={{ ml: 1, fontSize: 18, opacity: 0.75, cursor: 'help', flexShrink: 0 }}
                            />
                        </FancyTooltip>
                    )}
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
                                    fontSize: { xs: '1.65rem', sm: '1.85rem', md: '2rem' }
                                }}
                            >
                                {formatVal(animatedValue)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: zusColors.dark, opacity: 0.7, fontWeight: 600 }}>
                                {subtitle}
                            </Typography>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

const SickLeaveCard = ({ sickLeaveMode, customDays, currentPension, wageWithSickLeave, wageWithoutSickLeave, loading }) => {
    const calculateSickLeaveImpact = () => {
        if (sickLeaveMode === 'none') return { impact: 0, description: 'Zwolnienia nie są uwzględniane' }
        if (sickLeaveMode === 'averaged') {
            const averageImpact = (currentPension || 0) * 0.03
            return { impact: Math.round(averageImpact), description: 'Średnia krajowa: ~12-15 dni/rok' }
        }
        if (sickLeaveMode === 'custom' && customDays > 0) {
            const dailyImpact = (currentPension || 0) * 0.0027
            const totalImpact = dailyImpact * customDays
            return { impact: Math.round(totalImpact), description: `${customDays} dni rocznie` }
        }
        return { impact: 0, description: 'Brak danych' }
    }

    const { impact, description } = calculateSickLeaveImpact()
    const percent = currentPension > 0 ? Math.round((impact / currentPension) * 100) : 0
    const actualImpact = wageWithSickLeave && wageWithoutSickLeave ? Math.round(wageWithoutSickLeave - wageWithSickLeave) : impact
    const actualPercent =
        wageWithSickLeave && wageWithoutSickLeave && wageWithoutSickLeave > 0
            ? Math.round(((wageWithoutSickLeave - wageWithSickLeave) / wageWithoutSickLeave) * 100)
            : percent

    return (
        <Paper elevation={0} sx={{ width: '100%', p: 3, borderRadius: 1, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: zusColors.error, color: '#fff', boxShadow: `0 6px 18px ${zusColors.error}44`, flexShrink: 0 }}>
                    <LocalHospital sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: zusColors.dark, lineHeight: 1.1 }}>Zwolnienia chorobowe</Typography>
                    <Typography variant="body2" sx={{ color: `${zusColors.dark}99` }}>{description}</Typography>
                </Box>
                {!loading && actualImpact > 0 && (
                    <Box sx={{ ml: 'auto', px: 1.25, py: 0.5, borderRadius: 999, fontSize: 12, fontWeight: 800, bgcolor: `${zusColors.error}15`, color: zusColors.error, border: `1px solid ${zusColors.error}33`, whiteSpace: 'nowrap' }}>
                        -{actualPercent}% emerytury
                    </Box>
                )}
            </Box>

            {loading ? (
                <Box>
                    <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" height={10} />
                </Box>
            ) : (
                <Box>
                    <Box sx={{ p: 2, borderRadius: 2, border: '0px', bgcolor: '#fff' }}>
                        <Typography variant="caption" sx={{ color: `${zusColors.dark}99`, fontWeight: 700 }}>{actualImpact > 0 ? 'Szacunkowa strata miesięczna' : 'Wpływ na emeryturę'}</Typography>
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: actualImpact > 0 ? zusColors.error : zusColors.success, lineHeight: 1.15 }}>
                            {actualImpact > 0 ? `-${actualImpact.toLocaleString('pl-PL')} PLN / mies.` : 'Brak wpływu'}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Paper>
    )
}

const ExpectationStatusCard = ({ meetsExpectation, loading }) => {
    const isMet = !!(meetsExpectation && meetsExpectation.isMet)
    const shortfall = Math.max(0, Math.round(meetsExpectation?.shortfallPLN ?? 0))
    const years = Math.max(0, parseInt(meetsExpectation?.extraYearsRequiredEstimate ?? 0, 10))
    const yearsLabel = years === 1 ? 'rok' : years >= 2 && years <= 4 ? 'lata' : 'lat'
    const badgeBg = isMet ? zusColors.success : zusColors.error
    const title = isMet ? 'Oczekiwania spełnione' : 'Oczekiwania niespełnione'

    return (
        <Paper elevation={0} sx={{ width: '100%', p: 3, borderRadius: 1, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <IconBadge from={badgeBg} to={zusColors.dark}>{isMet ? <CheckCircle /> : <HourglassBottom />}</IconBadge>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: zusColors.dark, lineHeight: 1.1 }}>{title}</Typography>
                    <Typography variant="body2" sx={{ color: `${zusColors.dark}99` }}>
                        {isMet ? 'Twoja prognozowana emerytura osiąga oczekiwany poziom.' : 'Aby spełnić oczekiwania, rozważ dodatkowe działania.'}
                    </Typography>
                </Box>
            </Box>

            {loading ? (
                <Box>
                    <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" height={10} />
                </Box>
            ) : isMet ? (
                <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: zusColors.success, lineHeight: 1.15 }}>
                    Gratulacje! Cel osiągnięty.
                </Typography>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: `1px solid ${zusColors.error}22` }}>
                        <Typography variant="caption" sx={{ color: `${zusColors.dark}99`, fontWeight: 700 }}>Brakuje miesięcznie</Typography>
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: zusColors.error, lineHeight: 1.15 }}>
                            {formatCurrency(shortfall)}
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: `1px solid ${zusColors.primary}22` }}>
                        <Typography variant="caption" sx={{ color: `${zusColors.dark}99`, fontWeight: 700 }}>Szacowany dodatkowy czas</Typography>
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: zusColors.primary, lineHeight: 1.15 }}>
                            {years} {yearsLabel}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Paper>
    )
}

const WorkAfterRetirementCard = ({ workAfterRetirement, postponedData, currentPension, loading }) => {
    const yearsText = workAfterRetirement === 1 ? 'rok' : workAfterRetirement < 5 ? 'lata' : 'lat'
    const estimateAmount = () => {
        if (!postponedData || postponedData.length === 0) {
            const mid = workAfterRetirement * ((200 + 350) / 2)
            return Math.max((currentPension || 0) + mid, 0)
        }
        const exact = postponedData.find((item) => {
            const y = parseInt(item.year || item.postponedByYears || item.years || 0, 10)
            return y === workAfterRetirement
        })
        if (exact) return exact.actualAmountPLN || 0
        const sorted = postponedData
            .map((item) => ({ years: parseInt(item.year || item.postponedByYears || item.years || 0, 10), amount: item.actualAmountPLN || 0 }))
            .sort((a, b) => a.years - b.years)
        if (sorted.length >= 2) {
            const first = sorted[0]
            const last = sorted[sorted.length - 1]
            if (workAfterRetirement <= first.years) {
                const p1 = sorted[0], p2 = sorted[1]
                const slope = (p2.amount - p1.amount) / ((p2.years - p1.years) || 1)
                return p1.amount + slope * (workAfterRetirement - p1.years)
            }
            if (workAfterRetirement >= last.years) {
                const p1 = sorted[sorted.length - 2], p2 = last
                const slope = (p2.amount - p1.amount) / ((p2.years - p1.years) || 1)
                return p2.amount + slope * (workAfterRetirement - p2.years)
            }
            for (let i = 0; i < sorted.length - 1; i++) {
                const p1 = sorted[i], p2 = sorted[i + 1]
                if (workAfterRetirement >= p1.years && workAfterRetirement <= p2.years) {
                    const ratio = (workAfterRetirement - p1.years) / ((p2.years - p1.years) || 1)
                    return p1.amount + ratio * (p2.amount - p1.amount)
                }
            }
        }
        const mid = workAfterRetirement * ((200 + 350) / 2)
        return Math.max((currentPension || 0) + mid, 0)
    }

    const estimatedAmount = Math.max(Math.round(estimateAmount()), 0)
    const diff = Math.max(Math.round(estimatedAmount - (currentPension || 0)), 0)
    const percent = Math.max(Math.round(((estimatedAmount - (currentPension || 0)) / ((currentPension || 0) || 1)) * 100), 0)

    return (
        <Paper elevation={0} sx={{ width: '100%', p: 3, borderRadius: 1, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center,', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: zusColors.primary, color: '#fff', boxShadow: `0 6px 18px ${zusColors.primary}44`, flexShrink: 0 }}>
                    <Work sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: zusColors.dark, lineHeight: 1.1 }}>Praca po wieku emerytalnym</Typography>
                    <Typography variant="body2" sx={{ color: `${zusColors.dark}99` }}>
                        Dodatkowy okres pracy: <b>{workAfterRetirement} {yearsText}</b>
                    </Typography>
                </Box>
                {!loading && (
                    <Box sx={{ ml: 'auto', px: 1.25, py: 0.5, borderRadius: 999, fontSize: 12, fontWeight: 800, bgcolor: `${zusColors.success}15`, color: zusColors.success, border: `1px solid ${zusColors.success}33`, whiteSpace: 'nowrap' }}>
                        +{percent}% vs obecnie
                    </Box>
                )}
            </Box>

            {loading ? (
                <Box>
                    <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" height={10} />
                </Box>
            ) : (
                <Box>
                    <Box sx={{ p: 2, borderRadius: 2, border: '0px', bgcolor: '#fff' }}>
                        <Typography variant="caption" sx={{ color: `${zusColors.dark}99`, fontWeight: 700 }}>Wzrost względem obecnej</Typography>
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: zusColors.primary, lineHeight: 1.15 }}>
                            +{diff.toLocaleString('pl-PL')} PLN / mies.
                        </Typography>
                    </Box>
                </Box>
            )}
        </Paper>
    )
}

const IconBadge = ({ children, from, to, size = 44 }) => (
    <Box
        sx={{
            width: size,
            height: size,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            background: `linear-gradient(135deg, ${from}, ${to})`,
            boxShadow: `0 6px 18px ${from}44`,
            color: '#fff',
            flexShrink: 0
        }}
    >
        {React.cloneElement(children, { sx: { fontSize: size * 0.55, color: 'white' } })}
    </Box>
)

const SectionHeader = ({ icon, title, from, to, compact = false, sx }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, ...sx }}>
        <IconBadge from={from} to={to} size={compact ? 40 : 48}>{icon}</IconBadge>
        <Typography
            variant={compact ? 'subtitle1' : 'h6'}
            sx={{
                fontWeight: 800,
                letterSpacing: 0.2,
                background: `linear-gradient(135deg, ${from} 0%, ${zusColors.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
            title={title}
        >
            {title}
        </Typography>
    </Box>
)

export default DashboardMainContent
