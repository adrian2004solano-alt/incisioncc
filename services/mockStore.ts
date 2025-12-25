
import { User, Transaction, TransactionStatus } from '../types';
import { VIP_LEVELS } from '../constants';
import { supabase } from '../lib/supabase';

const CURRENT_USER_KEY = 'inc_central_session';

export const mockStore = {
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !data) return null;
      return {
        id: data.id,
        username: data.username,
        balance: parseFloat(data.balance) || 0,
        withdrawableProfit: parseFloat(data.withdrawable_profit) || 0,
        vipLevels: data.vip_levels || [],
        vipPurchaseDates: data.vip_purchase_dates || {},
        vipsClaimedToday: data.vips_claimed_today || [],
        lastClaimDate: data.last_claim_date,
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        createdAt: data.created_at,
        isAdmin: data.is_admin,
        lastSpinDate: data.last_spin_date
      };
    } catch (e) {
      return null;
    }
  },

  getUserByUsername: async (username: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username.trim())
        .maybeSingle();
      
      if (error || !data) return null;
      return {
        id: data.id,
        username: data.username,
        balance: parseFloat(data.balance) || 0,
        withdrawableProfit: parseFloat(data.withdrawable_profit) || 0,
        vipLevels: data.vip_levels || [],
        vipPurchaseDates: data.vip_purchase_dates || {},
        vipsClaimedToday: data.vips_claimed_today || [],
        lastClaimDate: data.last_claim_date,
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        createdAt: data.created_at,
        isAdmin: data.is_admin,
        lastSpinDate: data.last_spin_date
      };
    } catch (e) {
      return null;
    }
  },

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return [];
    return data.map(u => ({
      id: u.id,
      username: u.username,
      balance: parseFloat(u.balance) || 0,
      withdrawableProfit: parseFloat(u.withdrawable_profit) || 0,
      vipLevels: u.vip_levels || [],
      vipPurchaseDates: u.vip_purchase_dates || {},
      vipsClaimedToday: u.vips_claimed_today || [],
      lastClaimDate: u.last_claim_date,
      referralCode: u.referral_code,
      referredBy: u.referred_by,
      createdAt: u.created_at,
      isAdmin: u.is_admin,
      lastSpinDate: u.last_spin_date
    }));
  },

  saveUsers: async (users: User[]) => {
    const rows = users.map(u => ({
      id: u.id,
      username: u.username,
      balance: u.balance,
      withdrawable_profit: u.withdrawableProfit,
      vip_levels: u.vipLevels,
      vip_purchase_dates: u.vipPurchaseDates,
      vips_claimed_today: u.vipsClaimedToday,
      last_claim_date: u.lastClaimDate,
      referral_code: u.referralCode,
      referred_by: u.referredBy,
      created_at: u.createdAt,
      is_admin: u.isAdmin,
      last_spin_date: u.lastSpinDate
    }));
    return await supabase.from('users').upsert(rows);
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) return [];
    return data.map(t => ({
      id: t.id,
      userId: t.user_id,
      username: t.username,
      amount: parseFloat(t.amount),
      type: t.type as any,
      status: t.status as any,
      network: t.network as any,
      walletAddress: t.wallet_address,
      timestamp: t.timestamp
    }));
  },

  saveTransactions: async (txs: Transaction[]) => {
    const rows = txs.map(t => ({
      id: t.id,
      user_id: t.userId,
      username: t.username,
      amount: t.amount,
      type: t.type,
      status: t.status,
      network: t.network,
      wallet_address: t.walletAddress,
      timestamp: t.timestamp
    }));
    return await supabase.from('transactions').upsert(rows);
  },

  getCurrentUser: (): User | null => {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
  },

  updateUserBalance: async (userId: string, amount: number, isWithdrawal: boolean = false) => {
    const user = await mockStore.getUserById(userId);
    if (!user) return undefined;

    const today = new Date().toISOString().split('T')[0];
    const newBalance = Math.max(0, user.balance + amount);
    let newWithdrawable = user.withdrawableProfit || 0;
    
    if (isWithdrawal) {
      newWithdrawable = Math.max(0, newWithdrawable + amount);
    }

    let newVips = [...(user.vipLevels || [])];
    let purchaseDates = { ...(user.vipPurchaseDates || {}) };

    VIP_LEVELS.forEach(vip => {
      if (newBalance >= vip.price && !newVips.includes(vip.id)) {
        newVips.push(vip.id);
        purchaseDates[vip.id] = today;
      }
    });

    const { error } = await supabase.from('users').update({
      balance: newBalance,
      withdrawable_profit: newWithdrawable,
      vip_levels: newVips.sort((a, b) => a - b),
      vip_purchase_dates: purchaseDates
    }).eq('id', userId);
    
    if (error) throw error;

    const finalUser = { ...user, balance: newBalance, withdrawableProfit: newWithdrawable, vipLevels: newVips, vipPurchaseDates: purchaseDates };
    const current = mockStore.getCurrentUser();
    if (current && current.id === userId) {
      mockStore.setCurrentUser(finalUser);
    }
    return finalUser;
  },

  claimWheelPrize: async (userId: string, amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const user = await mockStore.getUserById(userId);
    if (!user) return undefined;

    const newBalance = user.balance + amount;
    const newWithdrawable = user.withdrawableProfit + amount;

    await supabase.from('users').update({
      balance: newBalance,
      withdrawable_profit: newWithdrawable,
      last_spin_date: today
    }).eq('id', userId);

    const updatedUser = { ...user, balance: newBalance, withdrawableProfit: newWithdrawable, lastSpinDate: today };
    mockStore.setCurrentUser(updatedUser);
    return updatedUser;
  },

  completeTask: async (userId: string, profit: number, vipIdsClaimed: number[]) => {
    const today = new Date().toISOString().split('T')[0];
    const user = await mockStore.getUserById(userId);
    if (!user) return undefined;

    const isNewDay = user.lastClaimDate !== today;
    const currentClaimed = isNewDay ? [] : [...(user.vipsClaimedToday || [])];
    const newClaimedList = [...currentClaimed, ...vipIdsClaimed];

    const newBalance = user.balance + profit;
    const newWithdrawable = user.withdrawableProfit + profit;

    await supabase.from('users').update({
      balance: newBalance,
      withdrawable_profit: newWithdrawable,
      last_claim_date: today,
      vips_claimed_today: newClaimedList
    }).eq('id', userId);

    const updatedUser = { ...user, balance: newBalance, withdrawableProfit: newWithdrawable, lastClaimDate: today, vipsClaimedToday: newClaimedList };
    mockStore.setCurrentUser(updatedUser);
    return updatedUser;
  },

  addReferralBonus: async (userId: string, amount: number) => {
    const user = await mockStore.getUserById(userId);
    if (!user) return undefined;

    const newBalance = user.balance + amount;
    const newWithdrawable = user.withdrawableProfit + amount;

    await supabase.from('users').update({
      balance: newBalance,
      withdrawable_profit: newWithdrawable
    }).eq('id', userId);

    return { ...user, balance: newBalance, withdrawableProfit: newWithdrawable };
  }
};
