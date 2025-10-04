import React from 'react'
import { Container } from '@mui/material'
import Shell from "./Shell";

export default function MainLayout({ children, toggleTheme, mode }) {
    return (
        <Shell toggleTheme={toggleTheme} mode={mode}>
            <Container maxWidth="lg">{children}</Container>
        </Shell>
    )
}
