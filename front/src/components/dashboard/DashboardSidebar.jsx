import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person,
  Timeline,
  LocalHospital,
  TrendingUp,
  AccountBalance,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import { zusColors } from '../../constants/zus-colors';
import BasicParametersPanel from './panels/BasicParametersPanel';
import IndexationPanel from './panels/IndexationPanel';

/**
 * Dashboard Sidebar Component
 * Houses all parameter control panels with collapsible sections
 */
const DashboardSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state, actions } = useDashboard();

  const sidebarWidth = 320;

  // Panel configuration
  const panels = [
    {
      id: 'basic',
      title: 'Parametry podstawowe',
      icon: <Person />,
      description: 'Wiek, płeć, wynagrodzenie, lata pracy',
    },
    {
      id: 'salary',
      title: 'Timeline wynagrodzeń',
      icon: <Timeline />,
      description: 'Szczegółowe wynagrodzenia rok po roku',
    },
    {
      id: 'sickLeave',
      title: 'Zwolnienia chorobowe',
      icon: <LocalHospital />,
      description: 'Okresy choroby i ich wpływ na emeryturę',
    },
    {
      id: 'indexation',
      title: 'Indeksacja i inflacja',
      icon: <TrendingUp />,
      description: 'Wskaźniki wzrostu płac i inflacji',
    },
    {
      id: 'zusAccount',
      title: 'Konto ZUS',
      icon: <AccountBalance />,
      description: 'Saldo konta i dodatkowe wpłaty',
    },
  ];

  const handlePanelClick = (panelId) => {
    actions.setActivePanel(panelId);
  };

  const sidebarContent = (
    <Box sx={{ width: sidebarWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: zusColors.dark }}>
          Parametry symulacji
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dostosuj parametry aby eksplorować różne scenariusze
        </Typography>
      </Box>

      {/* Panel list */}
      <List sx={{ flex: 1, py: 1 }}>
        {panels.map((panel) => (
          <React.Fragment key={panel.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handlePanelClick(panel.id)}
                selected={state.uiState.activePanel === panel.id}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: zusColors.primary + '15',
                    borderRight: 3,
                    borderRightColor: zusColors.primary,
                    '& .MuiListItemIcon-root': {
                      color: zusColors.primary,
                    },
                    '& .MuiListItemText-primary': {
                      color: zusColors.dark,
                      fontWeight: 600,
                    },
                  },
                  '&:hover': {
                    backgroundColor: zusColors.primary + '08',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {panel.icon}
                </ListItemIcon>
                <ListItemText
                  primary={panel.title}
                  secondary={panel.description}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: state.uiState.activePanel === panel.id ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: { fontSize: '0.75rem' },
                  }}
                />
                {state.uiState.activePanel === panel.id ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            {/* Panel content */}
            <Collapse in={state.uiState.activePanel === panel.id} timeout="auto" unmountOnExit>
              <Box sx={{ backgroundColor: 'background.default' }}>
                {panel.id === 'basic' && <BasicParametersPanel />}
                {panel.id === 'indexation' && <IndexationPanel />}
                
                {!['basic', 'indexation'].includes(panel.id) && (
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Panel {panel.title} - implementacja w toku
                    </Typography>
                    
                    {/* Show some current parameter values */}
                    {panel.id === 'sickLeave' && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">
                          Tryb: {state.parameters.sickLeave.mode === 'averaged' ? 'Uśrednione' : 'Własne'}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Okresy historyczne: {state.parameters.sickLeave.historicalPeriods.length}
                        </Typography>
                      </Box>
                    )}


                  </Box>
                )}
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      {/* Sidebar footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Ostatnie przeliczenie:
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {state.uiState.lastCalculation 
            ? new Date(state.uiState.lastCalculation).toLocaleString('pl-PL')
            : 'Brak'
          }
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? sidebarWidth : 0,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          position: 'relative',
          transform: open ? 'translateX(0)' : `translateX(-${sidebarWidth}px)`,
          transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default DashboardSidebar;