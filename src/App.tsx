import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container, Toolbar } from '@mui/material';
import { theme } from './theme';
import Navigation from './components/Navigation';
import AppRoutes from './routes';
import { drawerWidth } from './components/Navigation';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
              <AppRoutes />
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
