import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './components/Auth/AuthForm';
import { Budget } from './pages/Budget';
import { Timeline } from './pages/Timeline';
import { Vendors } from './pages/Vendors';
import { Guests } from './pages/Guests';
import { Checklist } from './pages/Checklist';
import { Events } from './pages/Events';
import { VisionBoard } from './pages/VisionBoard';
import { Seating } from './pages/Seating';
import { Dashboard } from './pages/Dashboard';
import { Test } from './pages/Test';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/budget" element={<Layout><Budget /></Layout>} />
        <Route path="/timeline" element={<Layout><Timeline /></Layout>} />
        <Route path="/vendors" element={<Layout><Vendors /></Layout>} />
        <Route path="/guests" element={<Layout><Guests /></Layout>} />
        <Route path="/checklist" element={<Layout><Checklist /></Layout>} />
        <Route path="/events" element={<Layout><Events /></Layout>} />
        <Route path="/vision-board" element={<Layout><VisionBoard /></Layout>} />
        <Route path="/seating" element={<Layout><Seating /></Layout>} />
        <Route path="/test" element={<Layout><Test /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
