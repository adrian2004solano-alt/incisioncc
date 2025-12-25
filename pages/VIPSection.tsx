
import React from 'react';
import { User } from '../types';
import { VIP_LEVELS } from '../constants';

interface VIPSectionProps {
  user: User;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
}

const VIPSection: React.FC<VIPSectionProps> = ({ user }) => {
  const activeVips = user.vipLevels || [];
  const highestActiveId = activeVips.length > 0 ? Math.max(...activeVips) : 0;

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="text-center pt-4">
        <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic">Módulos VIP</h2>
        <div className="mt-4 bg-white border border-blue-100 inline-block px-6 py-2 rounded-full shadow-sm">
           <span className="text-blue-600 font-black text-xs">RECURSOS: ${user.balance.toFixed(2)} USDT</span>
        </div>
        <div className="mt-4 bg-orange-50 text-orange-700 px-6 py-3 rounded-2xl border border-orange-100 text-[10px] font-black uppercase leading-tight mx-4">
           Nota: Solo el módulo de mayor nivel genera ganancias diarias (Excepción: compras del mismo día).
        </div>
      </div>

      <div className="grid gap-4">
        {VIP_LEVELS.map((vip) => {
          const isActive = activeVips.includes(vip.id);
          const isHighest = vip.id === highestActiveId;
          const progress = Math.min(100, (user.balance / vip.price) * 100);
          
          return (
            <div key={vip.id} className={`bg-white rounded-[30px] p-6 border-2 transition-all relative overflow-hidden ${isActive ? 'border-blue-500 shadow-xl scale-[1.02]' : 'border-slate-100 opacity-90'}`}>
              {isActive && (
                <div className={`absolute top-0 right-0 text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest ${isHighest ? 'bg-blue-600' : 'bg-slate-400'}`}>
                  {isHighest ? 'Módulo Principal' : 'Módulo Secundario'}
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    <i className={`fas ${vip.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase italic leading-none">{vip.name}</h4>
                    <p className="text-green-500 text-[10px] font-black mt-1">12% GANANCIA DIARIA</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">${vip.price}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">USDT</p>
                </div>
              </div>

              {!isActive && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Sincronización</span>
                    <span className="text-[9px] font-black text-blue-600 uppercase">{progress.toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {isActive && (
                <div className={`rounded-xl p-3 flex items-center justify-center gap-2 border ${isHighest ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                  <i className={`fas ${isHighest ? 'fa-check-circle' : 'fa-lock'} text-xs`}></i>
                  <span className="text-[10px] font-black uppercase">
                    {isHighest ? `Generando $${(vip.price * 0.12).toFixed(2)} USDT / Día` : 'Inactivo (Nivel superior en uso)'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VIPSection;
