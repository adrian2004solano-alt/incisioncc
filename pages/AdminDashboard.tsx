
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, User } from '../types';
import { mockStore } from '../services/mockStore';
import { REFERRAL_BONUSES } from '../constants';

interface AdminDashboardProps {
  onRefresh?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefresh }) => {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeView, setActiveView] = useState<'transactions' | 'users'>('transactions');
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const allTxs = await mockStore.getTransactions();
      const allUsers = await mockStore.getUsers();
      setTxs(allTxs.sort((a, b) => b.timestamp - a.timestamp));
      setUsers(allUsers);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error al refrescar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApprove = async (tx: Transaction) => {
    setLoading(true);
    try {
      const allTxs = await mockStore.getTransactions();
      const updatedTxs = allTxs.map(t => t.id === tx.id ? { ...t, status: TransactionStatus.APPROVED } : t);
      await mockStore.saveTransactions(updatedTxs);

      if (tx.type === 'RECHARGE') {
        // Recarga normal (va al balance, no a ganancias)
        await mockStore.updateUserBalance(tx.userId, tx.amount, false);
        
        // Aplicar bonos de referido en cascada (estos SÍ van a ganancias retirables)
        const allUsers = await mockStore.getUsers();
        const currentUser = allUsers.find(u => u.id === tx.userId);
        
        if (currentUser?.referredBy) {
          // Nivel 1 (12%)
          const l1 = allUsers.find(u => u.referralCode === currentUser.referredBy);
          if (l1) {
            const bonus1 = tx.amount * REFERRAL_BONUSES.LEVEL_1;
            await mockStore.addReferralBonus(l1.id, bonus1);
            
            // Nivel 2 (5%)
            if (l1.referredBy) {
              const l2 = allUsers.find(u => u.referralCode === l1.referredBy);
              if (l2) {
                const bonus2 = tx.amount * REFERRAL_BONUSES.LEVEL_2;
                await mockStore.addReferralBonus(l2.id, bonus2);
                
                // Nivel 3 (2%)
                if (l2.referredBy) {
                  const l3 = allUsers.find(u => u.referralCode === l2.referredBy);
                  if (l3) {
                    const bonus3 = tx.amount * REFERRAL_BONUSES.LEVEL_3;
                    await mockStore.addReferralBonus(l3.id, bonus3);
                  }
                }
              }
            }
          }
        }
      }
      await refreshData();
      alert('Transacción aprobada y bonos distribuidos correctamente.');
    } catch (error) {
      alert('Error al procesar la aprobación.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (txId: string) => {
    if (confirm('¿Estás seguro de rechazar esta transacción?')) {
      setLoading(true);
      try {
        const allTxs = await mockStore.getTransactions();
        const tx = allTxs.find(t => t.id === txId);
        
        // Si rechazamos un retiro, devolvemos los fondos al saldo retirable
        if (tx && tx.type === 'WITHDRAW') {
          await mockStore.updateUserBalance(tx.userId, tx.amount, true);
        }

        const updatedTxs = allTxs.map(t => t.id === txId ? { ...t, status: TransactionStatus.REJECTED } : t);
        await mockStore.saveTransactions(updatedTxs);
        await refreshData();
      } catch (error) {
        alert('Error al procesar el rechazo.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getReferralCount = (user: User) => {
    return users.filter(u => u.referredBy === user.referralCode).length;
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="bg-white rounded-3xl p-2 border border-gray-100 flex shadow-sm">
        <button 
          onClick={() => setActiveView('transactions')}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${activeView === 'transactions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400'}`}
        >
          Transacciones
        </button>
        <button 
          onClick={() => setActiveView('users')}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${activeView === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400'}`}
        >
          Usuarios
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && activeView === 'transactions' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Pendientes y Recientes</h3>
            <button onClick={refreshData} className="text-blue-600 text-xs font-bold"><i className="fas fa-sync"></i> Actualizar</button>
          </div>
          {txs.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-gray-100 text-gray-400 text-sm">
              No hay transacciones registradas.
            </div>
          ) : (
            txs.map(tx => (
              <div key={tx.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${tx.type === 'RECHARGE' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${tx.type === 'RECHARGE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {tx.type === 'RECHARGE' ? 'Recarga' : 'Retiro'}
                    </span>
                    <h4 className="font-bold text-gray-800 mt-1">{tx.username}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${tx.type === 'RECHARGE' ? 'text-blue-600' : 'text-green-600'}`}>
                      ${tx.amount.toFixed(2)}
                    </p>
                    <span className={`text-[9px] font-bold uppercase ${tx.status === TransactionStatus.PENDING ? 'text-orange-500' : tx.status === TransactionStatus.APPROVED ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>

                {tx.walletAddress && (
                  <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Wallet de Retiro ({tx.network})</p>
                    <p className="text-[11px] font-mono break-all text-gray-700 font-bold">{tx.walletAddress}</p>
                  </div>
                )}

                {tx.status === TransactionStatus.PENDING && (
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => handleApprove(tx)}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-green-100 active:scale-95 transition-all"
                    >
                      APROBAR
                    </button>
                    <button 
                      onClick={() => handleReject(tx.id)}
                      className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-xs active:scale-95 transition-all"
                    >
                      RECHAZAR
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : !loading && (
        <div className="space-y-4">
          <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest ml-2">Gestión de Usuarios</h3>
          {users.map(user => (
            <div key={user.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{user.username}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Ref: {user.referralCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-600">${user.balance.toFixed(2)}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Profit: ${user.withdrawableProfit.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Equipo</p>
                  <p className="text-sm font-black text-gray-700">{getReferralCount(user)} Miembros</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">VIP Activos</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.vipLevels.length > 0 ? user.vipLevels.map(lvl => (
                      <span key={lvl} className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">V{lvl}</span>
                    )) : <span className="text-[10px] font-bold text-gray-400">NINGUNO</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    const amount = prompt(`Ajustar balance de ${user.username}. (+/-)`);
                    if (amount && !isNaN(parseFloat(amount))) {
                      await mockStore.updateUserBalance(user.id, parseFloat(amount));
                      await refreshData();
                    }
                  }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-all"
                >
                  Editar Saldo
                </button>
                <button 
                  onClick={async () => {
                    const amount = prompt(`Ajustar ganancias retirables de ${user.username}. (+/-)`);
                    if (amount && !isNaN(parseFloat(amount))) {
                      const users = await mockStore.getUsers();
                      const updated = users.map(u => u.id === user.id ? { ...u, withdrawableProfit: Math.max(0, u.withdrawableProfit + parseFloat(amount)) } : u);
                      await mockStore.saveUsers(updated);
                      await refreshData();
                    }
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-all"
                >
                  Editar Profit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
