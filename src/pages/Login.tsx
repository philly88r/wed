import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress, 
  Grid,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
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

  const handleAccountOption = (option: 'vendor' | 'couple') => {
    setMessage({ 
      type: 'info', 
      text: option === 'vendor' 
        ? 'Please contact us to join our wedding planning vendor network.' 
        : 'Please contact us to start your wedding planning journey.'
    });
  };

  return (
    <AuroraBackground>
      <Container maxWidth="sm" sx={{ 
        position: 'relative', 
        zIndex: 10,
        py: 3,
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            width: '100%'
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
              textAlign: 'center',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
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
                mb: 3,
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
            
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 2,
                fontWeight: 'medium'
              }}
            >
              Don't have an account?
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleAccountOption('vendor')}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center',
                      p: { xs: 2, sm: 3 }
                    }}>
                      <Typography 
                        variant="h6" 
                        color="primary"
                        sx={{ 
                          fontWeight: 'bold',
                          mb: 1,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Wedding Planning Vendor
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Join our network of trusted wedding professionals
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleAccountOption('couple')}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ 
                      textAlign: 'center',
                      p: { xs: 2, sm: 3 }
                    }}>
                      <Typography 
                        variant="h6" 
                        color="primary"
                        sx={{ 
                          fontWeight: 'bold',
                          mb: 1,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Getting Married
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start planning your perfect wedding day
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </AuroraBackground>
  );
};

export default Login;
