import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Layout from './components/Layout';
import ServiceMenu from './pages/ServiceMenu';
import SeatingChart from './pages/SeatingChart';
import AppRoutes from './routes';
import Navigation from './components/Navigation';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ServiceMenu />} />
              <Route path="/seating-chart" element={<SeatingChart />} />
              {/* Add other routes as they are implemented */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
