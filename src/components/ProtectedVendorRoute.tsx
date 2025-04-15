import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface ProtectedVendorRouteProps {
  children: React.ReactNode;
}

export default function ProtectedVendorRoute({ children }: ProtectedVendorRouteProps) {
  const { vendorId } = useParams<{ vendorId: string }>();
  const storedVendorId = sessionStorage.getItem('vendorId');

  if (!storedVendorId || storedVendorId !== vendorId) {
    return <Navigate to="/vendor/login" replace />;
  }

  return <>{children}</>;
}
