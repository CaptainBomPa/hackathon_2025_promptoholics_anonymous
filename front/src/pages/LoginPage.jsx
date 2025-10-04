import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Paper, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
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
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0b0d12 0%, #121623 100%)'
                        : 'linear-gradient(135deg, rgba(0,153,63,0.06) 0%, rgba(63,132,210,0.06) 100%)',
                px: 2
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 5,
                    width: '100%',
                    maxWidth: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}
            >
                <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">Panel administratora</Typography>
                    <Typography variant="body2" color="text.secondary">Zaloguj się, aby zarządzać</Typography>
                </Box>

                <Divider />

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <TextField
                        label="Login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Hasło"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />
                    {error && (
                        <Typography color="error" variant="body2" textAlign="center">
                            {error}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" size="large">Zaloguj</Button>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                        Demo: <strong>admin/admin</strong>
                    </Typography>
                </form>
            </Paper>
        </Box>
    )
}
