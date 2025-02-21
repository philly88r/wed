import { useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cartAnchorEl, setCartAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleLogout = () => {
    handleMenuClose();
    // Add logout logic here when authentication is implemented
    navigate('/login');
  };

  const handleGitHubClick = () => {
    window.open('https://github.com/philly88r/wed', '_blank');
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
        {/* Left side - GitHub icon */}
        <Box>
          <Tooltip title="View on GitHub" arrow>
            <IconButton
              size="large"
              onClick={handleGitHubClick}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': {
                  color: theme.palette.primary.main,
                }
              }}
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Right side - Cart and Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
