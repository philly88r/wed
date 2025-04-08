import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile from the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('selected_plan')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setHasSelectedPlan(false);
          } else if (profileData && profileData.selected_plan) {
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
