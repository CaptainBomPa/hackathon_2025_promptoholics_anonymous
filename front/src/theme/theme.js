import { createTheme } from '@mui/material/styles'

export default function themeFactory(mode) {
    const isDark = mode === 'dark'
    return createTheme({
        palette: {
            mode,
            background: {
                default: isDark ? '#0f1115' : '#f5f6fa',
                paper: isDark ? '#151922' : '#ffffff'
            },
            primary: { main: isDark ? '#7aa2f7' : '#1976d2' },
            text: {
                primary: isDark ? '#e6e6e6' : '#1a1a1a',
                secondary: isDark ? '#a9b0bc' : '#555'
            }
        },
        shape: { borderRadius: 12 },
        typography: {
            fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            fontWeightLight: 300,
            fontWeightRegular: 400,
            fontWeightMedium: 500
        },
        components: {
            MuiPaper: { styleOverrides: { root: { borderRadius: 12, padding: '1.5rem' } } },
            MuiButton: { styleOverrides: { root: { borderRadius: 10, textTransform: 'none', padding: '0.6rem 1.2rem', fontWeight: 500 } } },
            MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } } } }
        }
    })
}
