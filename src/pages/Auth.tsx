import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from '../components/Auth/AuthForm';
import { supabase } from '../lib/supabase';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/';

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Redirect to the page they tried to visit or home
        navigate(from, { replace: true });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Redirect to the page they tried to visit or home
        navigate(from, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, from]);

  return <AuthForm redirectPath={from} />;
};

export default Auth;
