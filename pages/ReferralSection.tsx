
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { REFERRAL_BONUSES } from '../constants';
import { mockStore } from '../services/mockStore';

interface ReferralSectionProps {
  user: User;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
  const [level1, setLevel1] = useState<User[]>([]);
  const [level2, setLevel2] = useState<User[]>([]);
  const [level3, setLevel3] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReferralData = async () => {
      setLoading(true);
      const allUsers = await mockStore.getUsers();
      
      const l1 = allUsers.filter(u => u.referredBy === user.referralCode);
      const l2 = allUsers.filter(u => l1.some(ref => u.referredBy === ref.referralCode));
      const l3 = allUsers.filter(u => l2.some(ref => u.referredBy === ref.referralCode));
      
      setLevel1(l1);
      setLevel2(l2);
      setLevel3(l3);
      setLoading(false);
    };

    loadReferralData();
  }, [user.referralCode]);

  const referralLink = `${window.location.origin}/#register?ref=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('¡Enlace de referido copiado y listo para compartir!');
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="bg-gradient-primary rounded-3xl p-6 text-white text-center shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter">Programa de Referidos</h3>
        <p className="text-blue-100 text-[10px] mt-2 font-bold uppercase tracking-widest opacity-80">Gana comisiones en la nube</p>
        
        <div className="mt-6 flex items-center justify-between bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider font-black opacity-60">Tu Código Cloud</p>
            <p className="text-xl font-mono font-black">{user.referralCode}</p>
          </div>
          <button onClick={copyLink} className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Copiar Link</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400 font-black uppercase">Nivel 1</p>
              <p className="text-2xl font-black text-blue-600">{level1.length}</p>
              <p className="text-[9px] text-green-500 font-black bg-green-50 rounded-full py-0.5 mt-1">12%</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400 font-black uppercase">Nivel 2</p>
              <p className="text-2xl font-black text-blue-600">{level2.length}</p>
              <p className="text-[9px] text-blue-500 font-black bg-blue-50 rounded-full py-0.5 mt-1">5%</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400 font-black uppercase">Nivel 3</p>
              <p className="text-2xl font-black text-blue-600">{level3.length}</p>
              <p className="text-[9px] text-orange-500 font-black bg-orange-50 rounded-full py-0.5 mt-1">2%</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-800 mb-6 uppercase text-sm tracking-tighter italic">Estructura de Comisiones</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-100">L1</div>
                  <div>
                    <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Referidos Directos</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Amigos invitados por ti</p>
                  </div>
                </div>
                <span className="text-lg font-black text-blue-600">{(REFERRAL_BONUSES.LEVEL_1 * 100)}%</span>
              </div>
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-green-100">L2</div>
                  <div>
                    <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Nivel Indirecto 2</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Invitados de tus referidos</p>
                  </div>
                </div>
                <span className="text-lg font-black text-green-500">{(REFERRAL_BONUSES.LEVEL_2 * 100)}%</span>
              </div>
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-orange-100">L3</div>
                  <div>
                    <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Nivel Indirecto 3</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Tercera generación</p>
                  </div>
                </div>
                <span className="text-lg font-black text-orange-500">{(REFERRAL_BONUSES.LEVEL_3 * 100)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralSection;
