import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import App from './app/App'
import { useThemeMode } from './hooks/useThemeMode'
import themeFactory from './theme/theme'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/700.css'
import './index.css'

function Providers() {
    const { mode, toggle } = useThemeMode()
    const theme = themeFactory(mode)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App mode={mode} toggleTheme={toggle} />
            </BrowserRouter>
        </ThemeProvider>
    )
}

const container = document.getElementById('root')
createRoot(container).render(<Providers />)
