
import { VIPLevel, NetworkType } from './types';

export const APP_NAME = 'incisióncc';
export const ADMIN_PASSWORD = 'adrian14a';
export const RECHARGE_WALLET = '0x5d053b7d1154ce3bcdc987d12f4e7ebb7957ac25';
export const CUSTOMER_SERVICE_PHONE = '8492146118';

export const VIP_LEVELS: VIPLevel[] = [
  { id: 1, name: 'VIP 1', price: 10, dailyProfitPercent: 12, icon: 'fa-seedling' },
  { id: 2, name: 'VIP 2', price: 30, dailyProfitPercent: 12, icon: 'fa-leaf' },
  { id: 3, name: 'VIP 3', price: 90, dailyProfitPercent: 12, icon: 'fa-tree' },
  { id: 4, name: 'VIP 4', price: 230, dailyProfitPercent: 12, icon: 'fa-gem' },
  { id: 5, name: 'VIP 5', price: 508, dailyProfitPercent: 12, icon: 'fa-crown' },
  { id: 6, name: 'VIP 6', price: 1200, dailyProfitPercent: 12, icon: 'fa-trophy' },
  { id: 7, name: 'VIP 7', price: 2500, dailyProfitPercent: 12, icon: 'fa-star' },
];

export const WHEEL_PRIZES = [0.5, 1, 2, 3, 4, 10, 15];

export const REFERRAL_BONUSES = {
  LEVEL_1: 0.12, // 12%
  LEVEL_2: 0.05, // 5%
  LEVEL_3: 0.02, // 2%
};

export const NETWORKS: NetworkType[] = [
  NetworkType.BEP20,
  NetworkType.ERC20,
  NetworkType.TRC20
];
