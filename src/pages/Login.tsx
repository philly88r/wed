import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress, Link, Divider } from '@mui/material';
import AuroraBackground from '../components/ui/AuroraBackground';
import '../components/ui/aurora-background.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please enter both email and password' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      // Sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to home page on successful login
      navigate('/');
      
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.error_description || error.message || 'Invalid login credentials' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
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
    <AuroraBackground>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: 'primary.main',
              fontFamily: "'Playfair Display', serif",
              textAlign: 'center'
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
              sx={{ mb: 2 }}
            />
            
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
                fontSize: '1rem',
                borderRadius: '8px'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleMagicLinkLogin}
              disabled={loading}
              sx={{ 
                py: 1.5, 
                mb: 2,
                fontSize: '1rem',
                borderRadius: '8px'
              }}
            >
              Send Magic Link
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="#" variant="body2" onClick={(e) => {
                  e.preventDefault();
                  setMessage({ type: 'info', text: 'Please contact us to start your wedding planning journey.' });
                }}>
                  Wedding Planning Partnership
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </AuroraBackground>
  );
};

export default Login;
