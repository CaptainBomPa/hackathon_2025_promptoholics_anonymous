import { createTheme } from '@mui/material/styles'
import { ZUS } from './zusPalette'

export function buildTheme({ mode = 'light', fontScale = 1 }) {
    const isDark = mode === 'dark'
    return createTheme({
        palette: {
            mode,
            primary: { main: ZUS.green },
            secondary: { main: ZUS.blue },
            error: { main: ZUS.red },
            text: {
                primary: isDark ? '#e6e6e6' : ZUS.black,
                secondary: isDark ? '#a9b0bc' : '#515764'
            },
            background: {
                default: isDark ? ZUS.bgDark : ZUS.bgLight,
                paper: isDark ? '#141824' : '#ffffff'
            },
            divider: isDark ? 'rgba(255,255,255,0.12)' : ZUS.gray
        },
        shape: { borderRadius: 16 },
        typography: {
            // globalne skalowanie czcionki (A+/A-)
            htmlFontSize: 16 * fontScale,
            fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            fontWeightMedium: 600
        },
        components: {
            MuiPaper: { styleOverrides: { root: { borderRadius: 20 } } },
            MuiButton: { styleOverrides: { root: { borderRadius: 999, textTransform: 'none' } } }
        }
    })
}
