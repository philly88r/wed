import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import GuestQuestionnaire from './pages/GuestQuestionnaire';
import ComingSoon from './pages/ComingSoon';

function AppContent() {
  const location = useLocation();
  const isQuestionnairePage = !location.pathname.startsWith('/');
  
  return (
    <Box sx={{ minHeight: '100vh', pt: isQuestionnairePage ? 0 : 8 }}>
      {!isQuestionnairePage && <Header />}
      <Routes>
        {/* Put the questionnaire route first to ensure it takes precedence */}
        <Route path="/:weddingName" element={<GuestQuestionnaire />} />
        
        {/* App routes */}
        <Route path="/" element={<ServiceMenu />} />
        <Route path="/seating-chart" element={<SeatingChart />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/tutorials" element={<ComingSoon />} />
        <Route path="/coordination" element={<ComingSoon />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
