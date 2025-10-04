import React, { useMemo, useState } from 'react'
import {
    Box, Container, Typography, Paper, TextField, Button,
    InputAdornment, MenuItem, Stack, Divider, Grid
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/common/AppHeader'
import WizardProgress from '../components/common/WizardProgress'

export default function SimulatorAdditionalFormPage() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const basicFormData = state?.basicFormData

    const [zusBalance, setZusBalance] = useState()
    const [sickMode, setSickMode] = useState('avg')
    const [sickDays, setSickDays] = useState('7')
    const [sickYears, setSickYears] = useState('5')
    const [sickLoss, setSickLoss] = useState('15')

    const validMoney = zusBalance === '' ? true : Number(zusBalance) >= 0
    const validCustom = sickMode !== 'custom'
        ? true
        : [sickDays, sickYears, sickLoss].every(v => v !== '' && Number(v) >= 0)

    const valid = useMemo(() => validMoney && validCustom, [validMoney, validCustom])

    const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
    const plnAdornment = (
        <InputAdornment position="end">
            <Box sx={{ px: 1.25, py: 0.5, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1.5, color: 'text.secondary' }}>
                PLN
            </Box>
        </InputAdornment>
    )

    const buildCombinedData = () => ({
        ...basicFormData,
        zusBalance: zusBalance ? Number(zusBalance) : undefined,
        sickMode,
        includeSickLeave: sickMode !== 'none',
        sickDays: sickMode === 'custom' ? Number(sickDays) : undefined,
        sickYears: sickMode === 'custom' ? Number(sickYears) : undefined,
        sickLoss: sickMode === 'custom' ? Number(sickLoss) : undefined,
    })

    const buildRequest = (combined) => ({
        age: combined.age,
        sex: combined.gender === 'K' ? 'F' : 'M',
        grossSalaryPLN: combined.wage,
        startYear: combined.startYear,
        plannedEndYear: combined.endYear,
        expectedPensionPLN: combined.goal,
        includeSickLeave: combined.includeSickLeave,
        zusAccountFundsPLN: combined.zusBalance,
    })

    const createMockData = (req) => {
        const currentYear = new Date().getFullYear()
        const age = req?.age || 35
        const gross = req?.grossSalaryPLN || 8500
        const plannedEndYear = req?.plannedEndYear || (currentYear + (65 - age))
        const expected = req?.expectedPensionPLN || 4500
        const includeSick = req?.includeSickLeave ?? true
        const request = req || {
            age,
            sex: 'F',
            grossSalaryPLN: gross,
            startYear: currentYear - 10,
            plannedEndYear,
            expectedPensionPLN: expected,
            includeSickLeave: includeSick,
            zusAccountFundsPLN: 85000,
        }
        const baseAmount = gross * 0.45
        const sickLeaveReduction = includeSick ? 0.95 : 1.0
        const actualAmount = Math.round(baseAmount * sickLeaveReduction)
        const realAmount = Math.round(actualAmount * 0.75)
        const response = {
            id: 'mock-calculation-' + Date.now(),
            requestedAt: new Date().toISOString(),
            result: {
                actualAmountPLN: actualAmount,
                realAmountDeflated: realAmount,
                replacementRatePct: Math.round((actualAmount / gross) * 1000) / 10,
                vsAverageInRetirementYearPct: Math.round((Math.random() - 0.5) * 30 * 10) / 10,
                wageInclSickLeavePLN: includeSick ? Math.round(gross * 0.95) : gross,
                wageExclSickLeavePLN: gross,
                ifPostponedYears: [
                    { postponedByYears: 1, actualAmountPLN: Math.round(actualAmount * 1.08) },
                    { postponedByYears: 2, actualAmountPLN: Math.round(actualAmount * 1.16) },
                    { postponedByYears: 5, actualAmountPLN: Math.round(actualAmount * 1.35) }
                ],
                meetsExpectation: {
                    isMet: actualAmount >= expected,
                    shortfallPLN: Math.max(0, expected - actualAmount),
                    extraYearsRequiredEstimate: actualAmount < expected ? Math.ceil((expected - actualAmount) / 150) : 0
                },
                zusAccountFundsByYear: [
                    { year: plannedEndYear - 5, zusAccountFundsPLN: 180000 },
                    { year: plannedEndYear, zusAccountFundsPLN: 220000 }
                ]
            }
        }
        return { request, response }
    }

    const getSimulationResults = (request, response) => {
        const result = response.result
        const avgAtRet = result.actualAmountPLN * (1 - (result.vsAverageInRetirementYearPct / 100))
        return {
            realAmount: result.realAmountDeflated || result.actualAmountPLN,
            adjustedAmount: result.actualAmountPLN,
            averagePensionAtRetirement: avgAtRet,
            replacementRate: result.replacementRatePct,
            salaryWithoutSickLeave: result.wageExclSickLeavePLN,
            salaryWithSickLeave: result.wageInclSickLeavePLN,
            pensionWithoutSickLeave: result.actualAmountPLN,
            pensionWithSickLeave: Math.round(result.actualAmountPLN * 0.95),
            delayBenefits: {
                oneYear: result.ifPostponedYears?.find(p => p.postponedByYears === 1)?.actualAmountPLN || Math.round(result.actualAmountPLN * 1.08),
                twoYears: result.ifPostponedYears?.find(p => p.postponedByYears === 2)?.actualAmountPLN || Math.round(result.actualAmountPLN * 1.16),
                fiveYears: result.ifPostponedYears?.find(p => p.postponedByYears === 5)?.actualAmountPLN || Math.round(result.actualAmountPLN * 1.35),
            },
            retirementYear: request.plannedEndYear,
            currentAge: request.age,
            includedSickLeave: request.includeSickLeave || false,
        }
    }

    const getUserExpectations = (request, response, simulationResults) => {
        const expectedAmount = request.expectedPensionPLN || 4000
        const actualAmount = simulationResults.realAmount
        const meets = response.result?.meetsExpectation
        const additionalWorkYearsNeeded = meets?.extraYearsRequiredEstimate ||
            (expectedAmount > actualAmount ? Math.ceil((expectedAmount - actualAmount) / 100) : 0)
        return { expectedAmount, additionalWorkYearsNeeded }
    }

    const goDashboard = () => {
        const combined = buildCombinedData()
        const req = buildRequest(combined)
        const { request, response } = createMockData(req)
        const simulationResults = getSimulationResults(request, response)
        const userExpectations = getUserExpectations(request, response, simulationResults)
        navigate('/dashboard', { state: { simulationResults, userExpectations, request } })
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: (t) => t.palette.background.default,
                backgroundImage: (t) =>
                    t.palette.mode === 'dark'
                        ? 'radial-gradient(1200px 400px at 10% 0%, rgba(0,180,100,0.25), rgba(0,0,0,0) 60%), linear-gradient(135deg, rgba(0,65,110,0.2), rgba(63,132,210,0.08))'
                        : 'radial-gradient(1200px 400px at 10% 0%, rgba(0,200,120,0.18), rgba(255,255,255,0) 60%), linear-gradient(135deg, rgba(0,153,63,0.06), rgba(63,132,210,0.06))'
            }}
        >
            <AppHeader canGo={valid} onStart={() => valid && goDashboard()} />

            <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
                    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
                        <WizardProgress current={3} steps={4} />

                        <Grid container columnSpacing={3} rowSpacing={3} alignItems="stretch" justifyContent="center">
                            <Grid item xs={12} md={10} lg={8}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        borderRadius: 1,
                                        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(20,24,36,0.70)' : 'rgba(255,255,255,0.85)'),
                                        backdropFilter: 'saturate(180%) blur(6px)',
                                        boxShadow: (t) => t.shadows[3]
                                    }}
                                >
                                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                                        Kreator • Opcje dodatkowe
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Uzupełnij opcjonalne parametry. Jeśli pominiesz, użyjemy uśrednionych założeń.
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Środki na koncie ZUS"
                                        placeholder="np. 120000"
                                        value={zusBalance}
                                        onChange={(e) => setZusBalance(e.target.value)}
                                        type="number"
                                        InputProps={{ endAdornment: plnAdornment }}
                                        sx={inputSx}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25, mb: 2.5 }}>
                                        Jeśli nie wiesz, zostaw puste — oszacujemy na podstawie wynagrodzenia.
                                    </Typography>

                                    <TextField
                                        select
                                        fullWidth
                                        label="Uwzględnij zwolnienia chorobowe"
                                        value={sickMode}
                                        onChange={(e) => setSickMode(e.target.value)}
                                        sx={inputSx}
                                    >
                                        <MenuItem value="avg">Średnie dla płci</MenuItem>
                                        <MenuItem value="none">Bez chorobowego</MenuItem>
                                        <MenuItem value="custom">Własne założenia</MenuItem>
                                    </TextField>

                                    {sickMode === 'custom' && (
                                        <Grid container spacing={2.25} sx={{ mt: 2.5, mb: 1.5, transition: 'margin 0.2s ease-in-out' }}>
                                            <Grid item xs={12} md={4}>
                                                <TextField fullWidth label="Dni L4/rok" value={sickDays} onChange={(e) => setSickDays(e.target.value)} type="number" sx={inputSx} />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField fullWidth label="Lata z L4" value={sickYears} onChange={(e) => setSickYears(e.target.value)} type="number" sx={inputSx} />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField fullWidth label="Ubytek składek (%)" value={sickLoss} onChange={(e) => setSickLoss(e.target.value)} type="number" sx={inputSx} />
                                            </Grid>
                                        </Grid>
                                    )}

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Założenia chorobowe mają wpływ na podstawę wymiaru składek i mogą obniżyć świadczenie.
                                    </Typography>

                                    <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
                                        <Button variant="outlined" onClick={() => navigate(-1)}>Wstecz</Button>
                                        <Button variant="contained" onClick={goDashboard} disabled={!valid}>
                                            Przelicz i pokaż wynik
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3, opacity: 0.6 }} />

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                © ZUS (mock) • Ten plik to prototyp UI do warsztatów — wartości i obliczenia są fikcyjne.
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    )
}
