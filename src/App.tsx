import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Budget } from './pages/Budget';
import { Timeline } from './pages/Timeline';
import { Vendors } from './pages/Vendors';
import { Guests } from './pages/Guests';
import { Checklist } from './pages/Checklist';
import { Events } from './pages/Events';
import { VisionBoard } from './pages/VisionBoard';
import { Seating } from './pages/Seating';
import { Dashboard } from './pages/Dashboard';
import Questionnaire from './components/Questionnaire';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from './lib/supabase';
import { Test } from './pages/Test';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/events" element={<Events />} />
        <Route path="/vision-board" element={<VisionBoard />} />
        <Route path="/seating" element={<Seating />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
