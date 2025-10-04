import React, { useState } from 'react';
import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import { Dashboard as DashboardIcon, FileDownload, Menu as MenuIcon } from '@mui/icons-material';
import { zusColors } from '../../constants/zus-colors';
import { useDashboard } from '../../contexts/DashboardContext';

const DashboardHeader = ({ onToggleSidebar }) => {
    const { state } = useDashboard();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;
            const targets = ['report-summary', 'report-zus-chart', 'report-salary-chart'];
            const canvases = [];
            for (const id of targets) {
                const el = document.getElementById(id);
                if (!el) continue;
                const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                canvases.push(canvas);
            }
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 10;
            let first = true;
            for (const canvas of canvases) {
                const imgW = pageW - margin * 2;
                const ratio = imgW / canvas.width;
                const slicePx = Math.floor((pageH - margin * 2) / ratio);
                for (let y = 0; y < canvas.height; y += slicePx) {
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = canvas.width;
                    sliceCanvas.height = Math.min(slicePx, canvas.height - y);
                    const ctx = sliceCanvas.getContext('2d');
                    ctx.drawImage(canvas, 0, y, canvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height);
                    const imgH = sliceCanvas.height * ratio;
                    if (!first) pdf.addPage();
                    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgW, imgH);
                    first = false;
                }
            }
            const d = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const name = `raport-emerytura_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.pdf`;
            pdf.save(name);
        } catch (e) {
            console.error(e);
            alert('Nie udało się wygenerować PDF. Spróbuj ponownie.');
        } finally {
            setExporting(false);
        }
    };

    return (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={onToggleSidebar} sx={{ display: { xs: 'block', md: 'none' } }} aria-label="Toggle sidebar">
                            <MenuIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DashboardIcon sx={{ color: zusColors.primary, fontSize: 28 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: zusColors.primary }}>
                                Dashboard Symulatora
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {state.uiState.isCalculating && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${zusColors.info} 0%, ${zusColors.primary} 100%)`,
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                            '@keyframes pulse': {
                                                '0%': { opacity: 1, transform: 'scale(1)' },
                                                '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                                                '100%': { opacity: 1, transform: 'scale(1)' },
                                            },
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: zusColors.info, fontWeight: 500 }}>
                                        Przeliczanie...
                                    </Typography>
                                </Box>
                            )}
                            {!state.uiState.isCalculating && state.uiState.lastCalculation && (
                                <Typography variant="caption" sx={{ color: zusColors.success, fontWeight: 500 }}>
                                    ✅ Aktualne
                                </Typography>
                            )}
                        </Box>

                        <Button
                            startIcon={<FileDownload />}
                            onClick={handleExport}
                            variant="contained"
                            size="medium"
                            disabled={state.uiState.isCalculating || exporting}
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
                                '&:active': { transform: 'translateY(0px)' },
                                '&:disabled': { background: zusColors.neutral, color: 'white', opacity: 0.6 },
                            }}
                        >
                            {exporting ? 'Generuję PDF…' : 'Zapisz i pobierz raport jako PDF'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default DashboardHeader;
