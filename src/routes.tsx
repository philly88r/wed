import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import Guests from './pages/Guests';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import TableLayout from './pages/TableLayout';
import SeatingChart from './pages/SeatingChart';
import Videos from './pages/Videos';
import VisionBoard from './pages/VisionBoard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Tasks from './pages/Tasks';
import Photos from './pages/Photos';
import Music from './pages/Music';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/guests" element={<Guests />} />
      <Route path="/budget" element={<Budget />} />
      <Route path="/checklist" element={<Checklist />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/vendors/:id" element={<VendorDetail />} />
      <Route path="/table-layout" element={<TableLayout />} />
      <Route path="/seating-chart" element={<SeatingChart />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/vision-board" element={<VisionBoard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/photos" element={<Photos />} />
      <Route path="/music" element={<Music />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
