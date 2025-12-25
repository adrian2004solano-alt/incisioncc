
import React, { useState } from 'react';
import { User, TransactionStatus, NetworkType } from '../types';
import { NETWORKS } from '../constants';
import { mockStore } from '../services/mockStore';

interface WithdrawProps {
  user: User;
  onBack: () => void;
  onRefresh: () => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ user, onBack, onRefresh }) => {
  const [amount, setAmount] = useState<string>('');
  const [wallet, setWallet] = useState<string>('');
  const [network, setNetwork] = useState<NetworkType>(NetworkType.BEP20);
  const [loading, setLoading] = useState(false);

  const MIN_WITHDRAWAL = 10;
  const retirable = user.withdrawableProfit || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }

    if (numAmount < MIN_WITHDRAWAL) {
      alert(`El monto mínimo de retiro es de ${MIN_WITHDRAWAL} USDT.`);
      return;
    }

    if (numAmount > retirable) {
      alert(`Solo puedes retirar tus ganancias acumuladas ($${retirable.toFixed(2)} USDT). El capital de inversión no es retirable.`);
      return;
    }

    if (wallet.length < 10) {
      alert('Ingresa una dirección de billetera válida.');
      return;
    }

    setLoading(true);
    try {
      // 1. Descontar saldo de ganancias inmediatamente (pasando isWithdrawal: true)
      await mockStore.updateUserBalance(user.id, -numAmount, true);
      
      // 2. Crear transacción de retiro
      const txs = await mockStore.getTransactions();
      const newTx = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        username: user.username,
        amount: numAmount,
        type: 'WITHDRAW' as const,
        status: TransactionStatus.PENDING,
        network: network,
        walletAddress: wallet,
        timestamp: Date.now(),
      };

      await mockStore.saveTransactions([...txs, newTx]);
      await onRefresh();
      
      alert('Solicitud de retiro enviada. Las ganancias llegarán a su billetera en un plazo de 1 a 30 minutos.');
      onBack();
    } catch (error) {
      alert('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-xl font-black text-gray-800 italic uppercase">Retirar Ganancias</h2>
      </div>

      <div className="bg-gradient-success rounded-[32px] p-6 text-white shadow-xl shadow-green-100 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <i className="fas fa-money-bill-transfer text-6xl"></i>
        </div>
        <div>
          <p className="text-green-100 text-[10px] font-black uppercase tracking-widest opacity-80">Ganancias Disponibles</p>
          <h2 className="text-3xl font-black mt-1">${retirable.toFixed(2)}</h2>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
          <i className="fas fa-hand-holding-dollar text-2xl"></i>
        </div>
      </div>

      {/* Alerta de Mínimo y Restricción */}
      <div className="space-y-3">
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
          <i className="fas fa-circle-exclamation text-orange-500 mt-1"></i>
          <div>
            <p className="text-[11px] text-orange-800 font-black uppercase leading-tight">Mínimo de Retiro: {MIN_WITHDRAWAL} USDT</p>
            <p className="text-[9px] text-orange-600 font-bold mt-1 uppercase">Solo se procesan retiros de ganancias acumuladas.</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
          <i className="fas fa-shield-check text-blue-500 mt-1"></i>
          <p className="text-[11px] text-blue-800 font-bold leading-snug uppercase">
            El capital de activación VIP es permanente para mantener su nivel. No es extraíble.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Red de Retiro</label>
          <div className="grid grid-cols-3 gap-2">
            {NETWORKS.map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => setNetwork(net)}
                className={`py-3 rounded-xl font-black text-[10px] border-2 transition-all ${
                  network === net ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400'
                }`}
              >
                {net}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Dirección de Destino ({network})</label>
          <input 
            type="text" 
            required
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Dirección USDT..."
            className="w-full bg-white border border-slate-200 rounded-[20px] py-4 px-6 focus:outline-none focus:ring-4 focus:ring-blue-600/5 font-semibold text-slate-900 text-sm shadow-sm placeholder-slate-300 transition-all"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Monto (Mínimo {MIN_WITHDRAWAL} USDT)</label>
          <div className="relative">
            <input 
              type="number" 
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white border border-slate-200 rounded-[20px] py-5 px-6 focus:outline-none focus:ring-4 focus:ring-blue-600/5 font-black text-slate-900 text-lg shadow-sm placeholder-slate-300 transition-all"
            />
            <button 
              type="button"
              onClick={() => {
                if (retirable >= MIN_WITHDRAWAL) {
                  setAmount(retirable.toString());
                } else {
                  alert(`Tu balance (${retirable.toFixed(2)}) es inferior al mínimo de ${MIN_WITHDRAWAL} USDT.`);
                }
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-600 font-black text-[10px] uppercase bg-blue-50 px-3 py-1.5 rounded-lg active:scale-90 transition-all"
            >
              RETIRAR TODO
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || retirable < MIN_WITHDRAWAL}
          className={`w-full py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
            loading ? 'bg-gray-100 text-gray-400' : retirable < MIN_WITHDRAWAL ? 'bg-slate-200 text-slate-400' : 'bg-gradient-success text-white shadow-green-100'
          }`}
        >
          {loading ? (
            <><i className="fas fa-sync fa-spin"></i> PROCESANDO...</>
          ) : retirable < MIN_WITHDRAWAL ? (
            'SALDO INSUFICIENTE (MIN $10)'
          ) : (
            <><i className="fas fa-check-double"></i> CONFIRMAR RETIRO</>
          )}
        </button>
      </form>
    </div>
  );
};

export default Withdraw;
