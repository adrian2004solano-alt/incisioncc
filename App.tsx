
import React, { useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { mockStore } from './services/mockStore';
import { ADMIN_PASSWORD, APP_NAME } from './constants';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import VIPSection from './pages/VIPSection';
import ReferralSection from './pages/ReferralSection';
import Recharge from './pages/Recharge';
import Withdraw from './pages/Withdraw';
import AdminDashboard from './pages/AdminDashboard';
import SpinWheel from './pages/SpinWheel';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'main'>('login');
  const [activeTab, setActiveTab] = useState('home');
  const [authData, setAuthData] = useState({ username: '', password: '', confirm: '', referral: '' });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserData = useCallback(async () => {
    const cached = mockStore.getCurrentUser();
    if (cached) {
      const serverUser = await mockStore.getUserById(cached.id);
      if (serverUser) {
        // Mantenemos el estado admin si se usó la clave maestra o si está en DB
        const isMaster = authData.password.trim() === ADMIN_PASSWORD;
        const userToSet = { ...serverUser, isAdmin: serverUser.isAdmin || isMaster || cached.isAdmin };
        setCurrentUser(userToSet);
        mockStore.setCurrentUser(userToSet);
      }
    }
  }, [authData.password]);

  useEffect(() => {
    const checkSession = async () => {
      const cachedUser = mockStore.getCurrentUser();
      if (cachedUser) {
        const serverUser = await mockStore.getUserById(cachedUser.id);
        if (serverUser) {
          setCurrentUser({ ...serverUser, isAdmin: serverUser.isAdmin || cachedUser.isAdmin });
          setView('main');
        } else {
          mockStore.setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };
    checkSession();

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('ref=')) {
        const code = hash.split('ref=')[1].split('&')[0];
        setAuthData(prev => ({ ...prev, referral: code }));
        setView('register');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    const interval = setInterval(refreshUserData, 15000); 
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(interval);
    };
  }, [refreshUserData]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = authData.username.trim();
    const password = authData.password.trim();
    
    if (password !== authData.confirm.trim() && password !== ADMIN_PASSWORD) {
      return alert('Las contraseñas no coinciden.');
    }
    if (username.length < 3) return alert('Mínimo 3 caracteres para el usuario.');
    
    setIsLoading(true);
    const existing = await mockStore.getUserByUsername(username);
    if (existing) {
      setIsLoading(false);
      return alert('Esta cuenta ya existe.');
    }

    const isAdmin = password === ADMIN_PASSWORD;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: username,
      balance: 0,
      withdrawableProfit: 0,
      vipLevels: [],
      vipPurchaseDates: {},
      vipsClaimedToday: [],
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referredBy: authData.referral || undefined,
      createdAt: Date.now(),
      isAdmin: isAdmin
    };

    await mockStore.saveUsers([newUser]);
    mockStore.setCurrentUser(newUser);
    setCurrentUser(newUser);
    setView('main');
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = authData.username.trim();
    const password = authData.password.trim();
    const isMasterKey = password === ADMIN_PASSWORD;

    setIsLoading(true);
    let user = await mockStore.getUserByUsername(username);
    
    if (!user && isMasterKey) {
      const newUser: User = {
        id: 'admin-' + Math.random().toString(36).substr(2, 5),
        username: username || 'admin',
        balance: 100,
        withdrawableProfit: 0,
        vipLevels: [1],
        vipPurchaseDates: {},
        vipsClaimedToday: [],
        referralCode: 'MASTER',
        createdAt: Date.now(),
        isAdmin: true
      };
      await mockStore.saveUsers([newUser]);
      user = newUser;
    }

    if (!user) {
      setIsLoading(false);
      return alert('Usuario no encontrado.');
    }

    const finalUser = { ...user, isAdmin: user.isAdmin || isMasterKey };
    if (isMasterKey && !user.isAdmin) {
      await mockStore.saveUsers([finalUser]);
    }

    mockStore.setCurrentUser(finalUser);
    setCurrentUser(finalUser);
    setView('main');
    setIsLoading(false);
  };

  const handleLogout = () => {
    mockStore.setCurrentUser(null);
    setCurrentUser(null);
    setAuthData({ username: '', password: '', confirm: '', referral: '' });
    setView('login');
    setActiveTab('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Nube...</p>
      </div>
    );
  }

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[45px] shadow-2xl p-10 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-blue-600 tracking-tighter uppercase italic">{APP_NAME}</h1>
            <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">
              {view === 'login' ? 'Acceso al Terminal' : 'Registro de Terminal'}
            </p>
          </div>

          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-tighter">Usuario</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl py-4 px-6 focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold"
                placeholder="Identificación"
                value={authData.username}
                onChange={e => setAuthData({...authData, username: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-tighter">Contraseña</label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl py-4 px-6 focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold"
                placeholder="Clave de seguridad"
                value={authData.password}
                onChange={e => setAuthData({...authData, password: e.target.value})}
              />
            </div>
            {view === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-tighter">Confirmar</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl py-4 px-6 focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold"
                    placeholder="Repetir clave"
                    value={authData.confirm}
                    onChange={e => setAuthData({...authData, confirm: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-tighter">Referido</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl py-4 px-6 focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold"
                    placeholder="Código (opcional)"
                    value={authData.referral}
                    onChange={e => setAuthData({...authData, referral: e.target.value})}
                  />
                </div>
              </>
            )}
            <button className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black shadow-xl shadow-blue-100 uppercase tracking-widest active:scale-95 transition-all mt-4 text-sm">
              {view === 'login' ? 'Entrar' : 'Registrarse'}
            </button>
          </form>

          <button 
            onClick={() => setView(view === 'login' ? 'register' : 'login')}
            className="w-full mt-6 text-blue-600 font-black text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            {view === 'login' ? '¿Crear nueva cuenta?' : '¿Ya tienes cuenta? Ingresa'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-24 shadow-2xl border-x border-slate-100">
      <Navbar onLogout={handleLogout} isAdmin={currentUser?.isAdmin} />
      
      {activeTab === 'home' && <Dashboard user={currentUser!} onNavigate={setActiveTab} onRefresh={refreshUserData} />}
      {activeTab === 'vip' && <VIPSection user={currentUser!} onRefresh={refreshUserData} onNavigate={setActiveTab} />}
      {activeTab === 'referral' && <ReferralSection user={currentUser!} />}
      {activeTab === 'recharge' && <Recharge user={currentUser!} onBack={() => setActiveTab('home')} />}
      {activeTab === 'withdraw' && <Withdraw user={currentUser!} onBack={() => setActiveTab('home')} onRefresh={refreshUserData} />}
      {activeTab === 'admin' && currentUser?.isAdmin && <AdminDashboard onRefresh={refreshUserData} />}
      {activeTab === 'wheel' && <SpinWheel user={currentUser!} onRefresh={refreshUserData} onBack={() => setActiveTab('home')} />}
      
      {activeTab === 'profile' && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-[40px] p-10 text-center border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
             <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[30px] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black shadow-xl relative z-10">
               {currentUser?.username[0].toUpperCase()}
             </div>
             <h2 className="text-2xl font-black text-slate-800 relative z-10">{currentUser?.username}</h2>
             <p className="text-blue-500 text-[10px] font-black uppercase mt-2 tracking-widest relative z-10">Nodo: {currentUser?.id.toUpperCase()}</p>
             
             <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Miembro desde</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(currentUser?.createdAt || 0).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Referidos</p>
                  <p className="text-xs font-bold text-slate-700">{currentUser?.referralCode}</p>
                </div>
             </div>
           </div>
           
           <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-5 rounded-[28px] font-black uppercase text-xs border border-red-100 active:scale-95 transition-all shadow-sm">
             Finalizar Sesión Cloud
           </button>
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={currentUser?.isAdmin} />
    </div>
  );
};

export default App;
