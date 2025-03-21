import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { supabase } from '../lib/supabase';
import AuroraBackground from '../components/ui/AuroraBackground';
import '../components/ui/aurora-background.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        setMessage({ 
          type: 'success', 
          text: 'Registration successful! Please check your email to verify your account.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
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
                mb: 4
              }}
            />
            
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
                mb: 3
              }}
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Typography>

            {message && (
              <Alert 
                severity={message.type} 
                sx={{ width: '100%', mb: 3 }}
              >
                {message.text}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: theme.palette.accent.rose,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.accent.roseDark,
                  },
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: theme.palette.primary.main }} />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Sign Up'
                )}
              </Button>
              
              <Typography 
                variant="body2" 
                align="center"
                sx={{ 
                  color: theme.palette.primary.main,
                  opacity: 0.8,
                  cursor: 'pointer'
                }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? (
                  "Don't have an account? Sign up"
                ) : (
                  "Already have an account? Sign in"
                )}
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
