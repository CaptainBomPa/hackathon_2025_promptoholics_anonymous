import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { DashboardProvider } from '../contexts/DashboardContext';
import { DashboardHeader, DashboardSidebar, DashboardMainContent } from '../components/dashboard';

/**
 * Main Dashboard Page Component
 * Implements point 1.4 of the app specification
 */
const DashboardPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Extract initial data from navigation state
  const simulationResults = state?.simulationResults;
  const userExpectations = state?.userExpectations;
  const request = state?.request;

  // Check if we have the necessary data
  const hasRequiredData = simulationResults && userExpectations;

  useEffect(() => {
    // If no data is available, we could redirect to simulator
    // For now, we'll show a warning and provide mock data
    if (!hasRequiredData) {
      console.log('Dashboard accessed without simulation data, using mock data');
    }
  }, [hasRequiredData]);

  // Transform simulation data to dashboard initial state
  const getDashboardInitialData = () => {
    if (!hasRequiredData) {
      // Return mock data for demonstration
      return {
        basic: {
          age: 35,
          gender: 'F',
          grossSalary: 8500,
          startYear: 2015,
          plannedEndYear: 2055,
          expectedPension: 4500,
        },
      };
    }

    return {
      basic: {
        age: request?.age || simulationResults.currentAge,
        gender: request?.sex === 'F' ? 'F' : 'M',
        grossSalary: request?.grossSalaryPLN || 8500,
        startYear: request?.startYear || 2015,
        plannedEndYear: request?.plannedEndYear || simulationResults.retirementYear,
        expectedPension: userExpectations.expectedAmount,
      },
    };
  };

  if (!hasRequiredData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Warning about missing data */}
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => navigate('/simulator')}
              sx={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Przejdź do symulatora
            </Link>
          }
        >
          <Typography variant="body2">
            <strong>Tryb demonstracyjny:</strong> Dashboard został otwarty bez danych symulacji. 
            Wyświetlane są przykładowe dane. Aby uzyskać personalizowane wyniki, 
            najpierw przeprowadź symulację emerytury.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <DashboardProvider initialData={getDashboardInitialData()}>
      <DashboardContent />
    </DashboardProvider>
  );
};

/**
 * Dashboard Content Component
 * Separated to use dashboard context
 */
const DashboardContent = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <DashboardSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header */}
        <DashboardHeader onToggleSidebar={handleToggleSidebar} />

        {/* Main content */}
        <DashboardMainContent />
      </Box>
    </Box>
  );
};

export default DashboardPage;
