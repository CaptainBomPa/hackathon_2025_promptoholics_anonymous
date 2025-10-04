import React, { useMemo, useState } from 'react'
import {
    Box, Container, Typography, Paper, TextField, Button,
    InputAdornment, Grid, Stack, Chip, Divider
} from '@mui/material'
import TimelineIcon from '@mui/icons-material/Timeline'
import ContrastIcon from '@mui/icons-material/Contrast'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useNavigate } from 'react-router-dom'
import { useUiPrefs } from '../contexts/UiPrefsContext'
import { Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, useTheme } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import WizardProgress from "../components/common/WizardProgress";


export default function HomePage() {
    const navigate = useNavigate()
    const { toggleMode, incFont, decFont } = useUiPrefs()

    const [expectedPension, setExpectedPension] = useState('')
    const [error, setError] = useState('')

    const validate = (val) => {
        if (val === '' || val === null) return 'Podaj kwotę'
        const num = Number(val)
        if (!Number.isFinite(num)) return 'Wpisz liczbę'
        if (num < 0) return 'Kwota nie może być ujemna'
        if (num > 1_000_000) return 'Kwota wydaje się zbyt wysoka'
        return ''
    }

    const onChange = (e) => {
        const val = e.target.value
        setExpectedPension(val)
        setError(validate(val))
    }
    const onBlur = () => setError(validate(expectedPension))
    const canGo = useMemo(() => validate(expectedPension) === '', [expectedPension])
    const startSimulation = () => {
        if (!canGo) { setError(validate(expectedPension)); return }
        navigate('/simulator', { state: { expectedPension: Number(expectedPension) } })
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
            <Box
                component="header"
                sx={{
                    width: '100%',
                    height: '100px',
                    bgcolor: (t) => t.palette.mode === 'dark' ? "#000" : "#fff",
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                    boxShadow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >

                <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
                    <Box
                        sx={{
                            maxWidth: 1280,
                            mx: 'auto',
                            py: 1.25,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 2,
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: (t) => t.palette.success.main + '22',
                                    color: 'success.main'
                                }}
                            >
                                <TimelineIcon fontSize="small" />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                ZUS • Symulator emerytalny
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button size="small" startIcon={<ContrastIcon />} onClick={toggleMode} variant="outlined">Kontrast</Button>
                            <Button size="small" startIcon={<AddIcon />} onClick={incFont} variant="outlined">A+</Button>
                            <Button size="small" startIcon={<RemoveIcon />} onClick={decFont} variant="outlined">A−</Button>
                            <Button size="small" startIcon={<PlayArrowIcon />} onClick={startSimulation} variant="contained" disabled={!canGo}>Rozpocznij</Button>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
                    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
                        <WizardProgress current={1} steps={4} />

                        <Grid container columnSpacing={3} rowSpacing={3} alignItems="stretch" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                            <Grid item xs={12} md={8} sx={{ minWidth: 0, flexBasis: { md: '65%' }, maxWidth: { md: '65%' } }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        borderRadius: 1,
                                        height: '100%',
                                        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(20,24,36,0.70)' : 'rgba(255,255,255,0.85)',
                                        backdropFilter: 'saturate(180%) blur(6px)',
                                        boxShadow: (t) => t.shadows[3]
                                    }}
                                >
                                    <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1, mb: 1 }}>
                                        Jaki poziom emerytury chcesz osiągnąć?
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        Wpisz kwotę brutto, którą chciał(a)byś otrzymywać co miesiąc po przejściu na emeryturę.
                                    </Typography>

                                    <Box sx={{ display: 'grid', gap: 2.25, width: '100%' }}>
                                        <TextField
                                            placeholder="np. 5200"
                                            label="Kwota oczekiwana (PLN)"
                                            value={expectedPension}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            type="number"
                                            inputProps={{ min: 0, step: 100, 'aria-label': 'oczekiwana emerytura w złotych' }}
                                            fullWidth
                                            error={Boolean(error)}
                                            helperText={error || 'Podaj kwotę miesięczną (brutto).'}
                                            InputProps={{ endAdornment: <InputAdornment position="end">PLN</InputAdornment> }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />

                                        <Stack direction="row" spacing={1.25}>
                                            <Button variant="contained" onClick={startSimulation} disabled={!canGo}>Przejdź do symulacji</Button>
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={4} sx={{ minWidth: 0, flexBasis: { md: '35%' }, maxWidth: { md: '35%' } }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        borderRadius: 1,
                                        height: '100%',
                                        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(20,24,36,0.70)' : 'rgba(255,255,255,0.85)',
                                        backdropFilter: 'saturate(180%) blur(6px)',
                                        boxShadow: (t) => t.shadows[3]
                                    }}
                                >
                                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                                        CZY WIESZ, ŻE…
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 1.5 }}>
                                        Wydłużenie aktywności o 2 lata może znacząco zwiększyć świadczenie.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        To tylko przykład edukacyjny. Szczegółowe wyliczenia zobaczysz w wynikach symulacji dla Twoich danych.
                                    </Typography>
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
