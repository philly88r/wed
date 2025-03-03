import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      // Send magic link to user's email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Magic link sent! Check your email for the login link.' 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.error_description || error.message || 'An error occurred during login' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          Welcome to Astare
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 4, textAlign: 'center' }}>
          Your perfect wedding planning companion
        </Typography>
        
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ width: '100%', mb: 3 }}
          >
            {message.text}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              py: 1.5, 
              mb: 2,
              fontSize: '1rem'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Send Magic Link'
            )}
          </Button>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            We'll email you a magic link for a password-free sign in.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
