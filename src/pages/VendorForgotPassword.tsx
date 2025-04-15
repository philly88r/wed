import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import AuroraBackground from '../components/ui/AuroraBackground';

export default function VendorForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [username, setUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  
  const theme = useTheme();
  
  const steps = ['Identify Account', 'Verify Email', 'Reset Password'];

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Please enter your username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if username exists and get the email
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, contact_info')
        .eq('username', username)
        .single();
        
      if (vendorError) {
        throw new Error('Username not found');
      }
      
      if (!vendor.contact_info || !vendor.contact_info.email) {
        throw new Error('No email associated with this account');
      }
      
      // Generate a random 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the reset code in the database (in a real app, you would hash this)
      const { error: updateError } = await supabase
        .from('vendors')
        .update({ 
          reset_code: resetCode,
          reset_code_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        })
        .eq('id', vendor.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // In a real application, you would send an email with the reset code
      // For this demo, we'll just display it
      setVendorId(vendor.id);
      const vendorEmail = vendor.contact_info.email;
      setMaskedEmail(vendorEmail.replace(/(.{2})(.*)(@.*)/, '$1****$3'));
      setSuccess(`A reset code has been sent to ${maskedEmail}`);
      
      // Move to the next step
      setActiveStep(1);
      
    } catch (err: any) {
      console.error('Reset request error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetCode) {
      setError('Please enter the reset code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify the reset code
      const { data: vendor, error: verifyError } = await supabase
        .from('vendors')
        .select('id, reset_code, reset_code_expires_at')
        .eq('id', vendorId)
        .eq('reset_code', resetCode)
        .single();
        
      if (verifyError || !vendor) {
        throw new Error('Invalid reset code');
      }
      
      // Check if the code has expired
      if (vendor.reset_code_expires_at && new Date(vendor.reset_code_expires_at) < new Date()) {
        throw new Error('Reset code has expired. Please request a new one.');
      }
      
      // Move to the next step
      setActiveStep(2);
      setSuccess('Code verified successfully. Please set a new password.');
      
    } catch (err: any) {
      console.error('Code verification error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update the password using RPC function
      const { error: passwordError } = await supabase
        .rpc('set_vendor_password', { 
          vendor_username: username, 
          vendor_password: newPassword 
        });
        
      if (passwordError) throw passwordError;
      
      // Clear the reset code
      const { error: updateError } = await supabase
        .from('vendors')
        .update({ 
          reset_code: null,
          reset_code_expires_at: null
        })
        .eq('id', vendorId);
        
      if (updateError) throw updateError;
      
      setSuccess('Password has been reset successfully. You can now log in with your new password.');
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'An error occurred');
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
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Card elevation={8} sx={{ bgcolor: 'white', borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" align="center" gutterBottom>
              Forgot Password
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ my: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            {activeStep === 0 && (
              <form onSubmit={handleRequestReset}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Please enter your username to request a password reset.
                </Typography>
                
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
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
                  {loading ? <CircularProgress size={24} /> : 'Request Reset'}
                </Button>
              </form>
            )}
            
            {activeStep === 1 && (
              <form onSubmit={handleVerifyCode}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Please enter the 6-digit code sent to your email.
                </Typography>
                
                <TextField
                  label="Reset Code"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  disabled={loading}
                  required
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
                  {loading ? <CircularProgress size={24} /> : 'Verify Code'}
                </Button>
              </form>
            )}
            
            {activeStep === 2 && (
              <form onSubmit={handleResetPassword}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Please enter your new password.
                </Typography>
                
                <TextField
                  label="New Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  helperText="Must be at least 8 characters long"
                />
                
                <TextField
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
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
                  {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
              </form>
            )}
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Or
              </Typography>
            </Divider>
            
            <Button
              component={Link}
              to="/vendor/login"
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
