import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-emerald-600 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-white font-bold text-xl">
            Wedding Planner
          </Link>
          <div className="space-x-4">
            <Link to="/dashboard" className="text-white hover:text-emerald-100">Dashboard</Link>
            <Link to="/guests" className="text-white hover:text-emerald-100">Guests</Link>
            <Link to="/seating" className="text-white hover:text-emerald-100">Seating Chart</Link>
            <Link to="/budget" className="text-white hover:text-emerald-100">Budget</Link>
            <Link to="/timeline" className="text-white hover:text-emerald-100">Timeline</Link>
            <Link to="/vendors" className="text-white hover:text-emerald-100">Vendors</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
