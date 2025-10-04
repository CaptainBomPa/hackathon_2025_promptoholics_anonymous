import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FileDownload,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { zusColors } from '../../constants/zus-colors';

/**
 * Dashboard Header Component
 * Provides navigation, scenario management, and export functionality
 */
const DashboardHeader = ({ onToggleSidebar }) => {

  const handleExport = (format) => {
    // TODO: Implement PDF export functionality
    console.log(`Exporting dashboard as ${format}`);
    alert(`Funkcja eksportu do ${format.toUpperCase()} będzie wkrótce dostępna!`);
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

              {/* Dashboard title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DashboardIcon sx={{ color: zusColors.primary, fontSize: 28 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: zusColors.primary,
                  }}
                >
                  Dashboard Symulatora
                </Typography>
              </Box>
            </Box>

            {/* Right side - Simple PDF Export Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                startIcon={<FileDownload />}
                onClick={() => handleExport('pdf')}
                variant="contained"
                size="medium"
                sx={{ 
                  background: `linear-gradient(135deg, ${zusColors.primary} 0%, ${zusColors.success} 100%)`,
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: `0 6px 20px ${zusColors.primary}40`,
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${zusColors.success} 0%, ${zusColors.primary} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${zusColors.primary}50`,
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  }
                }}
              >
                Zapisz i pobierz raport jako PDF
              </Button>
            </Box>
          </Box>


        </Container>
      </Box>


    </>
  );
};

export default DashboardHeader;