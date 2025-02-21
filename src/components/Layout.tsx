import { Box, Container, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { drawerWidth } from './Navigation';

export default function Layout() {
  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          ml: { sm: `${drawerWidth}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* This creates space for the AppBar */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
