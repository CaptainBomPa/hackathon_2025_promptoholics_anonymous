import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import SimulatorFormPage from '../pages/SimulatorFormPage'
import SimulationResultPage from '../pages/SimulationResultPage'
import DashboardPage from '../pages/DashboardPage'
import AdminPage from '../pages/AdminPage'
import PageTransition from '../components/transition/PageTransition'
import SimulatorAdditionalFormPage from "../pages/SimulatorAdditionalFormPage";

function NotFoundPage() {
    return <div style={{ padding: 24 }}>404 – Nie znaleziono strony</div>
}

export default function AppRouter() {
    const location = useLocation()
    return (
        <PageTransition>
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/simulator" element={<SimulatorFormPage />} />
                <Route path="/simulator/additional" element={<SimulatorAdditionalFormPage />} />
                {/*<Route path="/simulator/result" element={<SimulationResultPage />} />*/}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </PageTransition>
    )
}
