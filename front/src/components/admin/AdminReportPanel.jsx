import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import { zusColors } from '../../constants/zus-colors';
import pensionApiService from '../../services/pensionApiService';

/**
 * Admin Report Panel Component
 * Implements point 1.7 from app specification - admin usage reporting
 */
const AdminReportPanel = () => {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), 0, 1)); // Start of year
  const [dateTo, setDateTo] = useState(new Date()); // Today
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Mock data for preview - in real app this would come from API
  const [mockData] = useState([
    {
      date: '2025-01-05',
      time: '11:20',
      expectedPension: 5200,
      age: 33,
      gender: 'F',
      salary: 9200,
      sickLeave: true,
      zusAccount: 120000,
      actualPension: 6450,
      realPension: 5545,
      postalCode: '02-326',
    },
    {
      date: '2025-01-04',
      time: '15:02',
      expectedPension: 4500,
      age: 41,
      gender: 'M',
      salary: 7800,
      sickLeave: false,
      zusAccount: null,
      actualPension: 4980,
      realPension: 4280,
      postalCode: null,
    },
    {
      date: '2025-01-03',
      time: '09:47',
      expectedPension: 6000,
      age: 28,
      gender: 'F',
      salary: 12500,
      sickLeave: true,
      zusAccount: 80000,
      actualPension: 7250,
      realPension: 6235,
      postalCode: '31-559',
    },
  ]);

  const handleExportReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await pensionApiService.generateAdminReport(
        dateFrom.toISOString().split('T')[0],
        dateTo.toISOString().split('T')[0]
      );

      if (result.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        window.URL.revokeObjectURL(result.data.url);
        
        setSuccess(`Raport został pobrany: ${result.data.filename}`);
      } else {
        setError(result.error?.userMessage || 'Błąd podczas generowania raportu');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('Wystąpił nieoczekiwany błąd podczas eksportu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return `${value.toLocaleString('pl-PL')} PLN`;
  };

  const getGenderChip = (gender) => (
    <Chip
      label={gender}
      size="small"
      sx={{
        backgroundColor: gender === 'F' ? zusColors.info + '20' : zusColors.secondary + '20',
        color: gender === 'F' ? zusColors.info : zusColors.secondary,
        fontWeight: 600,
      }}
    />
  );

  const getSickLeaveChip = (hasSickLeave) => (
    <Chip
      label={hasSickLeave ? 'Uwzględniono' : 'Nie'}
      size="small"
      sx={{
        backgroundColor: hasSickLeave ? zusColors.success + '20' : zusColors.neutral + '20',
        color: hasSickLeave ? zusColors.success : zusColors.neutral,
        fontWeight: 600,
      }}
    />
  );

  // Calculate summary statistics
  const totalSimulations = mockData.length;
  const withSickLeave = mockData.filter(item => item.sickLeave).length;
  const sickLeavePercentage = Math.round((withSickLeave / totalSimulations) * 100);
  const medianSalary = mockData.map(item => item.salary).sort((a, b) => a - b)[Math.floor(mockData.length / 2)];
  const medianExpected = mockData.map(item => item.expectedPension).sort((a, b) => a - b)[Math.floor(mockData.length / 2)];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: zusColors.dark,
              mb: 1,
            }}
          >
            Panel Administratora
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Raportowanie zainteresowania symulatorem emerytalnym
          </Typography>

          {/* Summary Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: zusColors.primary }}>
                    {totalSimulations.toLocaleString('pl-PL')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Symulacje
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: zusColors.success }}>
                    {sickLeavePercentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Z chorobowym
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: zusColors.info }}>
                    {formatCurrency(medianSalary)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mediana płac
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: zusColors.secondary }}>
                    {formatCurrency(medianExpected)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mediana oczekiwań
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Filters and Export */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, flexWrap: 'wrap' }}>
            <DatePicker
              label="Data od"
              value={dateFrom}
              onChange={(newValue) => setDateFrom(newValue)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <DatePicker
              label="Data do"
              value={dateTo}
              onChange={(newValue) => setDateTo(newValue)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                startIcon={<FilterListIcon />}
                variant="outlined"
                size="medium"
              >
                Filtruj
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                size="medium"
              >
                Odśwież
              </Button>
              <Button
                startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                onClick={handleExportReport}
                variant="contained"
                size="medium"
                disabled={loading}
                sx={{
                  backgroundColor: zusColors.primary,
                  '&:hover': {
                    backgroundColor: zusColors.success,
                  },
                }}
              >
                {loading ? 'Generuję...' : 'Eksport XLS'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Data Table */}
        <TableContainer component={Paper} elevation={1}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: zusColors.primary + '10' }}>
                <TableCell sx={{ fontWeight: 700 }}>Data użycia</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Godzina</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Oczekiwana emerytura</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Wiek</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Płeć</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Wynagrodzenie</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Chorobowe</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Saldo ZUS</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Emerytura rzeczywista</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Emerytura urealniona</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kod pocztowy</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: zusColors.neutral + '05',
                    },
                    '&:hover': {
                      backgroundColor: zusColors.primary + '08',
                    },
                  }}
                >
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.expectedPension)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{row.age}</TableCell>
                  <TableCell>{getGenderChip(row.gender)}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.salary)}
                  </TableCell>
                  <TableCell>{getSickLeaveChip(row.sickLeave)}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.zusAccount)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.actualPension)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.realPension)}
                  </TableCell>
                  <TableCell>{row.postalCode || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Wyświetlono {mockData.length} rekordów • Strona 1 z 1
          </Typography>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminReportPanel;