import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme/theme';
// import ServiceMenu from './pages/ServiceMenu';
import Seating from './pages/Seating';
import Header from './components/Header';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import Vendors from './pages/Vendors';
import VendorProfile from './pages/VendorProfile';
import VendorLogin from './pages/VendorLogin';
import VendorLoginPage from './pages/VendorLoginPage';
import VendorRegister from './pages/VendorRegister';
import VendorForgotPassword from './pages/VendorForgotPassword';
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
import Services from './pages/Services';
import Videos from './pages/Videos';
import AddVendor from './pages/admin/add-vendor';
import VisionBoard from './pages/VisionBoard';

// Define app routes to check against
const APP_ROUTES = [
  '/seating-chart',
  '/budget',
  '/checklist',
  '/wedding-checklist',
  '/checklist-demo',
  '/vendors',
  '/timeline',
  '/timeline-creator',
  '/timeline-share',
  '/guests',
  '/directory',
  '/tutorials',
  '/coordination',
  '/services',
  '/vision-board',
  '/mood-board'
];

// Component to handle wedding name routes
function WeddingNameHandler() {
  const { weddingName: _ } = useParams();
  const location = useLocation();
  
  // If the path is one of our app routes, redirect to that route
  if (APP_ROUTES.includes(location.pathname)) {
    return <Navigate to={location.pathname} replace />;
  }
  
  // Otherwise, render the questionnaire
  // We're using the weddingName param in the GuestQuestionnaire component
  return <GuestQuestionnaire />;
}

function AppContent() {
  const location = useLocation();
  const isQuestionnairePage = !location.pathname.startsWith('/');
  const isLoginPage = location.pathname === '/login';
  const isServicesPage = location.pathname === '/services';
  
  return (
    <Box sx={{ minHeight: '100vh', pt: isQuestionnairePage || isLoginPage || isServicesPage ? 0 : 8 }}>
      {!isQuestionnairePage && !isLoginPage && <Header />}
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin routes */}
        <Route path="/admin/add-vendor" element={<AddVendor />} />
        
        {/* Vendor routes */}
        <Route path="/vendor/login/:accessToken" element={<VendorLogin />} />
        <Route path="/vendor/login" element={<VendorLoginPage />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
        <Route path="/my-profile" element={<ProtectedVendorRoute><Navigate to={`/vendor/profile/edit/${sessionStorage.getItem('vendorId')}`} replace /></ProtectedVendorRoute>} />
        <Route 
          path="/vendor/profile/edit/:vendorId" 
          element={
            <ProtectedVendorRoute>
              <VendorProfileEdit />
            </ProtectedVendorRoute>
          } 
        />
        
        {/* App routes - EXACT paths first */}
        <Route path="/" element={<Services />} />
        <Route path="/seating-chart" element={<Seating />} />
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
        <Route path="/tutorials" element={<Videos />} />
        <Route path="/coordination" element={<ComingSoon />} />
        <Route path="/services" element={<Services />} />
        <Route path="/vision-board" element={<VisionBoard />} />
        <Route path="/mood-board" element={<VisionBoard />} />
        
        {/* Wedding name route - use a separate component to handle the logic */}
        <Route path="/:weddingName" element={<WeddingNameHandler />} />
        
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
