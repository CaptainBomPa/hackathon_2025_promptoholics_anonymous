import React from 'react'
import Navbar from './Navbar'
import { Box } from '@mui/material'

export default function Shell({ children, toggleTheme, mode }) {
    return (
        <Box minHeight="100dvh" display="flex" flexDirection="column">
            <Navbar toggleTheme={toggleTheme} mode={mode} />
            <Box component="main" flex={1} py={3}>{children}</Box>
        </Box>
    )
}
