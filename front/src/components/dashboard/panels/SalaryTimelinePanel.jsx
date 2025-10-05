import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Work as WorkIcon,
    Pause as PauseIcon,
    InfoOutlined as InfoOutlinedIcon,   // ⟵ NOWE
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

const SalaryTimelinePanel = () => {
    const { state, actions } = useDashboard();
    const { salaryTimeline } = state.parameters;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        type: 'salary',
        startDate: null,
        endDate: null,
        grossAmount: '',
    });

    const records = salaryTimeline?.entries || [];

    const handleAddRecord = () => {
        setEditingRecord(null);
        setFormData({ type: 'salary', startDate: null, endDate: null, grossAmount: '' });
        setDialogOpen(true);
    };

    const handleEditRecord = (record) => {
        setEditingRecord(record);
        setFormData({
            type: record.type,
            startDate: record.startDate,
            endDate: record.endDate,
            grossAmount: record.grossAmount || '',
        });
        setDialogOpen(true);
    };

    const handleDeleteRecord = (id) => {
        const updatedRecords = records.filter((record) => record.id !== id);
        actions.updateSalaryTimeline({ entries: updatedRecords });
    };

    const handleSaveRecord = () => {
        if (!formData.startDate || !formData.endDate) {
            alert('Proszę wypełnić daty od i do');
            return;
        }
        if (formData.startDate >= formData.endDate) {
            alert('Data rozpoczęcia musi być wcześniejsza niż data zakończenia');
            return;
        }
        if (formData.type === 'salary' && (!formData.grossAmount || formData.grossAmount <= 0)) {
            alert('Proszę podać prawidłową kwotę brutto dla wynagrodzenia');
            return;
        }

        let updatedRecords;
        if (editingRecord) {
            updatedRecords = records.map((record) =>
                record.id === editingRecord.id
                    ? {
                        ...record,
                        ...formData,
                        grossAmount: formData.type === 'break' ? null : Number(formData.grossAmount),
                    }
                    : record
            );
        } else {
            const newRecord = {
                id: Math.max(...records.map((r) => r.id), 0) + 1,
                ...formData,
                grossAmount: formData.type === 'break' ? null : Number(formData.grossAmount),
            };
            updatedRecords = [...records, newRecord];
        }

        actions.updateSalaryTimeline({ entries: updatedRecords });
        setDialogOpen(false);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
            ...(field === 'type' && value === 'break' ? { grossAmount: '' } : {}),
        }));
    };

    const formatDate = (date) => (date ? date.toLocaleDateString('pl-PL') : '');
    const getTypeIcon = (type) => (type === 'salary' ? <WorkIcon /> : <PauseIcon />);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
            <Box sx={{ p: 3 }}>
                {/* Nagłówek z eleganckim tooltipem */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: zusColors.dark }}>
                        Oś czasu wynagrodzeń
                    </Typography>

                    <Tooltip
                        arrow
                        placement="right"
                        enterTouchDelay={0}
                        leaveTouchDelay={4000}
                        title={
                            <Box sx={{ p: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    Wskazówki
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'block', mb: 0.25 }}>
                                    • 💼 oznacza okres z wynagrodzeniem
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'block', mb: 0.25 }}>
                                    • ⏸️ oznacza przerwę w zatrudnieniu
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'block', mb: 0.25 }}>
                                    • Użyj <b>Dodaj nowy rekord</b>, aby wprowadzić nowy okres
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'block', mb: 0.25 }}>
                                    • <b>Edytuj</b> – popraw daty/kwotę, <b>Usuń</b> – usuń wiersz
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'block' }}>
                                    • Kwota brutto dotyczy <i>miesięcznego</i> wynagrodzenia
                                </Typography>
                            </Box>
                        }
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: '#0b1220',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                    maxWidth: 320,
                                    borderRadius: 2,
                                    p: 1.25,
                                },
                            },
                            arrow: { sx: { color: '#0b1220' } },
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                ml: 0.5,
                                bgcolor: `${zusColors.primary}15`,
                                color: zusColors.primary,
                                '&:hover': { bgcolor: `${zusColors.primary}25` },
                            }}
                        >
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Tabela */}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 1,
                        background: `linear-gradient(135deg, ${zusColors.primary}03 0%, white 100%)`,
                        border: `1px solid ${zusColors.primary}15`,
                        boxShadow: `0 4px 16px ${zusColors.primary}10`,
                        overflowX: 'auto',
                    }}
                >
                    <Table sx={{ minWidth: 450 }}>
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: `linear-gradient(135deg, ${zusColors.primary}08 0%, ${zusColors.info}05 100%)`,
                                }}
                            >
                                <TableCell sx={{ fontWeight: 700, color: zusColors.dark }}>Typ</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: zusColors.dark }}>Od</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: zusColors.dark }}>Do</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: zusColors.dark }}>Kwota brutto</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: zusColors.dark }}>Akcje</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.map((record, idx) => (
                                <TableRow
                                    key={record.id}
                                    sx={{
                                        // jeśli chcesz, włącz zebrę:
                                        // backgroundColor: idx % 2 === 0 ? `${zusColors.primary}03` : `${zusColors.info}06`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${zusColors.primary}05 0%, ${zusColors.info}03 100%)`,
                                        },
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    <TableCell>{(record.type === 'salary') ? <WorkIcon /> : <PauseIcon />}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{formatDate(record.startDate)}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{formatDate(record.endDate)}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: zusColors.primary }}>
                                        {record.grossAmount ? `${record.grossAmount.toLocaleString('pl-PL')} PLN` : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Edytuj">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditRecord(record)}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${zusColors.info}15 0%, ${zusColors.primary}10 100%)`,
                                                        color: zusColors.info,
                                                        '&:hover': {
                                                            background: `linear-gradient(135deg, ${zusColors.info}25 0%, ${zusColors.primary}20 100%)`,
                                                            transform: 'scale(1.1)',
                                                        },
                                                        transition: 'all 0.2s ease-in-out',
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Usuń">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteRecord(record.id)}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${zusColors.error}15 0%, ${zusColors.secondary}10 100%)`,
                                                        color: zusColors.error,
                                                        '&:hover': {
                                                            background: `linear-gradient(135deg, ${zusColors.error}25 0%, ${zusColors.secondary}20 100%)`,
                                                            transform: 'scale(1.1)',
                                                        },
                                                        transition: 'all 0.2s ease-in-out',
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Przycisk dodawania pod tabelą */}
                <Box sx={{ mt: 2 }}>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddRecord}
                        variant="contained"
                        sx={{
                            backgroundColor: zusColors.primary,
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { backgroundColor: zusColors.success },
                        }}
                    >
                        Dodaj nowy rekord
                    </Button>
                </Box>

                {/* Dialog dodawania/edycji */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 1 } }}
                >
                    <DialogTitle
                        sx={{
                            borderBottom: `1px solid ${zusColors.neutral}20`,
                            color: zusColors.dark,
                            fontWeight: 600,
                            fontSize: '1.25rem',
                        }}
                    >
                        {editingRecord ? 'Edytuj rekord' : 'Dodaj nowy rekord'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                select
                                label="Typ rekordu"
                                value={formData.type}
                                onChange={(e) => handleFormChange('type', e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="salary">💼 Wynagrodzenie</MenuItem>
                                <MenuItem value="break">⏸️ Przerwa</MenuItem>
                            </TextField>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <DatePicker
                                    label="Data od"
                                    value={formData.startDate}
                                    onChange={(date) => handleFormChange('startDate', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                                <DatePicker
                                    label="Data do"
                                    value={formData.endDate}
                                    onChange={(date) => handleFormChange('endDate', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </Box>

                            <TextField
                                label="Kwota brutto (PLN)"
                                type="number"
                                value={formData.grossAmount}
                                onChange={(e) => handleFormChange('grossAmount', e.target.value)}
                                disabled={formData.type === 'break'}
                                fullWidth
                                helperText={
                                    formData.type === 'break'
                                        ? 'Kwota jest wyłączona dla przerw'
                                        : 'Miesięczne wynagrodzenie brutto'
                                }
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button onClick={() => setDialogOpen(false)} sx={{ color: zusColors.neutral, fontWeight: 500 }}>
                            Anuluj
                        </Button>
                        <Button
                            onClick={handleSaveRecord}
                            variant="contained"
                            sx={{ backgroundColor: zusColors.primary, fontWeight: 600, '&:hover': { backgroundColor: zusColors.success } }}
                        >
                            Zapisz
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default SalaryTimelinePanel;
