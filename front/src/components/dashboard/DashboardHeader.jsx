import { useState } from 'react';
import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import { Dashboard as DashboardIcon, FileDownload, Menu as MenuIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { zusColors } from '../../constants/zus-colors';
import { useDashboard } from '../../contexts/DashboardContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

const DashboardHeader = ({ onToggleSidebar }) => {
    const { state, actions } = useDashboard();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 15;
            
            // Function to handle Polish characters properly
            const addTextWithPolishSupport = (text, x, y, options = {}) => {
                // Convert Polish characters to their closest ASCII equivalents for PDF compatibility
                const cleanText = text
                    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
                    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
                    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
                    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
                    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
                    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
                    .replace(/ś/g, 's').replace(/Ś/g, 'S')
                    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
                    .replace(/ż/g, 'z').replace(/Ż/g, 'Z');
                
                pdf.text(cleanText, x, y, options);
            };
            
            // Add support for Polish characters by using a Unicode-compatible font
            // Use Times font which has better Unicode support in jsPDF
            pdf.setFont('times', 'normal');
            
            // Add header with title and generation date
            pdf.setFontSize(20);
            pdf.setTextColor(0, 65, 110); // ZUS dark blue
            addTextWithPolishSupport('Raport Prognozy Emerytury', margin, 25);
            
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            const now = new Date();
            addTextWithPolishSupport(`Wygenerowano: ${now.toLocaleDateString('pl-PL')} ${now.toLocaleTimeString('pl-PL')}`, margin, 35);
            
            // Add parameters summary
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            addTextWithPolishSupport('Parametry symulacji:', margin, 50);
            
            pdf.setFontSize(10);
            const params = state.parameters.basic;
            let yPos = 60;
            const paramLines = [
                `Wiek: ${params.age} lat`,
                `Plec: ${params.gender === 'F' ? 'Kobieta' : 'Mezczyzna'}`,
                `Wynagrodzenie brutto: ${params.grossSalary?.toLocaleString('pl-PL')} PLN`,
                `Rok rozpoczecia pracy: ${params.startYear}`,
                `Planowany rok zakonczenia: ${params.plannedEndYear}`,
                `Oczekiwana emerytura: ${params.expectedPension?.toLocaleString('pl-PL')} PLN`,
            ];
            
            paramLines.forEach(line => {
                addTextWithPolishSupport(line, margin, yPos);
                yPos += 6;
            });
            
            // Add results summary
            yPos += 10;
            pdf.setFontSize(12);
            addTextWithPolishSupport('Wyniki prognozy:', margin, yPos);
            yPos += 10;
            
            pdf.setFontSize(10);
            const results = state.results;
            const resultLines = [
                `Emerytura rzeczywista: ${results.actualAmountPLN?.toLocaleString('pl-PL')} PLN`,
                `Emerytura urealniona: ${results.realAmountDeflated?.toLocaleString('pl-PL')} PLN`,
                `Stopa zastapienia: ${results.replacementRatePct?.toFixed(1)}%`,
                `Roznica vs srednia: ${results.vsAverageInRetirementYearPct > 0 ? '+' : ''}${results.vsAverageInRetirementYearPct?.toFixed(1)} p.p.`,
            ];
            
            resultLines.forEach(line => {
                addTextWithPolishSupport(line, margin, yPos);
                yPos += 6;
            });
            
            // Add charts and visualizations
            const targets = ['report-summary', 'report-zus-chart', 'report-salary-chart'];
            let isFirstChart = true;
            
            for (const id of targets) {
                const el = document.getElementById(id);
                if (!el) continue;
                
                if (!isFirstChart) {
                    pdf.addPage();
                }
                
                const canvas = await html2canvas(el, { 
                    scale: 2, 
                    useCORS: true, 
                    backgroundColor: '#ffffff',
                    logging: false,
                });
                
                const imgW = pageW - margin * 2;
                const ratio = imgW / canvas.width;
                const imgH = canvas.height * ratio;
                
                // If image is too tall, split it across pages
                if (imgH > pageH - margin * 2) {
                    const slicePx = Math.floor((pageH - margin * 2) / ratio);
                    for (let y = 0; y < canvas.height; y += slicePx) {
                        if (y > 0) pdf.addPage();
                        
                        const sliceCanvas = document.createElement('canvas');
                        sliceCanvas.width = canvas.width;
                        sliceCanvas.height = Math.min(slicePx, canvas.height - y);
                        const ctx = sliceCanvas.getContext('2d');
                        ctx.drawImage(canvas, 0, y, canvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height);
                        
                        const sliceImgH = sliceCanvas.height * ratio;
                        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgW, sliceImgH);
                    }
                } else {
                    const startY = isFirstChart ? Math.max(yPos + 10, 120) : margin;
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, startY, imgW, imgH);
                }
                
                isFirstChart = false;
            }
            
            // Add footer with disclaimer
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                addTextWithPolishSupport('Raport wygenerowany przez Symulator Emerytalny ZUS - dane maja charakter orientacyjny', margin, pageH - 10);
                addTextWithPolishSupport(`Strona ${i} z ${totalPages}`, pageW - margin - 20, pageH - 10);
            }
            
            const d = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const name = `raport-emerytura_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.pdf`;
            pdf.save(name);
            
        } catch (e) {
            console.error('PDF Export Error:', e);
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
                                </Typography>
                            )}
                        </Box>

                        <Button
                            startIcon={<LocationIcon />}
                            onClick={actions.showPostalCodeDialog}
                            variant="outlined"
                            size="medium"
                            disabled={state.uiState.isCalculating}
                            sx={{
                                borderColor: zusColors.info,
                                color: zusColors.info,
                                fontWeight: 600,
                                px: 3,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: zusColors.primary,
                                    color: zusColors.primary,
                                    backgroundColor: zusColors.primary + '08',
                                },
                            }}
                        >
                            Kod pocztowy
                        </Button>

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
                            {exporting ? 'Generuję PDF…' : 'Pobierz raport PDF'}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default DashboardHeader;
