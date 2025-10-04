// src/pages/SimulatorAdditionalFormPage.jsx
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
    const [sickMode, setSickMode] = useState('avg') // 'avg' | 'none' | 'custom'
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
            <AppHeader canGo={valid} onStart={() => valid && navigate('/simulator/result')} />

            <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
                    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
                        {/* krok 3 z 3 */}
                        <WizardProgress current={3} steps={4} />

                        <Grid
                            container
                            columnSpacing={3}
                            rowSpacing={3}
                            alignItems="stretch"
                            justifyContent="center"
                        >
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

                                    {/* Środki na koncie ZUS */}
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

                                    {/* Tryb chorobowego */}
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
                                    </TextField>

                                    {/* Pola własne – pokazywane warunkowo */}
                                    { sickMode === 'custom' && (
                                        <Grid
                                            container
                                            spacing={2.25}
                                            sx={{
                                                mt: 2.5,  // 🔹 większy odstęp od pola powyżej
                                                mb: 1.5,  // 🔹 trochę przestrzeni od tekstu poniżej
                                                transition: 'margin 0.2s ease-in-out'
                                            }}
                                        >

                                        <Grid item xs={12} md={4}>
                                                <TextField
                                                    fullWidth
                                                    label="Dni L4/rok"
                                                    value={sickDays}
                                                    onChange={(e) => setSickDays(e.target.value)}
                                                    type="number"
                                                    sx={inputSx}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    fullWidth
                                                    label="Lata z L4"
                                                    value={sickYears}
                                                    onChange={(e) => setSickYears(e.target.value)}
                                                    type="number"
                                                    sx={inputSx}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    fullWidth
                                                    label="Ubytek składek (%)"
                                                    value={sickLoss}
                                                    onChange={(e) => setSickLoss(e.target.value)}
                                                    type="number"
                                                    sx={inputSx}
                                                />
                                            </Grid>
                                        </Grid>
                                    )}

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Założenia chorobowe mają wpływ na podstawę wymiaru składek i mogą obniżyć świadczenie.
                                    </Typography>

                                    <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
                                        <Button variant="outlined" onClick={() => navigate(-1)}>Wstecz</Button>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => {
                                                // Combine basic and additional form data
                                                const combinedData = {
                                                    // Basic form data
                                                    ...basicFormData,
                                                    // Additional form data
                                                    zusBalance: zusBalance ? Number(zusBalance) : undefined,
                                                    sickMode,
                                                    includeSickLeave: sickMode !== 'none',
                                                    sickDays: sickMode === 'custom' ? Number(sickDays) : undefined,
                                                    sickYears: sickMode === 'custom' ? Number(sickYears) : undefined,
                                                    sickLoss: sickMode === 'custom' ? Number(sickLoss) : undefined,
                                                }
                                                
                                                // Create mock API request/response based on form data
                                                const mockRequest = {
                                                    age: combinedData.age,
                                                    sex: combinedData.gender === 'K' ? 'F' : 'M',
                                                    grossSalaryPLN: combinedData.wage,
                                                    startYear: combinedData.startYear,
                                                    plannedEndYear: combinedData.endYear,
                                                    expectedPensionPLN: combinedData.goal,
                                                    includeSickLeave: combinedData.includeSickLeave,
                                                    zusAccountFundsPLN: combinedData.zusBalance,
                                                }
                                                
                                                // In a real app, you would make an API call here
                                                // For now, navigate with the form data
                                                navigate('/simulator/result', { 
                                                    state: { 
                                                        request: mockRequest,
                                                        formData: combinedData,
                                                        // response will be mocked in the results page
                                                    } 
                                                })
                                            }} 
                                            disabled={!valid}
                                        >
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
