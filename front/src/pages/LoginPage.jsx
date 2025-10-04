import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ThemeSwitch from '../components/common/ThemeSwitch'

export default function LoginPage({ mode, toggleTheme }) {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (login === 'admin' && password === 'admin') {
            navigate('/')
        } else {
            setError('Nieprawidłowe dane logowania')
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: mode === 'dark'
                    ? 'linear-gradient(135deg, #0b0d12 0%, #121623 100%)'
                    : 'linear-gradient(135deg, #e0f2ff 0%, #f5f6fa 100%)',
                px: 2,
                position: 'relative'
            }}
        >
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <ThemeSwitch mode={mode} onToggle={toggleTheme} />
            </Box>

            <Paper
                elevation={3}
                sx={{
                    p: 5,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    backdropFilter: 'blur(6px)'
                }}
            >
                <Box textAlign="center" mb={1}>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                        Hackathon App
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Zaloguj się, aby kontynuować
                    </Typography>
                </Box>

                <Divider />

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <TextField
                        label="Login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        label="Hasło"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                    {error && (
                        <Typography color="error" variant="body2" textAlign="center">
                            {error}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
                        Zaloguj się
                    </Button>
                </form>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                    Demo: <strong>admin / admin</strong>
                </Typography>
            </Paper>
        </Box>
    )
}
