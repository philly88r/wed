import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { theme } from './theme';
import Navigation from './components/Navigation';
import AppRoutes from './routes';
import { drawerWidth } from './components/Navigation'; // Assuming drawerWidth is defined here

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
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
              <AppRoutes />
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
