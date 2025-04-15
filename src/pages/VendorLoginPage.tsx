import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  Stack
} from '@mui/material';
import AuroraBackground from '../components/ui/AuroraBackground';
import '../components/ui/aurora-background.css';

export default function VendorLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with username:', username);
      
      // Query the vendors table directly with the username
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, name, slug, username, password_hash')
        .eq('username', username)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        throw new Error(`Invalid username or password: ${vendorError.message}`);
      }
      
      if (!vendorData) {
        console.error('No vendor found with username:', username);
        throw new Error('Invalid username or password');
      }
      
      console.log('Vendor found:', vendorData.name);
      
      // Verify password using RPC function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', { 
          username: username, 
          password: password 
        });
      
      if (verifyError) {
        console.error('Error verifying password:', verifyError);
        throw new Error(`Authentication error: ${verifyError.message}`);
      }
      
      console.log('Password verification result:', isValid);
      
      if (!isValid) {
        console.error('Password verification failed for user:', username);
        throw new Error('Invalid username or password');
      }

      // Store vendor ID in session
      sessionStorage.setItem('vendorId', vendorData.id);
      sessionStorage.setItem('vendorName', vendorData.name);
      
      console.log('Login successful, redirecting to profile edit page');
      
      // Redirect to vendor profile edit page
      navigate(`/vendor/profile/edit/${vendorData.id}`);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during login');
      } else {
        setError('An unexpected error occurred during login');
        console.error('Unexpected error object:', JSON.stringify(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        bgcolor: theme.palette.accent.rose,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <AuroraBackground>
          <Box sx={{ height: '100vh' }} />
        </AuroraBackground>
      </Box>
      
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Card 
          elevation={8}
          sx={{ 
            bgcolor: 'white',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box 
              component="img"
              src="/Altare Primary-Blanc.svg"
              alt="Altare Logo"
              sx={{ 
                width: '200px',
                display: 'block',
                mx: 'auto',
                mb: 3
              }}
            />
            
            <Typography variant="h5" component="h1" align="center" gutterBottom>
              Vendor Login
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Or
                </Typography>
              </Divider>
              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  component={Link}
                  to="/vendor/register"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  Register
                </Button>
                
                <Button
                  component={Link}
                  to="/vendor/forgot-password"
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  size="large"
                >
                  Forgot Password
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
