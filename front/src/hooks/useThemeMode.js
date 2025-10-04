import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'themeMode'

export function useThemeMode() {
    const systemPrefersDark = useMemo(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }, [])

    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved || (systemPrefersDark ? 'dark' : 'light')
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, mode)
        document.documentElement.setAttribute('data-theme', mode)
    }, [mode])

    const toggle = () => setMode(m => (m === 'light' ? 'dark' : 'light'))

    return { mode, toggle }
}
