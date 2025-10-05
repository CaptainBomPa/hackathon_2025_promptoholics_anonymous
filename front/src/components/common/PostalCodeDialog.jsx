import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { zusColors } from '../../constants/zus-colors';
import pensionApiService from '../../services/pensionApiService';

/**
 * Postal Code Dialog Component
 * Implements point 1.6 from app specification - optional postal code collection
 */
const PostalCodeDialog = ({ open, onClose, calculationId }) => {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!postalCode.trim()) {
      // Allow empty postal code - it's optional
      onClose();
      return;
    }

    // Basic postal code validation (Polish format: XX-XXX)
    const postalCodeRegex = /^\d{2}-\d{3}$/;
    if (!postalCodeRegex.test(postalCode)) {
      setError('Kod pocztowy powinien mieć format XX-XXX (np. 00-001)');
      return;
    }

    // Check if we have a valid calculation ID
    if (!calculationId) {
      console.warn('No calculation ID available, skipping postal code update');
      onClose();
      return;
    }

    // Check if this is a mock calculation ID
    if (calculationId.startsWith('mock-')) {
      console.warn('Mock calculation ID detected, skipping postal code update');
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await pensionApiService.updatePostalCode(calculationId, postalCode);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error?.userMessage || 'Błąd podczas zapisywania kodu pocztowego');
      }
    } catch (err) {
      console.error('Postal code update error:', err);
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handlePostalCodeChange = (event) => {
    let value = event.target.value;
    
    // Auto-format: add dash after 2 digits
    if (value.length === 2 && !value.includes('-')) {
      value = value + '-';
    }
    
    // Limit to 6 characters (XX-XXX)
    if (value.length <= 6) {
      setPostalCode(value);
      setError(null);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleSkip();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pb: 1,
          borderBottom: `1px solid ${zusColors.neutral}20`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <LocationIcon sx={{ color: zusColors.primary, fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: zusColors.dark }}>
            Kod pocztowy
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Opcjonalnie - pomaga nam w analizie regionalnej
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Czy chciałbyś podać swój kod pocztowy?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Informacja jest całkowicie opcjonalna i pomoże nam lepiej zrozumieć 
            regionalne zainteresowanie symulatorem.
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Kod pocztowy"
          value={postalCode}
          onChange={handlePostalCodeChange}
          onKeyDown={handleKeyDown}
          placeholder="00-001"
          helperText="Format: XX-XXX (np. 00-001, 31-559)"
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused fieldset': {
                borderColor: zusColors.primary,
              }
            },
            '& .MuiFormLabel-root.Mui-focused': {
              color: zusColors.primary,
            }
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'center' }}>
        <Button
          onClick={handleSkip}
          variant="outlined"
          size="large"
          sx={{
            borderColor: zusColors.neutral,
            color: zusColors.neutral,
            minWidth: 120,
            '&:hover': {
              borderColor: zusColors.dark,
              color: zusColors.dark,
            }
          }}
        >
          Pomiń
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            backgroundColor: zusColors.primary,
            minWidth: 120,
            '&:hover': {
              backgroundColor: zusColors.success,
            }
          }}
        >
          {loading ? 'Zapisuję...' : 'Zapisz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostalCodeDialog;