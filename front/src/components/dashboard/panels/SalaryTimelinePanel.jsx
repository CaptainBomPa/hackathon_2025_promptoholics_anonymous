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
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  Work as WorkIcon,
  Pause as PauseIcon,

} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

/**
 * Salary Timeline Panel Component
 * Manages salary periods and breaks with editable table
 */
const SalaryTimelinePanel = () => {
  const { state, actions } = useDashboard();
  const { salaryTimeline } = state.parameters;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    type: 'salary', // 'salary' or 'break'
    startDate: null,
    endDate: null,
    grossAmount: '',
  });

  // Get records from context instead of local state
  const records = salaryTimeline?.entries || [];

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormData({
      type: 'salary',
      startDate: null,
      endDate: null,
      grossAmount: '',
    });
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
    const updatedRecords = records.filter(record => record.id !== id);
    actions.updateSalaryTimeline({
      entries: updatedRecords
    });
  };

  const handleSaveRecord = () => {
    // Basic validation
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
      // Update existing record
      updatedRecords = records.map(record =>
        record.id === editingRecord.id
          ? { ...record, ...formData, grossAmount: formData.type === 'break' ? null : Number(formData.grossAmount) }
          : record
      );
    } else {
      // Add new record
      const newRecord = {
        id: Math.max(...records.map(r => r.id), 0) + 1,
        ...formData,
        grossAmount: formData.type === 'break' ? null : Number(formData.grossAmount),
      };
      updatedRecords = [...records, newRecord];
    }
    
    // Update context with new records
    actions.updateSalaryTimeline({
      entries: updatedRecords
    });
    
    setDialogOpen(false);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Clear grossAmount when switching to break
      ...(field === 'type' && value === 'break' ? { grossAmount: '' } : {})
    }));
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('pl-PL') : '';
  };

  const getTypeChip = (type) => {
    if (type === 'salary') {
      return <WorkIcon />
    } else {
      return (
          <PauseIcon />
      );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
      <Box sx={{ p: 3 }}>
        {/* Add Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddRecord}
            variant="contained"
            sx={{
              backgroundColor: zusColors.primary,
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: zusColors.success,
              },
            }}
          >
            Dodaj nowy rekord
          </Button>
        </Box>

        {/* Table */}
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
              {records.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{
                    '&:hover': {
                      background: `linear-gradient(135deg, ${zusColors.primary}05 0%, ${zusColors.info}03 100%)`,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <TableCell>{getTypeChip(record.type)}</TableCell>
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

        {/* Summary */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${zusColors.info}08 0%, ${zusColors.secondary}05 100%)`,
            border: `1px solid ${zusColors.info}20`,
          }}
        >
          <Typography variant="body2" sx={{ color: zusColors.dark, fontWeight: 600, mb: 1 }}>
            📊 Podsumowanie timeline:
          </Typography>
          <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
            • Okresów pracy: {records.filter(r => r.type === 'salary').length}
          </Typography>
          <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
            • Przerw w pracy: {records.filter(r => r.type === 'break').length}
          </Typography>
          <Typography variant="body2" sx={{ color: zusColors.dark, opacity: 0.8 }}>
            • Łączna liczba rekordów: {records.length}
          </Typography>
          <Typography variant="body2" sx={{ color: zusColors.success, fontWeight: 600, mt: 1 }}>
            ✅ Zmiany w timeline automatycznie wpływają na kalkulację emerytury
          </Typography>
        </Box>

        {/* Dialog for Add/Edit */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            }
          }}
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
              {/* Type */}
              <TextField
                select
                label="Typ rekordu"
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                fullWidth
              >
                <MenuItem value="salary">
                  💼 Wynagrodzenie
                </MenuItem>
                <MenuItem value="break">
                  ⏸️ Przerwa
                </MenuItem>
              </TextField>

              {/* Date Range */}
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

              {/* Gross Amount */}
              <TextField
                label="Kwota brutto (PLN)"
                type="number"
                value={formData.grossAmount}
                onChange={(e) => handleFormChange('grossAmount', e.target.value)}
                disabled={formData.type === 'break'}
                fullWidth
                helperText={formData.type === 'break' ? 'Kwota jest wyłączona dla przerw' : 'Miesięczne wynagrodzenie brutto'}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{
                color: zusColors.neutral,
                fontWeight: 500,
              }}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSaveRecord}
              variant="contained"
              sx={{
                backgroundColor: zusColors.primary,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: zusColors.success,
                },
              }}
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