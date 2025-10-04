import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Home,
  Assessment,
  Dashboard as DashboardIcon,
  Save,
  FileDownload,
  Settings,
  Compare,
  Menu as MenuIcon,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../contexts/DashboardContext';
import { zusColors } from '../../constants/zus-colors';

/**
 * Dashboard Header Component
 * Provides navigation, scenario management, and export functionality
 */
const DashboardHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { state, actions, computed } = useDashboard();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSaveScenario = () => {
    if (scenarioName.trim()) {
      actions.saveScenario(scenarioName.trim(), scenarioDescription.trim());
      setSaveDialogOpen(false);
      setScenarioName('');
      setScenarioDescription('');
    }
  };

  const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting in ${format} format`);
    handleMenuClose();
  };

  return (
    <>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left side - Navigation and title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Mobile menu button */}
              <IconButton
                onClick={onToggleSidebar}
                sx={{ display: { xs: 'block', md: 'none' } }}
                aria-label="Toggle sidebar"
              >
                <MenuIcon />
              </IconButton>

              {/* Breadcrumbs */}
              <Breadcrumbs 
                aria-label="breadcrumb"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/')}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  <Home sx={{ mr: 0.5, fontSize: 16 }} />
                  Strona główna
                </Link>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/simulator')}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  <Assessment sx={{ mr: 0.5, fontSize: 16 }} />
                  Symulator
                </Link>
                <Typography 
                  variant="body2" 
                  color="text.primary"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <DashboardIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  Dashboard
                </Typography>
              </Breadcrumbs>

              {/* Dashboard title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: zusColors.dark,
                  display: { xs: 'none', md: 'block' },
                }}
              >
                Dashboard Symulatora
              </Typography>
            </Box>

            {/* Right side - Actions and status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Status indicators */}
              {computed.hasUnsavedChanges && (
                <Chip
                  label="Niezapisane zmiany"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                />
              )}

              {computed.totalScenarios > 0 && (
                <Chip
                  label={`${computed.totalScenarios} scenariuszy`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                />
              )}

              {/* Action buttons */}
              <Tooltip title="Zapisz scenariusz">
                <Button
                  startIcon={<Save />}
                  onClick={() => setSaveDialogOpen(true)}
                  variant="outlined"
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Zapisz
                </Button>
              </Tooltip>

              <Tooltip title="Porównaj scenariusze">
                <IconButton
                  disabled={computed.totalScenarios === 0}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  <Compare />
                </IconButton>
              </Tooltip>

              {/* More actions menu */}
              <IconButton onClick={handleMenuOpen} aria-label="More actions">
                <MoreVert />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => setSaveDialogOpen(true)}>
                  <Save sx={{ mr: 1 }} />
                  Zapisz scenariusz
                </MenuItem>
                <MenuItem 
                  onClick={() => handleExport('pdf')}
                  disabled
                >
                  <FileDownload sx={{ mr: 1 }} />
                  Eksportuj PDF
                </MenuItem>
                <MenuItem 
                  onClick={() => handleExport('excel')}
                  disabled
                >
                  <FileDownload sx={{ mr: 1 }} />
                  Eksportuj Excel
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <Settings sx={{ mr: 1 }} />
                  Ustawienia
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Calculation status */}
          {state.uiState.isCalculating && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label="Przeliczanie..."
                size="small"
                color="primary"
                variant="filled"
                sx={{ animation: 'pulse 1.5s ease-in-out infinite' }}
              />
            </Box>
          )}
        </Container>
      </Box>

      {/* Save Scenario Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Zapisz scenariusz</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa scenariusza"
            fullWidth
            variant="outlined"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Opis (opcjonalny)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={scenarioDescription}
            onChange={(e) => setScenarioDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Anuluj
          </Button>
          <Button 
            onClick={handleSaveScenario}
            variant="contained"
            disabled={!scenarioName.trim()}
          >
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DashboardHeader;