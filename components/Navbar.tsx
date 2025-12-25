
import React from 'react';
import { APP_NAME } from '../constants';

interface NavbarProps {
  onLogout: () => void;
  isAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, isAdmin }) => {
  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <i className="fas fa-chart-line text-white"></i>
        </div>
        <span className="font-bold text-xl tracking-tight text-blue-600">{APP_NAME}</span>
        {isAdmin && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold ml-2">ADMIN</span>}
      </div>
      <button 
        onClick={onLogout}
        className="text-gray-500 hover:text-red-600 transition-colors"
      >
        <i className="fas fa-sign-out-alt text-xl"></i>
      </button>
    </nav>
  );
};

export default Navbar;
