import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { Link as RouterLink } from 'react-router-dom'

export default function Navbar({ toggleTheme, mode }) {
    return (
        <AppBar position="sticky" elevation={1}>
            <Toolbar sx={{ gap: 2 }}>
                <Typography variant="h6" component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
                    Hackathon Front
                </Typography>
                <Button component={RouterLink} to="/dashboard" color="inherit">Dashboard</Button>
                <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}
