import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import ServiceMenu from './pages/ServiceMenu';
import SeatingChart from './pages/SeatingChart';
import Header from './components/Header';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import Vendors from './pages/Vendors';
import VendorProfile from './pages/VendorProfile';
import VendorLogin from './pages/VendorLogin';
import VendorProfileEdit from './pages/VendorProfileEdit';
import ProtectedVendorRoute from './components/ProtectedVendorRoute';
import Timeline from './pages/Timeline';
import TimelineCreator from './pages/TimelineCreator';
import Guests from './pages/Guests';
import GuestQuestionnaire from './pages/GuestQuestionnaire';
import ComingSoon from './pages/ComingSoon';
import GuestDirectory from './pages/GuestDirectory';
import Login from './pages/Login';
import ChecklistDemo from './pages/ChecklistDemo';
import WeddingChecklist from './pages/WeddingChecklist';

function AppContent() {
  const location = useLocation();
  const isQuestionnairePage = !location.pathname.startsWith('/');
  const isLoginPage = location.pathname === '/login';
  
  return (
    <Box sx={{ minHeight: '100vh', pt: isQuestionnairePage || isLoginPage ? 0 : 8 }}>
      {!isQuestionnairePage && !isLoginPage && <Header />}
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Vendor routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route 
          path="/vendor/profile/edit/:vendorId" 
          element={
            <ProtectedVendorRoute>
              <VendorProfileEdit />
            </ProtectedVendorRoute>
          } 
        />
        
        {/* Put the questionnaire route first to ensure it takes precedence */}
        <Route path="/:weddingName" element={<GuestQuestionnaire />} />
        
        {/* App routes */}
        <Route path="/" element={<ServiceMenu />} />
        <Route path="/seating" element={<SeatingChart />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/wedding-checklist" element={<WeddingChecklist />} />
        <Route path="/checklist-demo" element={<ChecklistDemo />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:slug" element={<VendorProfile />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/timeline-creator" element={<TimelineCreator />} />
        <Route path="/timeline-share" element={<TimelineCreator />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/directory" element={<GuestDirectory />} />
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
