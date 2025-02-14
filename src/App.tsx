import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { Auth } from './pages/Auth';
import Questionnaire from './components/Questionnaire';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from './lib/supabase';
import { Test } from './pages/Test';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
    if (profile) {
      setProfile({
        ...profile,
        ...answers,
        onboarding_completed: true
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/*"
          element={
            user ? (
              profile && !profile.onboarding_completed ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="w-full max-w-2xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Welcome to Your Wedding Planner</h1>
                    <Questionnaire onComplete={handleQuestionnaireComplete} />
                  </div>
                </div>
              ) : (
                <div className="min-h-screen bg-gray-50">
                  <Sidebar />
                  <div className="lg:pl-72">
                    <main className="py-10">
                      <div className="px-4 sm:px-6 lg:px-8">
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
                      </div>
                    </main>
                  </div>
                </div>
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
