import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Box, Container, Paper, Typography, Button, Alert, CircularProgress
} from '@mui/material'
import { ArrowBack, Dashboard } from '@mui/icons-material'
import { PensionResultsDisplay } from '../components/pension-results'
// import { pln, pct } from '../utils/formatters' // Available for future use

export default function SimulationResultPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error] = useState(null) // setError removed as we're using mock data
    
    const request = state?.request
    const response = state?.response
    // const formData = state?.formData // Available for future use

    // Simulate loading delay for demonstration
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)
        
        return () => clearTimeout(timer)
    }, [])

    // Create mock data if no real data is available (for development/demo purposes)
    const createMockData = (baseRequest = null) => {
        const currentYear = new Date().getFullYear()
        
        // Use form data if available, otherwise use defaults
        const mockAge = baseRequest?.age || 35
        const mockSalary = baseRequest?.grossSalaryPLN || 8500
        const mockRetirementYear = baseRequest?.plannedEndYear || (currentYear + (65 - mockAge))
        const mockExpectedPension = baseRequest?.expectedPensionPLN || 4500
        const mockIncludeSickLeave = baseRequest?.includeSickLeave ?? true
        
        // Mock request data
        const mockRequest = baseRequest || {
            age: mockAge,
            sex: 'F',
            grossSalaryPLN: mockSalary,
            startYear: currentYear - 10,
            plannedEndYear: mockRetirementYear,
            expectedPensionPLN: mockExpectedPension,
            includeSickLeave: mockIncludeSickLeave,
            zusAccountFundsPLN: 85000,
        }

        // Calculate realistic mock response based on input data
        const baseAmount = mockSalary * 0.45 // Rough pension calculation
        const sickLeaveReduction = mockIncludeSickLeave ? 0.95 : 1.0
        const actualAmount = Math.round(baseAmount * sickLeaveReduction)
        const realAmount = Math.round(actualAmount * 0.75) // Inflation adjustment
        
        // Mock response based on OpenAPI schema
        const mockResponse = {
            id: 'mock-calculation-' + Date.now(),
            requestedAt: new Date().toISOString(),
            result: {
                actualAmountPLN: actualAmount,
                realAmountDeflated: realAmount,
                replacementRatePct: Math.round((actualAmount / mockSalary) * 100 * 10) / 10,
                vsAverageInRetirementYearPct: Math.round((Math.random() - 0.5) * 30 * 10) / 10,
                wageInclSickLeavePLN: mockIncludeSickLeave ? Math.round(mockSalary * 0.95) : mockSalary,
                wageExclSickLeavePLN: mockSalary,
                ifPostponedYears: [
                    { postponedByYears: 1, actualAmountPLN: Math.round(actualAmount * 1.08) },
                    { postponedByYears: 2, actualAmountPLN: Math.round(actualAmount * 1.16) },
                    { postponedByYears: 5, actualAmountPLN: Math.round(actualAmount * 1.35) }
                ],
                meetsExpectation: {
                    isMet: actualAmount >= mockExpectedPension,
                    shortfallPLN: Math.max(0, mockExpectedPension - actualAmount),
                    extraYearsRequiredEstimate: actualAmount < mockExpectedPension ? 
                        Math.ceil((mockExpectedPension - actualAmount) / 150) : 0
                },
                zusAccountFundsByYear: [
                    { year: mockRetirementYear - 5, zusAccountFundsPLN: 180000 },
                    { year: mockRetirementYear, zusAccountFundsPLN: 220000 }
                ]
            }
        }

        return { request: mockRequest, response: mockResponse }
    }

    // Use mock data if no real data is available
    useEffect(() => {
        if (!loading && (!response || !request)) {
            console.log('No simulation data found, using mock data for demonstration')
            const mockData = createMockData()
            // In a real app, you might want to redirect to the form instead
            // For demo purposes, we'll use mock data
            // setError('Brak danych symulacji. Proszę wrócić do formularza i przeprowadzić symulację ponownie.')
        }
    }, [loading, response, request])

    // Transform response data to match our component interface
    const getSimulationResults = () => {
        // Use mock data if no real data is available
        let actualRequest = request
        let actualResponse = response
        
        if (!actualResponse || !actualRequest) {
            const mockData = createMockData(actualRequest)
            actualRequest = mockData.request
            actualResponse = mockData.response
        }

        const result = actualResponse.result
        const currentYear = new Date().getFullYear()
        
        // Calculate average pension at retirement (mock calculation)
        const averagePensionAtRetirement = result.actualAmountPLN * (1 - (result.vsAverageInRetirementYearPct / 100))

        return {
            realAmount: result.realAmountDeflated || result.actualAmountPLN,
            adjustedAmount: result.actualAmountPLN,
            averagePensionAtRetirement: averagePensionAtRetirement,
            replacementRate: result.replacementRatePct,
            salaryWithoutSickLeave: result.wageExclSickLeavePLN,
            salaryWithSickLeave: result.wageInclSickLeavePLN,
            pensionWithoutSickLeave: result.actualAmountPLN,
            pensionWithSickLeave: result.actualAmountPLN * 0.95, // Estimated reduction
            delayBenefits: {
                oneYear: result.ifPostponedYears?.find(p => p.postponedByYears === 1)?.actualAmountPLN || result.actualAmountPLN * 1.08,
                twoYears: result.ifPostponedYears?.find(p => p.postponedByYears === 2)?.actualAmountPLN || result.actualAmountPLN * 1.16,
                fiveYears: result.ifPostponedYears?.find(p => p.postponedByYears === 5)?.actualAmountPLN || result.actualAmountPLN * 1.35,
            },
            retirementYear: actualRequest.plannedEndYear,
            currentAge: actualRequest.age,
            includedSickLeave: actualRequest.includeSickLeave || false,
        }
    }

    const getUserExpectations = () => {
        // Use mock data if no real data is available
        let actualRequest = request
        let actualResponse = response
        
        if (!actualResponse || !actualRequest) {
            const mockData = createMockData(actualRequest)
            actualRequest = mockData.request
            actualResponse = mockData.response
        }

        const simulationResults = getSimulationResults()
        const expectedAmount = actualRequest.expectedPensionPLN || 4000
        const actualAmount = simulationResults.realAmount
        
        // Use API response data if available
        const meetsExpectation = actualResponse.result?.meetsExpectation
        const additionalWorkYearsNeeded = meetsExpectation?.extraYearsRequiredEstimate || 
            (expectedAmount > actualAmount ? Math.ceil((expectedAmount - actualAmount) / 100) : 0)

        return {
            expectedAmount,
            additionalWorkYearsNeeded,
        }
    }

    const handleNavigateToDetails = (type) => {
        console.log(`Navigate to details for ${type}`)
        // Future: Navigate to detailed dashboard
        // navigate('/dashboard', { state: { simulationResults: getSimulationResults(), focusOn: type } })
    }

    const handleBackToSimulation = () => {
        // Navigate back to simulator, optionally with previous data
        navigate('/simulator')
    }

    const handleGoToDashboard = () => {
        navigate('/dashboard', { 
            state: { 
                simulationResults: getSimulationResults(),
                userExpectations: getUserExpectations(),
                request 
            } 
        })
    }

    // Check if we're using mock data
    const isUsingMockData = !response || !request

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => navigate('/simulator')}>
                            Wróć do symulatora
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        )
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Przygotowywanie wyników symulacji...
                </Typography>
            </Container>
        )
    }

    return (
        <Box>
            {/* Mock Data Notice */}
            {isUsingMockData && (
                <Alert 
                    severity="info" 
                    sx={{ 
                        mb: 0,
                        borderRadius: 0,
                        '& .MuiAlert-message': {
                            width: '100%',
                            textAlign: 'center'
                        }
                    }}
                >
                    <Typography variant="body2">
                        <strong>Tryb demonstracyjny:</strong> Wyświetlane są przykładowe dane symulacji. 
                        Przejdź do symulatora, aby wprowadzić własne parametry.
                    </Typography>
                </Alert>
            )}

            {/* Navigation Bar */}
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    mb: 0,
                    borderRadius: 0,
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBackToSimulation}
                            variant="outlined"
                            size="small"
                        >
                            {isUsingMockData ? 'Przejdź do symulatora' : 'Wróć do symulatora'}
                        </Button>
                        
                        <Button
                            startIcon={<Dashboard />}
                            onClick={handleGoToDashboard}
                            variant="contained"
                            size="small"
                            disabled // Will be enabled when dashboard is implemented
                        >
                            Przejdź do dashboardu
                        </Button>
                    </Box>
                </Container>
            </Paper>

            {/* Main Results Display */}
            <PensionResultsDisplay
                simulationResults={getSimulationResults()}
                userExpectations={getUserExpectations()}
                loading={false}
                onNavigateToDetails={handleNavigateToDetails}
            />
        </Box>
    )
}
