
import React, { useState } from 'react';
import { User, TransactionStatus, NetworkType } from '../types';
import { RECHARGE_WALLET } from '../constants';
import { mockStore } from '../services/mockStore';

interface RechargeProps {
  user: User;
  onBack: () => void;
}

const Recharge: React.FC<RechargeProps> = ({ user, onBack }) => {
  const [amount, setAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(RECHARGE_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }

    setLoading(true);
    try {
      const txs = await mockStore.getTransactions();
      const newTx = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        username: user.username,
        amount: numAmount,
        type: 'RECHARGE' as const,
        status: TransactionStatus.PENDING,
        network: NetworkType.BEP20,
        timestamp: Date.now(),
      };

      await mockStore.saveTransactions([...txs, newTx]);
      alert('Solicitud de recarga enviada al servidor central. Por favor espera aprobación manual.');
      onBack();
    } catch (error) {
      alert('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100"><i className="fas fa-arrow-left"></i></button>
        <h2 className="text-xl font-black text-gray-800 italic uppercase">Recargar Nube</h2>
      </div>

      <div className="bg-white rounded-[35px] p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3">
           <i className="fas fa-cloud text-blue-50 opacity-20 text-6xl"></i>
        </div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Dirección BEP-20 Sincronizada</p>
        <div className="bg-slate-50 p-5 rounded-2xl border-dashed border-2 border-slate-200 break-all text-gray-600 font-mono text-xs mb-6 font-bold shadow-inner">
          {RECHARGE_WALLET}
        </div>
        <button 
          onClick={handleCopy}
          className="bg-blue-600 text-white w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-100 active:scale-95 transition-all"
        >
          {copied ? <><i className="fas fa-check"></i> Copiado</> : <><i className="fas fa-copy"></i> Copiar Dirección</>}
        </button>
        
        <div className="mt-8 flex flex-col gap-3 text-left bg-blue-50/50 p-4 rounded-2xl">
           <div className="flex gap-3">
             <i className="fas fa-info-circle text-blue-600 text-xs mt-0.5"></i>
             <p className="text-[10px] text-blue-700 font-bold leading-tight">Envía solo USDT mediante la red BSC (BEP-20).</p>
           </div>
           <div className="flex gap-3">
             <i className="fas fa-lock text-blue-600 text-xs mt-0.5"></i>
             <p className="text-[10px] text-blue-700 font-bold leading-tight">Los fondos requieren verificación manual centralizada.</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Monto a depositar (USDT)</label>
          <div className="relative">
            <input 
              type="number" 
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white border border-slate-200 rounded-[20px] py-5 px-6 focus:outline-none focus:ring-4 focus:ring-blue-600/5 font-black text-slate-900 text-lg shadow-sm placeholder-slate-300 transition-all"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-600 font-black text-sm">USDT</span>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${loading ? 'bg-gray-100 text-gray-400' : 'bg-gradient-primary text-white shadow-blue-100'}`}
        >
          {loading ? 'Procesando...' : 'Notificar Depósito'}
        </button>
      </form>
    </div>
  );
};

export default Recharge;
