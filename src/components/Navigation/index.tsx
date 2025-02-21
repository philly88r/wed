import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  AttachMoney as BudgetIcon,
  Assignment as ChecklistIcon,
  Store as VendorsIcon,
  EventSeat as SeatingIcon,
  VideoLibrary as VideosIcon,
  Collections as VisionBoardIcon,
  LocalOffer as PricingIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Timeline', icon: <EventIcon />, path: '/timeline' },
  { text: 'Guests', icon: <PeopleIcon />, path: '/guests' },
  { text: 'Budget', icon: <BudgetIcon />, path: '/budget' },
  { text: 'Checklist', icon: <ChecklistIcon />, path: '/checklist' },
  { text: 'Vendors', icon: <VendorsIcon />, path: '/vendors' },
  { text: 'Seating', icon: <SeatingIcon />, path: '/seating' },
  { text: 'Videos', icon: <VideosIcon />, path: '/videos' },
  { text: 'Vision Board', icon: <VisionBoardIcon />, path: '/vision-board' },
  { text: 'Pricing', icon: <PricingIcon />, path: '/pricing' },
];

export default function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>W</Avatar>
        <Typography variant="h6" noWrap>
          Wedding Planner
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="inherit" 
        elevation={0}
        sx={{ 
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>W</Avatar>
            <Typography variant="h6" noWrap component="div">
              Wedding Planner
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={handleProfileMenuOpen}
            size="large"
            edge="end"
            aria-label="account menu"
            aria-haspopup="true"
          >
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              border: 'none',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>
    </>
  );
}
