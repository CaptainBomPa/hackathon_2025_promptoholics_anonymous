import React, { useState } from 'react';
import {
  Box,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import { Refresh, PlayArrow } from '@mui/icons-material';
import PensionResultsDisplay from './components/PensionResultsDisplay';
import { SimulationResults, UserExpectations } from './types';

// Demo data for testing
const mockSimulationResults: SimulationResults = {
  realAmount: 2850,
  adjustedAmount: 3200,
  averagePensionAtRetirement: 2500,
  replacementRate: 65,
  salaryWithoutSickLeave: 5500,
  salaryWithSickLeave: 5200,
  pensionWithoutSickLeave: 3000,
  pensionWithSickLeave: 2850,
  delayBenefits: {
    oneYear: 3100,
    twoYears: 3350,
    fiveYears: 4200,
  },
  retirementYear: 2055,
  currentAge: 35,
  includedSickLeave: true,
};

const mockUserExpectations: UserExpectations = {
  expectedAmount: 4000,
  additionalWorkYearsNeeded: 3,
};

function App() {
  const [loading, setLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResults>(mockSimulationResults);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate new data
      setSimulationResults({
        ...mockSimulationResults,
        realAmount: Math.floor(Math.random() * 1000) + 2500,
        adjustedAmount: Math.floor(Math.random() * 1000) + 3000,
      });
      setLoading(false);
    }, 2000);
  };

  const handleToggleAnimation = () => {
    // Force re-render to trigger animations
    setSimulationResults({ ...simulationResults });
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Demo Controls */}
      <Container maxWidth="lg">
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h6" color="primary">
            🎯 Demo - Wyniki Symulacji Emerytury (Punkt 1.3)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              onClick={handleToggleAnimation}
              size="small"
            >
              Replay Animations
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              size="small"
            >
              {loading ? 'Ładowanie...' : 'Nowe Dane'}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Main Component */}
      <PensionResultsDisplay
        simulationResults={simulationResults}
        userExpectations={mockUserExpectations}
        loading={loading}
        onNavigateToDetails={() => console.log('Navigate to details')}
      />
    </Box>
  );
}

export default App;