import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export type View = 'reception' | 'phlebotomy' | 'lab' | 'approver' | 'admin';

interface NavbarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  allowedViews: View[];
}

const NavButton: React.FC<{
  label: string;
  viewName: View;
  currentView: View;
  onClick: (view: View) => void;
}> = ({ label, viewName, currentView, onClick }) => {
  const isActive = currentView === viewName;
  return (
    <button
      onClick={() => onClick(viewName)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-green-600 text-white'
          : 'text-gray-600 hover:bg-green-50 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
};


export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, allowedViews }) => {
  const { logout } = useAuth();
  
  const viewLabels: Record<View, string> = {
      reception: 'Reception',
      phlebotomy: 'Phlebotomy',
      lab: 'Lab',
      approver: 'Approver',
      admin: 'Admin'
  };

  return (
    <nav className="flex items-center space-x-2">
      {allowedViews.map(view => (
          <NavButton
            key={view}
            label={viewLabels[view]}
            viewName={view}
            currentView={currentView}
            onClick={setCurrentView}
          />
      ))}
      <button 
        onClick={logout}
        className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Logout
      </button>
    </nav>
  );
};
