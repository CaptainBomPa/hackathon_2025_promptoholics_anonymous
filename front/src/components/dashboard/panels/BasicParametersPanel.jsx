import React from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Typography,
    InputAdornment,
    Stack,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useDashboard } from '../../../contexts/DashboardContext';
import { zusColors } from '../../../constants/zus-colors';

const BasicParametersPanel = () => {
    const { state, actions } = useDashboard();
    const { basic } = state.parameters;
    const { errors } = state.uiState;

    const handleBasicParameterChange = (field, value) => {
        const numericFields = ['age', 'grossSalary', 'startYear', 'plannedEndYear', 'expectedPension'];

        let processedValue;
        if (numericFields.includes(field)) {
            if (value === '' || value === null || value === undefined) {
                processedValue = undefined;
            } else {
                const numValue = Number(value);
                processedValue = isNaN(numValue) ? undefined : numValue;
            }
        } else {
            processedValue = value;
        }

        actions.setBasicParameters({
            [field]: processedValue,
        });
    };

    const currentYear = new Date().getFullYear();

    const workingYearsRaw = (basic?.plannedEndYear || 0) - (basic?.startYear || 0);
    const workingYears = workingYearsRaw > 0 ? workingYearsRaw : 0;

    const yearsToRetirementRaw = (basic?.plannedEndYear || 0) - currentYear;
    const yearsToRetirement = yearsToRetirementRaw > 0 ? yearsToRetirementRaw : 0;

    const annualSalary = Math.max(0, (basic?.grossSalary || 0) * 12);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Person sx={{ color: zusColors.primary, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Parametry podstawowe
                </Typography>
            </Box>

            <Stack spacing={2}>
                {/* Wiek */}
                <TextField
                    fullWidth
                    size="small"
                    label="Wiek"
                    type="number"
                    value={basic.age || ''}
                    onChange={(e) => handleBasicParameterChange('age', e.target.value)}
                    error={!!errors.age}
                    helperText={errors.age || 'Obecny wiek (16-80 lat)'}
                    inputProps={{ min: 16, max: 80 }}
                />

                {/* Płeć */}
                <TextField
                    fullWidth
                    size="small"
                    select
                    label="Płeć"
                    value={basic.gender || 'F'}
                    onChange={(e) => handleBasicParameterChange('gender', e.target.value)}
                >
                    <MenuItem value="F">Kobieta</MenuItem>
                    <MenuItem value="M">Mężczyzna</MenuItem>
                </TextField>

                {/* Typ pracy */}
                <TextField
                    fullWidth
                    size="small"
                    select
                    label="Typ pracy"
                    value={basic.workType || 'employment'}
                    onChange={(e) => handleBasicParameterChange('workType', e.target.value)}
                    helperText="Rodzaj umowy wpływa na wysokość składek ZUS"
                >
                    <MenuItem value="employment">💼 Umowa o pracę</MenuItem>
                    <MenuItem value="mandate">📋 Umowa o zlecenie</MenuItem>
                    <MenuItem value="business">🏢 Jednoosobowa działalność gospodarcza (JDG)</MenuItem>
                    <MenuItem value="contract">📝 Umowa o dzieło</MenuItem>
                </TextField>

                {/* Wynagrodzenie brutto */}
                <TextField
                    fullWidth
                    size="small"
                    label="Wynagrodzenie brutto"
                    type="number"
                    value={basic.grossSalary || ''}
                    onChange={(e) => handleBasicParameterChange('grossSalary', e.target.value)}
                    error={!!errors.grossSalary}
                    helperText={errors.grossSalary || 'Miesięczne wynagrodzenie brutto w PLN'}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">PLN/mc</InputAdornment>,
                    }}
                    inputProps={{ min: 0 }}
                />

                {/* Rok rozpoczęcia pracy */}
                <TextField
                    fullWidth
                    size="small"
                    label="Rok rozpoczęcia pracy"
                    type="number"
                    value={basic.startYear || ''}
                    onChange={(e) => handleBasicParameterChange('startYear', e.target.value)}
                    error={!!errors.startYear}
                    helperText={errors.startYear || 'Rok rozpoczęcia kariery zawodowej'}
                    inputProps={{ min: 1960, max: currentYear }}
                />

                {/* Planowany rok emerytury */}
                <TextField
                    fullWidth
                    size="small"
                    label="Planowany rok emerytury"
                    type="number"
                    value={basic.plannedEndYear || ''}
                    onChange={(e) => handleBasicParameterChange('plannedEndYear', e.target.value)}
                    error={!!errors.plannedEndYear}
                    helperText={errors.plannedEndYear || 'Rok przejścia na emeryturę'}
                    inputProps={{ min: currentYear, max: currentYear + 50 }}
                />

                {/* Oczekiwana emerytura */}
                <TextField
                    fullWidth
                    size="small"
                    label="Oczekiwana emerytura"
                    type="number"
                    value={basic.expectedPension || ''}
                    onChange={(e) => handleBasicParameterChange('expectedPension', e.target.value)}
                    helperText="Miesięczna emerytura, którą chciałbyś otrzymywać"
                    InputProps={{
                        endAdornment: <InputAdornment position="end">PLN/mc</InputAdornment>,
                    }}
                    inputProps={{ min: 0 }}
                />
            </Stack>
        </Box>
    );
};

export default BasicParametersPanel;
