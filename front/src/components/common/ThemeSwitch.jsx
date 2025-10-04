import React from 'react'
import { FormControlLabel, Switch, Box, Typography } from '@mui/material'

export default function ThemeSwitch({ mode, onToggle }) {
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">🌞</Typography>
            <FormControlLabel
                sx={{ m: 0 }}
                control={<Switch checked={mode === 'dark'} onChange={onToggle} />}
                label="🌙"
                labelPlacement="end"
            />
        </Box>
    )
}
