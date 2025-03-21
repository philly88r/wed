import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  useTheme,
  Typography,
  Button,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cartAnchorEl, setCartAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user on component mount
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCartMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCartAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCartAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'transparent',
        boxShadow: 'none',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box 
          component="img"
          src="/Altare Primary-Blanc.svg"
          alt="Altare Logo"
          sx={{ 
            height: '60px',
            cursor: 'pointer',
            mr: 2
          }}
          onClick={() => navigate('/')}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button
            onClick={() => navigate('/services')}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.accent.rose,
              },
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Services
          </Button>
          
          {user ? (
            <>
              <IconButton
                size="large"
                aria-label="show cart items"
                color="inherit"
                onClick={handleCartMenuOpen}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <Badge badgeContent={0} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
            </>
          ) : (
            <Button 
              variant="outlined" 
              onClick={handleLogin}
              sx={{
                borderRadius: '20px',
                px: 3,
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              Login
            </Button>
          )}
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              minWidth: 200,
            }
          }}
        >
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <Typography variant="body1" sx={{ fontFamily: "'Lato', sans-serif" }}>Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <Typography variant="body1" sx={{ fontFamily: "'Lato', sans-serif" }}>My Account</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <Typography variant="body1" sx={{ fontFamily: "'Lato', sans-serif" }}>Logout</Typography>
          </MenuItem>
        </Menu>

        {/* Cart Menu */}
        <Menu
          anchorEl={cartAnchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(cartAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              minWidth: 300,
              p: 2,
            }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              fontFamily: "'Playfair Display', serif",
              textAlign: 'center',
            }}
          >
            Shopping Cart
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center',
              color: theme.palette.text.secondary,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Your cart is empty
          </Typography>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
