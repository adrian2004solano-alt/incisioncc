
import React, { useState, useMemo } from 'react';
import { User, VIPLevel } from '../types';
import { VIP_LEVELS, CUSTOMER_SERVICE_PHONE } from '../constants';
import { mockStore } from '../services/mockStore';

interface DashboardProps {
  user: User;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onRefresh }) => {
  const [mining, setMining] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Calcular qué VIPs son elegibles para cobrar hoy
  const eligibleVips = useMemo(() => {
    const activeVips = VIP_LEVELS.filter(v => user.vipLevels.includes(v.id));
    if (activeVips.length === 0) return [];

    const isNewDay = user.lastClaimDate !== today;
    const claimedToday = isNewDay ? [] : (user.vipsClaimedToday || []);
    const highestVip = activeVips[activeVips.length - 1];

    // Lógica: 
    // 1. El VIP más alto siempre es elegible si no se ha cobrado.
    // 2. Otros VIPs solo si se compraron HOY y no se han cobrado.
    return activeVips.filter(vip => {
      const alreadyClaimed = claimedToday.includes(vip.id);
      if (alreadyClaimed) return false;

      const isHighest = vip.id === highestVip.id;
      const boughtToday = user.vipPurchaseDates?.[vip.id] === today;

      return isHighest || boughtToday;
    });
  }, [user, today]);

  const totalProfitToClaim = eligibleVips.reduce((acc, curr) => acc + (curr.price * 0.12), 0);
  const hasPendingTasks = eligibleVips.length > 0;

  const handleTask = async () => {
    if (user.vipLevels.length === 0) {
      alert('Tu saldo actual es insuficiente para activar el sistema VIP (Mínimo $10 USDT para VIP 1).');
      onNavigate('recharge');
      return;
    }

    if (!hasPendingTasks) {
      alert('Ya has recolectado todas tus ganancias disponibles por hoy. Vuelve mañana.');
      return;
    }

    setMining(true);
    setTimeout(async () => {
      const vipIds = eligibleVips.map(v => v.id);
      await mockStore.completeTask(user.id, totalProfitToClaim, vipIds);
      await onRefresh();
      setMining(false);
      alert(`¡Éxito! Has recolectado $${totalProfitToClaim.toFixed(2)} USDT.`);
    }, 1500);
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Servidor Cloud: Activo</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-full">
           <i className="fas fa-shield-halved text-blue-600 text-[8px]"></i>
           <span className="text-[9px] font-black text-blue-600 uppercase">Seguro</span>
        </div>
      </div>

      <div className="bg-gradient-primary rounded-[35px] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <i className="fas fa-microchip text-7xl"></i>
        </div>
        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80">Balance en la Nube</p>
        <h2 className="text-4xl font-black mt-2 tracking-tighter">${user.balance.toFixed(2)} <span className="text-sm font-medium opacity-60">USDT</span></h2>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button onClick={() => onNavigate('recharge')} className="bg-white text-blue-600 py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">
            <i className="fas fa-wallet mr-2"></i> Recargar
          </button>
          <button onClick={() => onNavigate('withdraw')} className="bg-blue-500 text-white py-4 rounded-2xl font-black text-xs border border-white/20 uppercase active:scale-95 transition-all">
            <i className="fas fa-external-link-alt mr-2"></i> Retirar
          </button>
        </div>
      </div>

      {/* Botón de Ruleta */}
      <button 
        onClick={() => onNavigate('wheel')}
        className="w-full bg-white border-2 border-dashed border-blue-200 rounded-[30px] p-5 flex items-center justify-between group active:scale-95 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
             <i className="fas fa-spinner text-xl"></i>
          </div>
          <div className="text-left">
            <h4 className="font-black text-slate-800 uppercase italic text-sm tracking-tight leading-none">Ruleta Premiada</h4>
            <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">¡Giro gratis disponible!</p>
          </div>
        </div>
        <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
      </button>

      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm text-center relative">
        <div className="inline-block bg-orange-50 text-orange-600 text-[8px] font-black px-3 py-1 rounded-full uppercase mb-4 tracking-widest border border-orange-100">
          Estado: {hasPendingTasks ? 'Tareas Pendientes' : 'Completado hoy'}
        </div>
        <h3 className="font-black text-gray-800 text-lg uppercase italic tracking-tighter">Procesamiento de Datos</h3>
        
        <div className="mt-4 space-y-3">
          {eligibleVips.length > 0 ? (
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
               <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Niveles a Procesar:</p>
               <div className="flex flex-wrap justify-center gap-2">
                 {eligibleVips.map(v => (
                   <span key={v.id} className="text-[9px] font-black bg-white text-blue-700 px-3 py-1 rounded-lg border border-blue-200 shadow-sm">
                     {v.name} (+${(v.price * 0.12).toFixed(2)})
                   </span>
                 ))}
               </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 font-bold uppercase">No hay tareas de procesamiento disponibles</p>
          )}
          
          <div className="pt-2">
            <span className="text-4xl font-black text-green-500">${totalProfitToClaim.toFixed(2)}</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">USDT Disponibles para Recolectar</p>
          </div>
        </div>
        
        <button 
          onClick={handleTask}
          disabled={mining || !hasPendingTasks}
          className={`w-full mt-6 py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${
            mining ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : !hasPendingTasks ? 'bg-gray-50 text-gray-300' : 'bg-gradient-success text-white shadow-green-100'
          }`}
        >
          {mining ? (
            <><i className="fas fa-sync fa-spin"></i> Procesando...</>
          ) : !hasPendingTasks && user.vipLevels.length > 0 ? (
            <><i className="fas fa-check-double"></i> Todo Recolectado</>
          ) : (
            <><i className="fas fa-bolt"></i> Iniciar Recolección</>
          )}
        </button>
        
        <p className="text-[9px] text-gray-400 font-black uppercase mt-4 opacity-60">
          *Solo se procesa el VIP más alto (excepto compras del mismo día)
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { id: 'vip', icon: 'fa-gem', label: 'VIP', color: 'text-blue-500', bg: 'bg-blue-50' },
          { id: 'referral', icon: 'fa-users-viewfinder', label: 'Equipo', color: 'text-green-500', bg: 'bg-green-50' },
          { id: 'support', icon: 'fa-headset', label: 'Ayuda', color: 'text-orange-500', bg: 'bg-orange-50' },
          { id: 'profile', icon: 'fa-id-card', label: 'Perfil', color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => item.id === 'support' ? window.open(`https://wa.me/${CUSTOMER_SERVICE_PHONE}`, '_blank') : onNavigate(item.id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`${item.bg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-transparent group-active:border-gray-200 transition-all`}>
              <i className={`fas ${item.icon} ${item.color} text-xl`}></i>
            </div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
