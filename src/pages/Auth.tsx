import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '../components/Auth/AuthForm';
import { getSupabase } from '../supabaseClient';
import { Box, CircularProgress } from '@mui/material';

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
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has a subscription
  const checkSubscription = async (userId: string) => {
    try {
      const supabaseClient = getSupabase();
      
      // First, check if the user profile exists and has completed onboarding
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // If profile doesn't exist or onboarding not completed, redirect to pricing
      if (!profileData || !profileData.onboarding_completed) {
        return false;
      }
      
      // Check if user has an active subscription
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which is expected if no subscription
        throw subscriptionError;
      }
      
      return !!subscriptionData;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  };

  useEffect(() => {
    const supabaseClient = getSupabase();
    
    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      const { data } = await supabaseClient.auth.getSession();
      const session = data.session;
      
      if (session) {
        // Check if user has a subscription
        const hasSubscription = await checkSubscription(session.user.id);
        
        if (hasSubscription) {
          // If user has a subscription, redirect to dashboard or the page they tried to visit
          navigate(from, { replace: true });
        } else {
          // If user doesn't have a subscription, redirect to pricing page
          navigate('/pricing', { replace: true });
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthStatus();

    // Listen for auth changes
    const { data } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Check if user has a subscription
        const hasSubscription = await checkSubscription(session.user.id);
        
        if (hasSubscription) {
          // If user has a subscription, redirect to dashboard or the page they tried to visit
          navigate(from, { replace: true });
        } else {
          // If user doesn't have a subscription, redirect to pricing page
          navigate('/pricing', { replace: true });
        }
      }
    });

    return () => data.subscription.unsubscribe();
  }, [navigate, from]);

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: 'white'
        }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return <AuthForm />;
};

export default Auth;
