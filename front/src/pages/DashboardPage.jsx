import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, Link } from '@mui/material';
import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import { DashboardHeader, DashboardSidebar, DashboardMainContent } from '../components/dashboard';
import PostalCodeDialog from '../components/common/PostalCodeDialog';

const DashboardPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const simulationResults = state?.simulationResults;
  const userExpectations = state?.userExpectations;
  const request = state?.request;

  const hasRequiredData = simulationResults && userExpectations;

  const getDashboardInitialData = () => {
    if (!hasRequiredData) {
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
      zusAccount: {
        accountBalance: request?.zusAccountFundsPLN || 0,
        workAfterRetirement: 0,
      },
    };
  };

  if (!hasRequiredData) {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
              severity="warning"
              sx={{ mb: 3 }}
              action={
                <Link component="button" variant="body2" onClick={() => navigate('/simulator')} sx={{ color: 'inherit', textDecoration: 'underline' }}>
                  Przejdź do symulatora
                </Link>
              }
          >
            <Typography variant="body2">
              <strong>Tryb demonstracyjny:</strong> Dashboard został otwarty bez danych symulacji. Wyświetlane są przykładowe dane. Aby uzyskać personalizowane wyniki, najpierw przeprowadź symulację emerytury.
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

const DashboardContent = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { state, actions } = useDashboard();
  const handleToggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
      <Box
          sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, #f8fffe 0%, #f0f9f7 25%, #e8f5f3 50%, #f0f9f7 75%, #f8fffe 100%)`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '300px',
              background: `linear-gradient(135deg, rgba(0, 153, 63, 0.03) 0%, rgba(63, 132, 210, 0.02) 100%)`,
              zIndex: 0,
            },
          }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <DashboardHeader onToggleSidebar={handleToggleSidebar} />
        </Box>
        <Box sx={{ display: 'flex', position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 73px)' }}>
          <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flex: 1 }}>
            <DashboardMainContent />
          </Box>
        </Box>

        {/* Postal Code Dialog */}
        <PostalCodeDialog
          open={state.uiState.showPostalCodeDialog}
          onClose={actions.hidePostalCodeDialog}
          calculationId={state.uiState.lastCalculationId}
        />
      </Box>
  );
};

export default DashboardPage;
