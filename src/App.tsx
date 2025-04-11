import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme/theme';
import './fonts.css'; // Import the custom fonts CSS
import ServiceMenuWithTheme from './pages/ServiceMenuWithTheme';
import SeatingChart from './pages/SeatingChart';
import VenueLayoutSelector from './pages/VenueLayoutSelector';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import WeddingChecklist from './pages/WeddingChecklist';
import ChecklistDemo from './pages/ChecklistDemo';
import Vendors from './pages/Vendors';
import VendorProfile from './pages/VendorProfile';
import TimelineCreator from './pages/TimelineCreator';
import Guests from './pages/Guests';
import GuestDirectory from './pages/GuestDirectory';
import Videos from './pages/Videos';
import ComingSoon from './pages/ComingSoon';
import Services from './pages/Services';
import VendorLogin from './pages/VendorLogin';
import VendorLoginPage from './pages/VendorLoginPage';
import VendorRegister from './pages/VendorRegister';
import VendorForgotPassword from './pages/VendorForgotPassword';
import VendorProfileEdit from './pages/VendorProfileEdit';
import ProtectedVendorRoute from './components/ProtectedVendorRoute';
import AddVendor from './pages/admin/add-vendor';
import VisionBoard from './pages/VisionBoard';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PricingProtectedRoute from './components/Auth/PricingProtectedRoute';

// Define app routes to check against
const appRoutes = [
  '/service-menu',
  '/venue-layout',
  '/seating-chart',
  '/budget',
  '/checklist',
  '/wedding-checklist',
  '/vendors',
  '/timeline',
  '/timeline-creator',
  '/guests',
  '/directory',
  '/tutorials',
  '/coordination',
  '/services',
  '/vision-board',
  '/mood-board',
  '/pricing',
];

// Component to handle wedding name routes
const WeddingNameHandler = () => {
  const { weddingName } = useParams();
  
  // If the wedding name is actually an app route, redirect to that route
  if (weddingName && appRoutes.includes(`/${weddingName}`)) {
    return <Navigate to={`/${weddingName}`} replace />;
  }
  
  // Otherwise, render the wedding page with the name
  return <div>Wedding: {weddingName}</div>;
};

// Main app content with routes
const AppContent = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route path="/login" element={<Auth />} />
        
        {/* Admin routes */}
        <Route path="/admin/add-vendor" element={
          <ProtectedRoute>
            <AddVendor />
          </ProtectedRoute>
        } />
        
        {/* Vendor routes */}
        <Route path="/vendor/login/:accessToken" element={<VendorLogin />} />
        <Route path="/vendor/login" element={<VendorLoginPage />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
        <Route path="/my-profile" element={
          <ProtectedVendorRoute>
            <Navigate to={`/vendor/profile/edit/${sessionStorage.getItem('vendorId')}`} replace />
          </ProtectedVendorRoute>
        } />
        <Route 
          path="/vendor/profile/edit/:vendorId" 
          element={
            <ProtectedVendorRoute>
              <VendorProfileEdit />
            </ProtectedVendorRoute>
          } 
        />
        
        {/* Protected app routes - require authentication */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/service-menu" element={
          <ProtectedRoute>
            <ServiceMenuWithTheme />
          </ProtectedRoute>
        } />
        <Route path="/venue-layout" element={
          <ProtectedRoute>
            <VenueLayoutSelector />
          </ProtectedRoute>
        } />
        <Route path="/seating-chart" element={
          <ProtectedRoute>
            <SeatingChart />
          </ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        } />
        <Route path="/checklist" element={
          <ProtectedRoute>
            <ChecklistDemo />
          </ProtectedRoute>
        } />
        <Route path="/checklist-old" element={
          <ProtectedRoute>
            <Checklist />
          </ProtectedRoute>
        } />
        <Route path="/wedding-checklist" element={
          <ProtectedRoute>
            <WeddingChecklist />
          </ProtectedRoute>
        } />
        <Route path="/vendors" element={
          <ProtectedRoute>
            <Vendors />
          </ProtectedRoute>
        } />
        <Route path="/vendors/:slug" element={
          <ProtectedRoute>
            <VendorProfile />
          </ProtectedRoute>
        } />
        <Route path="/timeline" element={
          <ProtectedRoute>
            <TimelineCreator />
          </ProtectedRoute>
        } />
        <Route path="/timeline-creator" element={
          <ProtectedRoute>
            <TimelineCreator />
          </ProtectedRoute>
        } />
        <Route path="/timeline-share" element={
          <ProtectedRoute>
            <TimelineCreator />
          </ProtectedRoute>
        } />
        <Route path="/guests" element={
          <ProtectedRoute>
            <Guests />
          </ProtectedRoute>
        } />
        <Route path="/directory" element={
          <ProtectedRoute>
            <GuestDirectory />
          </ProtectedRoute>
        } />
        <Route path="/tutorials" element={
          <ProtectedRoute>
            <Videos />
          </ProtectedRoute>
        } />
        <Route path="/coordination" element={
          <ProtectedRoute>
            <ComingSoon />
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        } />
        <Route path="/vision-board" element={
          <ProtectedRoute>
            <VisionBoard />
          </ProtectedRoute>
        } />
        <Route path="/mood-board" element={
          <ProtectedRoute>
            <VisionBoard />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <PricingProtectedRoute>
            <Pricing />
          </PricingProtectedRoute>
        } />
        
        {/* Wedding name route - use a separate component to handle the logic */}
        <Route path="/:weddingName" element={
          <ProtectedRoute>
            <WeddingNameHandler />
          </ProtectedRoute>
        } />
        
        {/* Catch-all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
};

// Main App component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
