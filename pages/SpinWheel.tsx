
import React, { useState } from 'react';
import { User } from '../types';
import { WHEEL_PRIZES } from '../constants';
import { mockStore } from '../services/mockStore';

interface SpinWheelProps {
  user: User;
  onRefresh: () => void;
  onBack: () => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ user, onRefresh, onBack }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showPrize, setShowPrize] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const hasSpunToday = user.lastSpinDate === today;

  const handleSpin = async () => {
    if (hasSpunToday) {
      alert('Ya has usado tu giro gratis de hoy. Vuelve mañana.');
      return;
    }
    if (spinning) return;

    setSpinning(true);
    setShowPrize(null);

    // RIGGED LOGIC: Always 0.5 or 1 USDT
    // Prizes: [0.5, 1, 2, 3, 4, 10, 15]
    // Indices: 0 (0.5), 1 (1)
    const targetIndex = Math.random() > 0.5 ? 0 : 1;
    const prizeValue = WHEEL_PRIZES[targetIndex];
    
    const degreesPerSlice = 360 / WHEEL_PRIZES.length;
    // We want to land in the middle of the slice
    // The wheel rotates clockwise, but the items are usually layout in a specific way.
    // To make it simple, we rotate the wheel -degrees
    const extraRotations = 10; // More spins for effect
    const finalRotation = (extraRotations * 360) + (targetIndex * degreesPerSlice);
    
    setRotation(prev => prev + finalRotation);

    setTimeout(async () => {
      await mockStore.claimWheelPrize(user.id, prizeValue);
      onRefresh();
      setShowPrize(prizeValue);
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className="p-4 pb-24 space-y-8 flex flex-col items-center">
      <div className="w-full flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-xl font-black text-gray-800 italic uppercase">Ruleta de la Suerte</h2>
      </div>

      <div className="text-center space-y-2">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 inline-block">
          Giro Diario Gratis
        </p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">¡GANA USDT EXTRA!</h3>
      </div>

      {/* Wheel Visual Component */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20 text-blue-600 text-3xl">
          <i className="fas fa-caret-down"></i>
        </div>

        {/* The Wheel */}
        <div 
          className="w-full h-full rounded-full border-8 border-slate-800 shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-out"
          style={{ 
            transform: `rotate(-${rotation}deg)`,
            background: 'conic-gradient(#2563eb 0 51.4deg, #1d4ed8 51.4deg 102.8deg, #3b82f6 102.8deg 154.2deg, #1e40af 154.2deg 205.6deg, #60a5fa 205.6deg 257deg, #2563eb 257deg 308.4deg, #1d4ed8 308.4deg 360deg)'
          }}
        >
          {WHEEL_PRIZES.map((prize, i) => {
            const angle = (360 / WHEEL_PRIZES.length) * i;
            return (
              <div 
                key={i}
                className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom text-white font-black text-xs pt-4 flex flex-col items-center"
                style={{ transform: `rotate(${angle + 25.7}deg)` }}
              >
                <span>${prize}</span>
                <span className="text-[8px] opacity-60">USDT</span>
              </div>
            );
          })}
        </div>

        {/* Center Cap */}
        <div className="absolute w-12 h-12 bg-white rounded-full z-10 shadow-lg border-4 border-slate-800 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="w-full max-w-[280px]">
        {showPrize !== null && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 p-4 rounded-[24px] text-center animate-bounce">
            <p className="text-green-600 font-black text-xs uppercase mb-1">¡Premio Obtenido!</p>
            <h4 className="text-2xl font-black text-green-700">+${showPrize} USDT</h4>
          </div>
        )}

        <button 
          onClick={handleSpin}
          disabled={spinning || hasSpunToday}
          className={`w-full py-5 rounded-[28px] font-black text-lg uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
            spinning || hasSpunToday 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-gradient-primary text-white shadow-blue-200'
          }`}
        >
          {spinning ? 'GIRANDO...' : hasSpunToday ? 'YA USADO HOY' : '¡GIRAR AHORA!'}
        </button>
      </div>

      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-8 leading-relaxed">
        Cada usuario tiene un intento gratuito cada 24 horas.<br/>Los premios se acreditan instantáneamente a tu balance.
      </p>
    </div>
  );
};

export default SpinWheel;
