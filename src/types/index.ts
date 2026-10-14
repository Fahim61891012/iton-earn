export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
export type FraudRiskStatus = 'CLEAN' | 'REVIEW' | 'FLAGGED';

export interface TelegramUser {
  id: number;
  telegramUserId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  referralCount: number;
  referralEarnings: number;
  referrerId?: string;
  channelsJoined: boolean;
  dailyBonusStreak: number;
  lastDailyBonusClaimedAt?: string;
  adCooldownUntil?: string;
  adsWatchedToday: number;
  spinsAvailable: number;
  status: AccountStatus;
  fraudStatus: FraudRiskStatus;
  createdAt: string;
  lastActiveAt: string;
}

export type ReferralStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referredUsername?: string;
  referredFirstName: string;
  rewardAmount: number;
  status: ReferralStatus;
  hasJoinedChannels: boolean;
  createdAt: string;
  approvedAt?: string;
}

export type TransactionType = 
  | 'AD_REWARD' 
  | 'SPIN_REWARD' 
  | 'DAILY_BONUS' 
  | 'REFERRAL_REWARD' 
  | 'TASK_REWARD' 
  | 'WITHDRAWAL_LOCK' 
  | 'WITHDRAWAL_REFUND' 
  | 'WITHDRAWAL_PAID' 
  | 'ADMIN_ADJUSTMENT';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive or negative
  balanceAfter: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type WithdrawalMethod = 'USDT_BEP20' | 'GRAM';
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'REJECTED';

export interface Withdrawal {
  id: string;
  userId: string;
  telegramUserId: string;
  username?: string;
  method: WithdrawalMethod;
  walletAddress: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: WithdrawalStatus;
  adminNote?: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskType = 'WATCH_AD' | 'TELEGRAM_CHANNEL' | 'VISIT_WEBSITE' | 'DAILY_CHECKIN' | 'CUSTOM';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: TaskType;
  actionUrl?: string;
  dailyLimit: number;
  cooldownSeconds: number;
  isActive: boolean;
  iconName?: string;
  isCompleted?: boolean;
}

export interface ChannelInfo {
  id: string;
  name: string;
  username: string;
  inviteLink: string;
  description: string;
  isMandatory: boolean;
  isJoined?: boolean;
}

export interface AppSettings {
  botUsername: string;
  supportUsername: string;
  paymentProofChannel: string;
  adRewardAmount: number;
  dailyAdLimit: number;
  adCooldownSeconds: number;
  referralRewardAmount: number;
  minWithdrawalBalance: number;
  minApprovedReferrals: number;
  isMaintenanceMode: boolean;
  channels: ChannelInfo[];
  spinRewards: number[];
  dailyStreakRewards: number[];
}

export interface LeaderboardUser {
  rank: number;
  telegramUserId: string;
  username: string;
  firstName: string;
  referralCount: number;
  totalEarned: number;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
