import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  useTheme
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabaseClient';

// Extend the theme type to include our custom properties
declare module '@mui/material/styles' {
  interface Palette {
    accent: {
      blush: string;
      rose: string;
      blanc: string;
      roseDark: string;
      nude: string;
      pia: string;
    };
  }
  interface PaletteOptions {
    accent?: {
      blush?: string;
      rose?: string;
      blanc?: string;
      roseDark?: string;
      nude?: string;
      pia?: string;
    };
  }
}

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cartAnchorEl, setCartAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCartClick = (event: React.MouseEvent<HTMLElement>) => {
    setCartAnchorEl(event.currentTarget);
  };

  const handleCartClose = () => {
    setCartAnchorEl(null);
  };

  const handleLogout = async () => {
    const supabaseClient = getSupabase();
    await supabaseClient.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: theme.palette.accent?.blush,
          color: theme.palette.primary.main // Set text color to dark blue for contrast
        }}
      >
        <Toolbar>
          <Box
            component="div"
            sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              cursor: 'pointer',
              alignItems: 'center'
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src="/Altare Primary-Blanc.svg"
              alt="Altare Logo"
              sx={{ 
                height: '50px',
                mr: 1
              }}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 2, 
              cursor: 'pointer',
              color: theme.palette.primary.main,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => navigate('/pricing')}
          >
            Pricing
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate('/admin/add-vendor')}
            >
              <AdminPanelSettingsIcon />
            </IconButton>
            <IconButton
              size="large"
              aria-label="show cart items"
              aria-controls="cart-menu"
              aria-haspopup="true"
              onClick={handleCartClick}
              color="inherit"
            >
              <Badge badgeContent={2} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      <Menu
        id="cart-menu"
        anchorEl={cartAnchorEl}
        open={Boolean(cartAnchorEl)}
        onClose={handleCartClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleCartClose}>Cart Item 1</MenuItem>
        <MenuItem onClick={handleCartClose}>Cart Item 2</MenuItem>
      </Menu>
    </>
  );
}
