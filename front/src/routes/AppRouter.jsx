import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'

function NotFoundPage() {
    return <div style={{ padding: 24 }}>404 – Nie znaleziono strony</div>
}

export default function AppRouter({ appProps }) {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage {...appProps} />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
