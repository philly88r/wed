import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  
  const handleEnterSite = () => {
    // Just navigate to dashboard without auth
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Wedding Planner
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click below to enter the site
          </p>
        </div>

        <div>
          <button
            onClick={handleEnterSite}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Enter Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
