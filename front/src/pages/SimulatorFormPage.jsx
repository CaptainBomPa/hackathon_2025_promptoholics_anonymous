import React, { useMemo, useState } from 'react'
import {
    Box, Container, Typography, Paper, TextField, Button,
    InputAdornment, Grid, Stack, Divider, MenuItem, Chip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/common/AppHeader'
import WizardProgress from '../components/common/WizardProgress'

export default function SimulatorFormPage() {
    const navigate = useNavigate()

    const [age, setAge] = useState('33')
    const [gender, setGender] = useState('K')
    const [wage, setWage] = useState('9200')
    const [startYear, setStartYear] = useState('2017')
    const [endYear, setEndYear] = useState('2055')
    const [goal, setGoal] = useState('5200')

    const ageError = age === '' || Number(age) < 16 || Number(age) > 80
    const wageError = wage === '' || Number(wage) <= 0

    const valid = useMemo(() => !ageError && !wageError && [startYear, endYear, goal].every(v => Number(v) >= 0), [ageError, wageError, startYear, endYear, goal])

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
            <AppHeader canGo={valid} onStart={() => valid && navigate('/simulator')} />

            <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
                <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
                    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
                        <WizardProgress current={2} steps={4}/>

                        <Grid container justifyContent="center" columnSpacing={3} rowSpacing={3} alignItems="stretch">
                            <Grid item xs={12}>
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
                                        Kreator • Dane podstawowe
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Wypełnij wymagane pola. Później skonfigurujesz opcje dodatkowe.
                                    </Typography>

                                    {/* Wiersz 1: 3 kolumny */}
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                            gap: 2.25
                                        }}
                                    >
                                        <TextField
                                            label="Wiek (16–80)"
                                            placeholder="np. 33"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            type="number"
                                            fullWidth
                                            error={ageError}
                                            helperText={ageError ? 'Podaj wiek 16–80.' : ' '}
                                            sx={inputSx}
                                        />

                                        <TextField
                                            select
                                            label="Płeć"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            fullWidth
                                            sx={inputSx}
                                        >
                                            <MenuItem value="K">Kobieta</MenuItem>
                                            <MenuItem value="M">Mężczyzna</MenuItem>
                                        </TextField>

                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="Wynagrodzenie brutto (PLN/mc)"
                                                placeholder="np. 9200"
                                                value={wage}
                                                onChange={(e) => setWage(e.target.value)}
                                                type="number"
                                                InputProps={{ endAdornment: plnAdornment }}
                                                error={wageError}
                                                helperText={wageError ? 'Podaj kwotę > 0.' : ' '}
                                                sx={inputSx}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Wiersz 2: 3 kolumny */}
                                    <Box
                                        sx={{
                                            mt: 2.25,
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                            gap: 2.25
                                        }}
                                    >
                                        <TextField
                                            label="Rok rozpoczęcia pracy"
                                            value={startYear}
                                            onChange={(e) => setStartYear(e.target.value)}
                                            type="number"
                                            fullWidth
                                            sx={inputSx}
                                        />

                                        <TextField
                                            label="Planowany rok zakończenia aktywności"
                                            value={endYear}
                                            onChange={(e) => setEndYear(e.target.value)}
                                            type="number"
                                            fullWidth
                                            sx={inputSx}
                                        />

                                        <TextField
                                            label="Cel emerytalny (PLN/mc)"
                                            placeholder="np. 5200"
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            type="number"
                                            fullWidth
                                            InputProps={{ endAdornment: plnAdornment }}
                                            sx={inputSx}
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Wynagrodzenia historyczne będą odwrotnie indeksowane ścieżką wzrostu płac (opis metodyki w raporcie).
                                    </Typography>

                                    <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
                                        <Button variant="outlined" onClick={() => navigate(-1)}>Wstecz</Button>
                                        <Button variant="contained" onClick={() => navigate('/simulator/additional')} disabled={!valid}>Dalej</Button>
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
