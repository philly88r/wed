import { Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Guests from './pages/Guests';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import Seating from './pages/Seating';
import Videos from './pages/Videos';
import VisionBoard from './pages/VisionBoard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/guests" element={<Guests />} />
      <Route path="/budget" element={<Budget />} />
      <Route path="/checklist" element={<Checklist />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/vendors/:id" element={<VendorDetail />} />
      <Route path="/seating" element={<Seating />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/vision-board" element={<VisionBoard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
