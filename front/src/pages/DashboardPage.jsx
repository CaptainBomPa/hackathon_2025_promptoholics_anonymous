import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

export default function DashboardPage() {
    return (
        <Box display="grid" gap={2}>
            <Typography variant="h5">Dashboard</Typography>
            <Paper sx={{ p: 2 }}>
                <Typography>Tu podłączymy dane z API.</Typography>
            </Paper>
        </Box>
    )
}
