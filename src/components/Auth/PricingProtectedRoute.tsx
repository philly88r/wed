import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSupabase } from '../../supabaseClient';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './ProtectedRoute';

interface PricingProtectedRouteProps {
  children: React.ReactNode;
}

const PricingProtectedRoute: React.FC<PricingProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(false);

  useEffect(() => {
    const checkUserPlan = async () => {
      try {
        const supabaseClient = getSupabase();
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
          // Get user profile from the profiles table
          const { data, error: profileError } = await supabaseClient
            .from('profiles')
            .select('selected_plan')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setHasSelectedPlan(false);
          } else if (data && data.selected_plan) {
            // User has already selected a plan
            setHasSelectedPlan(true);
          } else {
            setHasSelectedPlan(false);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setHasSelectedPlan(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserPlan();
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#F9F9FF'
        }}
      >
        <CircularProgress sx={{ color: '#054697' }} />
      </Box>
    );
  }

  // If user has already selected a plan, redirect to dashboard
  if (hasSelectedPlan) {
    return <Navigate to="/" state={{ message: "You already have an active plan." }} replace />;
  }

  // Otherwise, render the protected route with the pricing page
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default PricingProtectedRoute;
