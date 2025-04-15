import { useState } from 'react';
import { Box, Button, Container, Paper, Typography, Alert, CircularProgress, TextField } from '@mui/material';
import { generateVendorAccess } from '../utils/vendorAccess';

export default function GenerateVendorAccess() {
  const [vendorId, setVendorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessInfo, setAccessInfo] = useState<{
    accessUrl: string;
    password: string;
  } | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setAccessInfo(null);

      const access = await generateVendorAccess(vendorId);
      
      if (!access) {
        throw new Error('Failed to generate vendor access');
      }

      const accessUrl = `${window.location.origin}/vendor/login/${access.accessToken}`;
      
      setAccessInfo({
        accessUrl,
        password: access.password
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Generate Vendor Access
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Vendor ID"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            disabled={loading}
            required
          />
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!vendorId || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Access'}
        </Button>

        {accessInfo && (
          <Box sx={{ mt: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Access link and password generated successfully!
            </Alert>
            
            <Typography variant="subtitle1" gutterBottom>
              Access Link:
            </Typography>
            <TextField
              fullWidth
              value={accessInfo.accessUrl}
              InputProps={{
                readOnly: true,
              }}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Password:
            </Typography>
            <TextField
              fullWidth
              value={accessInfo.password}
              InputProps={{
                readOnly: true,
              }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please send this access link and password to the vendor securely. The link will expire in 7 days.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
