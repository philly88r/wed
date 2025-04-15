import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { verifyVendorAccess } from '../utils/vendorAccess';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function VendorLogin() {
  const navigate = useNavigate();
  const { accessToken } = useParams<{ accessToken: string }>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!accessToken) {
        throw new Error('Invalid access link');
      }

      const vendorId = await verifyVendorAccess(accessToken, password);
      
      if (vendorId) {
        // Store vendor ID and access token in session
        sessionStorage.setItem('vendorId', vendorId);
        sessionStorage.setItem('vendorAccessToken', accessToken);
        // Redirect to vendor profile edit page
        navigate(`/vendor/profile/edit/${vendorId}`);
      } else {
        setError('Invalid password or expired access link');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              p: 1,
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom>
            Vendor Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
