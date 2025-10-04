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
    AccountBalance,
    Work as WorkIcon,          // ⬅️ NOWY import
    ExpandLess,
    ExpandMore,
    Settings,
} from '@mui/icons-material';
import { useDashboard } from '../../contexts/DashboardContext';
import { zusColors } from '../../constants/zus-colors';
import BasicParametersPanel from './panels/BasicParametersPanel';
import IndexationPanel from './panels/IndexationPanel';
import SalaryTimelinePanel from './panels/SalaryTimelinePanel';
import SickLeavePanel from './panels/SickLeavePanel';
import ZUSAccountPanel from './panels/ZUSAccountPanel';
import WorkAfterRetirementPanel from './panels/WorkAfterRetirementPanel'; // ⬅️ NOWY import

const DashboardSidebar = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { state, actions } = useDashboard();

    const sidebarWidth = '35vw';
    const sidebarMinWidth = 400;
    const sidebarMaxWidth = 600;

    const panels = [
        { id: 'basic', title: 'Parametry podstawowe', icon: <Person />, description: 'Wiek, płeć, wynagrodzenie, lata pracy' },
        { id: 'salary', title: 'Timeline wynagrodzeń', icon: <Timeline />, description: 'Szczegółowe wynagrodzenia rok po roku' },
        { id: 'sickLeave', title: 'Zwolnienia chorobowe', icon: <LocalHospital />, description: 'Okresy choroby i ich wpływ na emeryturę' },
        { id: 'zusAccount', title: 'Konto ZUS', icon: <AccountBalance />, description: 'Saldo konta i dodatkowe wpłaty' },
        { id: 'workAfterRetirement', title: 'Praca po wieku emerytalnym', icon: <WorkIcon />, description: 'Liczba lat pracy po emeryturze' }, // ⬅️ NOWA zakładka
    ];

    const handlePanelClick = (panelId) => {
        const currentlyActive = state.uiState.activePanel;
        actions.setActivePanel(currentlyActive === panelId ? null : panelId);
    };

    const sidebarContent = (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, #fafffe 0%, #f5fbf9 100%)` }}>
            {/* ... nagłówek bez zmian ... */}

            <List sx={{ flex: 1, py: 0, px: 1 }}>
                {panels.map((panel) => {
                    const isOpen = state.uiState.activePanel === panel.id;
                    return (
                        <React.Fragment key={panel.id}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => handlePanelClick(panel.id)}
                                    selected={isOpen}
                                    sx={{
                                        py: 0, px: 3, mx: 1, mb: 1, borderRadius: 1,
                                        '&.Mui-selected': {
                                            background: `linear-gradient(135deg, ${zusColors.primary}15 0%, ${zusColors.info}08 100%)`,
                                            border: `2px solid ${zusColors.primary}30`,
                                            boxShadow: `0 4px 16px ${zusColors.primary}20`,
                                            transform: 'translateX(4px)',
                                            '& .MuiListItemIcon-root': {
                                                color: zusColors.primary,
                                                transform: 'scale(1.2)',
                                                background: `linear-gradient(135deg, ${zusColors.primary}20 0%, ${zusColors.info}15 100%)`,
                                                borderRadius: 2, p: 1,
                                            },
                                            '& .MuiListItemText-primary': { color: zusColors.dark, fontWeight: 700 },
                                            '& .MuiListItemText-secondary': { color: zusColors.primary, fontWeight: 500 },
                                        },
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${zusColors.primary}08 0%, ${zusColors.info}04 100%)`,
                                            transform: 'translateX(2px)',
                                            boxShadow: `0 2px 8px ${zusColors.primary}15`,
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 50 }}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                background: isOpen
                                                    ? `linear-gradient(135deg, ${zusColors.primary}20 0%, ${zusColors.info}15 100%)`
                                                    : `linear-gradient(135deg, ${zusColors.neutral}15 0%, ${zusColors.neutral}08 100%)`,
                                                transition: 'all 0.3s ease-in-out',
                                            }}
                                        >
                                            {panel.icon}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={panel.title}
                                        secondary={panel.description}
                                        primaryTypographyProps={{ variant: 'body1', fontWeight: isOpen ? 700 : 600, sx: { mb: 0.5 } }}
                                        secondaryTypographyProps={{ variant: 'caption', sx: { fontSize: '0.8rem', lineHeight: 1.3, color: isOpen ? zusColors.primary : 'text.secondary' } }}
                                    />
                                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                            </ListItem>

                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <Box
                                    sx={{
                                        mx: 2, mb: 2, borderRadius: 2,
                                        background: `linear-gradient(135deg, ${zusColors.primary}05 0%, white 100%)`,
                                        border: `1px solid ${zusColors.primary}15`,
                                        boxShadow: `inset 0 2px 8px ${zusColors.primary}08`,
                                    }}
                                >
                                    {panel.id === 'basic' && <BasicParametersPanel />}
                                    {panel.id === 'salary' && <SalaryTimelinePanel />}
                                    {panel.id === 'sickLeave' && <SickLeavePanel />}
                                    {panel.id === 'indexation' && <IndexationPanel />}
                                    {panel.id === 'zusAccount' && <ZUSAccountPanel />}
                                    {panel.id === 'workAfterRetirement' && <WorkAfterRetirementPanel />}{/* ⬅️ render nowego panelu */}

                                    {/* Ukryj komunikat „implementacja w toku” dla gotowych paneli */}
                                    {!['basic', 'indexation', 'zusAccount', 'workAfterRetirement'].includes(panel.id) && (
                                        <Box sx={{ px: 2, py: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Panel {panel.title} - implementacja w toku
                                            </Typography>
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
                    );
                })}
            </List>

            {/* ... stopka bez zmian ... */}
        </Box>
    );

    if (isMobile) {
        return (
            <Drawer
                anchor="left"
                open={open}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: sidebarWidth,
                        minWidth: sidebarMinWidth,
                        maxWidth: sidebarMaxWidth,
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
                minWidth: open ? sidebarMinWidth : 0,
                maxWidth: open ? sidebarMaxWidth : 0,
                flexShrink: 0,
                transition: theme.transitions.create(['width', 'min-width', 'max-width'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                '& .MuiDrawer-paper': {
                    width: sidebarWidth,
                    minWidth: sidebarMinWidth,
                    maxWidth: sidebarMaxWidth,
                    boxSizing: 'border-box',
                    position: 'relative',
                    height: '100%',
                    transform: open ? 'translateX(0)' : `translateX(-100%)`,
                    transition: theme.transitions.create('transform', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    boxShadow: `4px 0 20px ${zusColors.primary}10`,
                },
            }}
        >
            {sidebarContent}
        </Drawer>
    );
};

export default DashboardSidebar;
