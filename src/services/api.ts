import { 
  TelegramUser, 
  AppSettings, 
  Task, 
  ChannelInfo, 
  Withdrawal, 
  Transaction, 
  LeaderboardUser,
  AdminAuditLog,
  Referral
} from '../types';

let currentTestUserId: string = localStorage.getItem('iton_test_user_id') || '100001';
let adminToken: string = localStorage.getItem('iton_admin_token') || '';

export function setTestUserId(id: string) {
  currentTestUserId = id;
  localStorage.setItem('iton_test_user_id', id);
}

export function getTestUserId(): string {
  return currentTestUserId;
}

export function setAdminToken(token: string) {
  adminToken = token;
  localStorage.setItem('iton_admin_token', token);
}

export function getAdminToken(): string {
  return adminToken;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Telegram WebApp initData
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
    headers['x-telegram-init-data'] = (window as any).Telegram.WebApp.initData;
  } else {
    // Development preview fallback test user
    headers['x-test-user-id'] = currentTestUserId;
  }

  if (adminToken) {
    headers['x-admin-key'] = adminToken;
  }

  return headers;
}

export const api = {
  async authenticate(referrerId?: string): Promise<{ user: TelegramUser; settings: AppSettings }> {
    const initData = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initData : '';
    const res = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        initData: initData || undefined,
        testUserId: !initData ? currentTestUserId : undefined,
        referrerId
      })
    });
    if (!res.ok) throw new Error('Authentication failed');
    return res.json();
  },

  async getUserProfile(): Promise<{ user: TelegramUser }> {
    const res = await fetch('/api/user/profile', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async getChannels(): Promise<{ channels: ChannelInfo[]; paymentProofChannel: string }> {
    const res = await fetch('/api/channels', { headers: getHeaders() });
    return res.json();
  },

  async verifyChannels(): Promise<{ allJoined: boolean; missingChannels: string[]; message: string }> {
    const res = await fetch('/api/channels/verify', {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Channel verification failed');
    return res.json();
  },

  async getTasks(): Promise<{ tasks: (Task & { isCompleted: boolean })[] }> {
    const res = await fetch('/api/tasks', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async completeTask(taskId: string): Promise<{ success: boolean; reward: number; message: string; user: TelegramUser }> {
    const res = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async getDailyBonusStatus(): Promise<{
    canClaim: boolean;
    streak: number;
    nextReward: number;
    timeRemainingSeconds: number;
    rewards: number[];
  }> {
    const res = await fetch('/api/daily-bonus/status', { headers: getHeaders() });
    return res.json();
  },

  async claimDailyBonus(): Promise<{ success: boolean; reward: number; streak: number; message: string; user: TelegramUser }> {
    const res = await fetch('/api/daily-bonus/claim', {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async startRewardedAd(): Promise<{
    sessionId: string;
    token: string;
    monetagConfig: any;
  }> {
    const res = await fetch('/api/ads/start', {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async completeRewardedAd(sessionId: string): Promise<{ success: boolean; reward: number; message: string; user: TelegramUser }> {
    const res = await fetch('/api/ads/complete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId })
    });
    return res.json();
  },

  async unlockSpin(): Promise<{ success: boolean; spinsAvailable: number }> {
    const res = await fetch('/api/spin/unlock', {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async spinWheel(): Promise<{
    success: boolean;
    reward: number;
    sliceIndex: number;
    message: string;
    user: TelegramUser;
  }> {
    const res = await fetch('/api/spin/wheel', {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async getReferrals(): Promise<{
    referrals: Referral[];
    totalInvited: number;
    approvedCount: number;
    pendingCount: number;
    totalEarnings: number;
    inviteLink: string;
  }> {
    const res = await fetch('/api/referrals', { headers: getHeaders() });
    return res.json();
  },

  async getWithdrawals(): Promise<{ withdrawals: Withdrawal[] }> {
    const res = await fetch('/api/withdrawals', { headers: getHeaders() });
    return res.json();
  },

  async submitWithdrawal(data: {
    method: 'USDT_BEP20' | 'GRAM';
    walletAddress: string;
    amount: number;
  }): Promise<{ success: boolean; withdrawal?: Withdrawal; message: string; user?: TelegramUser; error?: string }> {
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    const res = await fetch('/api/transactions', { headers: getHeaders() });
    return res.json();
  },

  async getLeaderboard(): Promise<{ leaderboard: LeaderboardUser[] }> {
    const res = await fetch('/api/leaderboard', { headers: getHeaders() });
    return res.json();
  },

  async getSettings(): Promise<{ settings: AppSettings }> {
    const res = await fetch('/api/settings', { headers: getHeaders() });
    return res.json();
  },

  // --- Admin Methods ---
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  async getAdminDashboard(): Promise<{ stats: any }> {
    const res = await fetch('/api/admin/dashboard', { headers: getHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  async getAdminUsers(): Promise<{ users: TelegramUser[] }> {
    const res = await fetch('/api/admin/users', { headers: getHeaders() });
    return res.json();
  },

  async adjustBalance(userId: string, amount: number, reason: string): Promise<{ success: boolean; newBalance: number }> {
    const res = await fetch(`/api/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, reason })
    });
    return res.json();
  },

  async toggleUserBlock(userId: string, status: 'ACTIVE' | 'BLOCKED'): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/users/${userId}/toggle-block`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async toggleUserFlag(userId: string, fraudStatus: 'CLEAN' | 'FLAGGED'): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/users/${userId}/toggle-flag`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fraudStatus })
    });
    return res.json();
  },

  async getAdminWithdrawals(): Promise<{ withdrawals: Withdrawal[] }> {
    const res = await fetch('/api/admin/withdrawals', { headers: getHeaders() });
    return res.json();
  },

  async approveWithdrawal(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async rejectWithdrawal(id: string, reason: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async markWithdrawalPaid(id: string, txHash?: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/withdrawals/${id}/paid`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ txHash })
    });
    return res.json();
  },

  async getAdminReferrals(): Promise<{ referrals: Referral[] }> {
    const res = await fetch('/api/admin/referrals', { headers: getHeaders() });
    return res.json();
  },

  async approveReferral(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/referrals/${id}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async rejectReferral(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/referrals/${id}/reject`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async updateAdminSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async getAdminAuditLogs(): Promise<{ logs: AdminAuditLog[] }> {
    const res = await fetch('/api/admin/audit-logs', { headers: getHeaders() });
    return res.json();
  }
};
