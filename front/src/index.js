import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { UiPrefsProvider, useUiPrefs } from './contexts/UiPrefsContext'
import { buildTheme } from './theme/theme'
import './index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/700.css'

function ThemedProviders() {
    const { mode, fontScale } = useUiPrefs()
    const theme = useMemo(() => buildTheme({ mode, fontScale }), [mode, fontScale])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    )
}

const container = document.getElementById('root')
createRoot(container).render(
    <UiPrefsProvider>
        <ThemedProviders />
    </UiPrefsProvider>
)
