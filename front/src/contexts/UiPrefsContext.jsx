import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const Ctx = createContext(null)
const MODE_KEY = 'ui:mode'
const FONT_KEY = 'ui:fontScale'

export function UiPrefsProvider({ children }) {
    const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'light')
    const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem(FONT_KEY)) || 1)

    useEffect(() => { localStorage.setItem(MODE_KEY, mode) }, [mode])
    useEffect(() => { localStorage.setItem(FONT_KEY, String(fontScale)) }, [fontScale])

    const value = useMemo(() => ({
        mode,
        fontScale,
        toggleMode: () => setMode(m => (m === 'light' ? 'dark' : 'light')),
        incFont: () => setFontScale(s => Math.min(1.30, +(s + 0.05).toFixed(2))),
        decFont: () => setFontScale(s => Math.max(0.85, +(s - 0.05).toFixed(2))),
        resetFont: () => setFontScale(1),
    }), [mode, fontScale])

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useUiPrefs = () => useContext(Ctx)
