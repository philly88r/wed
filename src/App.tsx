import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import ServiceMenu from './pages/ServiceMenu';
import SeatingChart from './pages/SeatingChart';
import Header from './components/Header';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import Vendors from './pages/Vendors';
import Timeline from './pages/Timeline';
import Guests from './pages/Guests';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', pt: 8 }}>
          <Header />
          <Routes>
            <Route path="/" element={<ServiceMenu />} />
            <Route path="/seating-chart" element={<SeatingChart />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/tutorials" element={<ComingSoon />} />
            <Route path="/coordination" element={<ComingSoon />} />
            {/* Add other routes as they are implemented */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
