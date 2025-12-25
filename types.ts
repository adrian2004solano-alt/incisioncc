
export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum NetworkType {
  BEP20 = 'BEP-20',
  ERC20 = 'ERC-20',
  TRC20 = 'TRC-20'
}

export interface VIPLevel {
  id: number;
  name: string;
  price: number;
  dailyProfitPercent: number;
  icon: string;
}

export interface User {
  id: string;
  username: string; // Se usa para Email o Teléfono
  balance: number;
  withdrawableProfit: number; // Nuevo campo para ganancias extraíbles
  vipLevels: number[];
  vipPurchaseDates: Record<number, string>; // ID VIP -> Fecha YYYY-MM-DD
  vipsClaimedToday: number[]; // IDs de VIPs ya cobrados hoy
  lastClaimDate?: string; // Fecha del último cobro general YYYY-MM-DD
  referralCode: string;
  referredBy?: string;
  createdAt: number;
  isAdmin?: boolean;
  lastSpinDate?: string; // Formato YYYY-MM-DD
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: 'RECHARGE' | 'WITHDRAW';
  status: TransactionStatus;
  network?: NetworkType;
  walletAddress?: string;
  timestamp: number;
}
