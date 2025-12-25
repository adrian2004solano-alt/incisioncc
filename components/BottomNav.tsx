
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-50">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <i className="fas fa-home text-xl"></i>
        <span className="text-[10px] font-medium">Inicio</span>
      </button>
      <button 
        onClick={() => setActiveTab('vip')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'vip' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <i className="fas fa-crown text-xl"></i>
        <span className="text-[10px] font-medium">VIP</span>
      </button>
      <button 
        onClick={() => setActiveTab('referral')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'referral' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <i className="fas fa-users text-xl"></i>
        <span className="text-[10px] font-medium">Equipo</span>
      </button>
      <button 
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <i className="fas fa-user text-xl"></i>
        <span className="text-[10px] font-medium">Perfil</span>
      </button>
      {isAdmin && (
        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-red-600' : 'text-gray-400'}`}
        >
          <i className="fas fa-shield-alt text-xl"></i>
          <span className="text-[10px] font-medium">Panel</span>
        </button>
      )}
    </div>
  );
};

export default BottomNav;
