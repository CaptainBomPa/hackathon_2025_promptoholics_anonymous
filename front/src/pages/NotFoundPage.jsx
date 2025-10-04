import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <Box display="grid" justifyItems="start" gap={2}>
            <Typography variant="h5">404</Typography>
            <Typography>Nie znaleziono strony</Typography>
            <Button component={RouterLink} to="/" variant="outlined">Wróć</Button>
        </Box>
    )
}
