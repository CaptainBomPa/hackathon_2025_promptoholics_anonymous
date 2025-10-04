import React from 'react'
import { Box, CircularProgress } from '@mui/material'

export default function Loading() {
    return (
        <Box display="grid" placeItems="center" py={6}>
            <CircularProgress />
        </Box>
    )
}
