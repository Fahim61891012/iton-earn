import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Users, 
  ArrowDownToLine, 
  Radio, 
  Settings as SettingsIcon, 
  FileText, 
  Search, 
  Check, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  PlusCircle,
  MinusCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, setAdminToken, getAdminToken } from '../services/api';
import { TelegramUser, Withdrawal, Referral, AdminAuditLog } from '../types';

export const AdminPanelModal: React.FC = () => {
  const { showAdminModal, setShowAdminModal, showToast } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getAdminToken()));
  const [passwordInput, setPasswordInput] = useState('F@him78612345');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'withdrawals' | 'referrals' | 'channels' | 'settings' | 'logs'>('dashboard');

  // Admin Data States
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [userList, setUserList] = useState<TelegramUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Balance adjustment modal state
  const [adjustTargetUser, setAdjustTargetUser] = useState<TelegramUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('100');
  const [adjustReason, setAdjustReason] = useState<string>('Bonus reward');

  // Channels form state
  const [ch1Name, setCh1Name] = useState('');
  const [ch1User, setCh1User] = useState('');
  const [ch1Link, setCh1Link] = useState('');
  const [ch2Name, setCh2Name] = useState('');
  const [ch2User, setCh2User] = useState('');
  const [ch2Link, setCh2Link] = useState('');
  const [ch3Name, setCh3Name] = useState('');
  const [ch3User, setCh3User] = useState('');
  const [ch3Link, setCh3Link] = useState('');
  const [paymentProofChan, setPaymentProofChan] = useState('');
  const [supportHandle, setSupportHandle] = useState('');

  // Settings form state
  const [adReward, setAdReward] = useState('10');
  const [dailyAdLimit, setDailyAdLimit] = useState('15');
  const [refReward, setRefReward] = useState('100');
  const [minWithdraw, setMinWithdraw] = useState('1000');
  const [minRefs, setMinRefs] = useState('2');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Load active tab data
  const loadAdminData = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const res = await api.getAdminDashboard();
        setDashboardStats(res.stats);
      } else if (activeTab === 'users') {
        const res = await api.getAdminUsers();
        setUserList(res.users);
      } else if (activeTab === 'withdrawals') {
        const res = await api.getAdminWithdrawals();
        setWithdrawals(res.withdrawals);
      } else if (activeTab === 'referrals') {
        const res = await api.getAdminReferrals();
        setReferrals(res.referrals);
      } else if (activeTab === 'logs') {
        const res = await api.getAdminAuditLogs();
        setAuditLogs(res.logs);
      } else if (activeTab === 'channels' || activeTab === 'settings') {
        const res = await api.getSettings();
        const s = res.settings;
        if (s.channels[0]) {
          setCh1Name(s.channels[0].name);
          setCh1User(s.channels[0].username);
          setCh1Link(s.channels[0].inviteLink);
        }
        if (s.channels[1]) {
          setCh2Name(s.channels[1].name);
          setCh2User(s.channels[1].username);
          setCh2Link(s.channels[1].inviteLink);
        }
        if (s.channels[2]) {
          setCh3Name(s.channels[2].name);
          setCh3User(s.channels[2].username);
          setCh3Link(s.channels[2].inviteLink);
        }
        setPaymentProofChan(s.paymentProofChannel);
        setSupportHandle(s.supportUsername);
        setAdReward(s.adRewardAmount.toString());
        setDailyAdLimit(s.dailyAdLimit.toString());
        setRefReward(s.referralRewardAmount.toString());
        setMinWithdraw(s.minWithdrawalBalance.toString());
        setMinRefs(s.minApprovedReferrals.toString());
        setMaintenanceMode(s.isMaintenanceMode);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      if (err.message?.includes('403') || err.message?.includes('Unauthorized')) {
        setIsAuthenticated(false);
        setAdminToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAdminModal && isAuthenticated) {
      loadAdminData();
    }
  }, [showAdminModal, isAuthenticated, activeTab]);

  if (!showAdminModal) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.adminLogin(passwordInput);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setIsAuthenticated(true);
        showToast('Admin authenticated successfully', 'success');
      } else {
        setLoginError('Invalid password. Default: F@him78612345');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  // User Actions
  const handleBalanceAdjust = async () => {
    if (!adjustTargetUser) return;
    const amountNum = Number(adjustAmount);
    if (isNaN(amountNum)) {
      showToast('Invalid amount', 'error');
      return;
    }

    try {
      const res = await api.adjustBalance(adjustTargetUser.telegramUserId, amountNum, adjustReason);
      if (res.success) {
        showToast(`Balance updated to ${res.newBalance} iton`, 'success');
        setAdjustTargetUser(null);
        loadAdminData();
      } else {
        showToast('Adjustment failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Adjustment error', 'error');
    }
  };

  const handleToggleBlock = async (u: TelegramUser) => {
    const nextStatus = u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.toggleUserBlock(u.telegramUserId, nextStatus);
      showToast(`User ${nextStatus.toLowerCase()} successfully`, 'info');
      loadAdminData();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleToggleFlag = async (u: TelegramUser) => {
    const nextFlag = u.fraudStatus === 'FLAGGED' ? 'CLEAN' : 'FLAGGED';
    try {
      await api.toggleUserFlag(u.telegramUserId, nextFlag);
      showToast(`User fraud risk marked as ${nextFlag}`, 'info');
      loadAdminData();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  // Withdrawal Actions
  const handleApproveWithdrawal = async (id: string) => {
    try {
      await api.approveWithdrawal(id);
      showToast('Withdrawal approved', 'success');
      loadAdminData();
    } catch (err) {
      showToast('Approval failed', 'error');
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    const reason = prompt('Enter reason for rejection (balance will be refunded to user):', 'Invalid wallet address');
    if (!reason) return;
    try {
      await api.rejectWithdrawal(id, reason);
      showToast('Withdrawal rejected and balance refunded to user', 'info');
      loadAdminData();
    } catch (err) {
      showToast('Rejection failed', 'error');
    }
  };

  const handleMarkPaid = async (id: string) => {
    const txHash = prompt('Enter blockchain Transaction Hash (TxID):', `0x${Date.now().toString(16)}...`);
    try {
      await api.markWithdrawalPaid(id, txHash || undefined);
      showToast('Withdrawal marked as PAID with TxHash logged', 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to mark paid', 'error');
    }
  };

  // Referral Actions
  const handleApproveReferral = async (id: string) => {
    try {
      await api.approveReferral(id);
      showToast('Referral approved! +100 iton credited to referrer.', 'success');
      loadAdminData();
    } catch (err) {
      showToast('Approval failed', 'error');
    }
  };

  const handleRejectReferral = async (id: string) => {
    try {
      await api.rejectReferral(id);
      showToast('Referral rejected', 'info');
      loadAdminData();
    } catch (err) {
      showToast('Rejection failed', 'error');
    }
  };

  // Save Channels
  const handleSaveChannels = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings({
        channels: [
          { id: 'chan-1', name: ch1Name, username: ch1User, inviteLink: ch1Link, description: 'Official updates', isMandatory: true },
          { id: 'chan-2', name: ch2Name, username: ch2User, inviteLink: ch2Link, description: 'Global community', isMandatory: true },
          { id: 'chan-3', name: ch3Name, username: ch3User, inviteLink: ch3Link, description: 'Airdrops & alerts', isMandatory: true }
        ],
        paymentProofChannel: paymentProofChan,
        supportUsername: supportHandle
      });
      showToast('Channels & Support settings updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to save channel settings', 'error');
    }
  };

  // Save General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings({
        adRewardAmount: Number(adReward),
        dailyAdLimit: Number(dailyAdLimit),
        referralRewardAmount: Number(refReward),
        minWithdrawalBalance: Number(minWithdraw),
        minApprovedReferrals: Number(minRefs),
        isMaintenanceMode: maintenanceMode
      });
      showToast('App rules & reward settings saved!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-[#080d1a] border border-cyan-500/30 w-full max-w-2xl rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-white text-base">ITON EARN Console</h2>
              <p className="text-[11px] text-cyan-400 font-mono">Server-Side Admin Controller</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdminModal(false)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Authenticated: Password Screen */}
        {!isAuthenticated ? (
          <div className="p-6 max-w-sm mx-auto my-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Admin Authentication</h3>
              <p className="text-xs text-slate-400 mt-1">Enter your admin security passkey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Admin Password"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
              {loginError && <p className="text-rose-400 text-xs">{loginError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Sign In to Console
              </button>
            </form>
            <p className="text-[10px] text-slate-400">Default key: F@him78612345</p>
          </div>
        ) : (
          /* Authenticated Admin Console Body */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center space-x-1 p-2 bg-slate-900/80 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: RefreshCw },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
                { id: 'referrals', label: 'Referrals', icon: Users },
                { id: 'channels', label: 'Channels', icon: Radio },
                { id: 'settings', label: 'Settings', icon: SettingsIcon },
                { id: 'logs', label: 'Audit Logs', icon: FileText }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content View */}
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              {/* TAB 1: DASHBOARD STATS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Total Users</span>
                      <p className="text-xl font-extrabold text-white mt-1">
                        {dashboardStats?.totalUsers || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Active Users</span>
                      <p className="text-xl font-extrabold text-emerald-400 mt-1">
                        {dashboardStats?.activeUsers || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Distributed iton</span>
                      <p className="text-xl font-extrabold text-cyan-400 mt-1">
                        {dashboardStats?.totalDistributed?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Pending Payouts</span>
                      <p className="text-xl font-extrabold text-amber-400 mt-1">
                        {dashboardStats?.pendingWithdrawalsCount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Pending Referrals</span>
                      <p className="text-lg font-bold text-white mt-1">
                        {dashboardStats?.pendingReferralsCount || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Fraud Flagged Users</span>
                      <p className="text-lg font-bold text-rose-400 mt-1">
                        {dashboardStats?.flaggedUsersCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by ID, username or name..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-2">
                    {userList
                      .filter(u => 
                        u.telegramUserId.includes(userSearch) || 
                        (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
                        u.firstName.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map(u => (
                        <div
                          key={u.telegramUserId}
                          className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{u.firstName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {u.username ? `@${u.username}` : `UID: ${u.telegramUserId}`}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                  u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {u.status}
                              </span>
                              {u.fraudStatus === 'FLAGGED' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500 text-slate-950">
                                  FLAGGED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Balance: <span className="text-cyan-400 font-bold">{u.balance} iton</span> • Refs: {u.referralCount} • Earned: {u.totalEarned}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setAdjustTargetUser(u)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-[11px] font-semibold"
                            >
                              +/- Balance
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(u)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                                u.status === 'ACTIVE'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleFlag(u)}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                            >
                              Flag
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WITHDRAWAL MANAGEMENT */}
              {activeTab === 'withdrawals' && (
                <div className="space-y-2.5">
                  {withdrawals.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No withdrawal requests in queue.
                    </div>
                  ) : (
                    withdrawals.map(w => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{w.amount} iton</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-400 font-mono">
                              {w.method}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.status === 'PAID'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : w.status === 'REJECTED'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {w.status}
                            </span>
                          </div>

                          <p className="text-slate-400 text-[11px]">
                            User ID: <span className="font-mono text-white">{w.telegramUserId}</span>
                          </p>
                          <p className="text-slate-400 text-[11px] font-mono break-all">
                            Wallet: {w.walletAddress}
                          </p>
                          {w.transactionHash && (
                            <p className="text-cyan-400 text-[10px] font-mono">
                              TxID: {w.transactionHash}
                            </p>
                          )}
                        </div>

                        {/* Admin Action Buttons */}
                        {w.status === 'PENDING' && (
                          <div className="flex sm:flex-col gap-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleApproveWithdrawal(w.id)}
                              className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-[11px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(w.id)}
                              className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-[11px] font-bold"
                            >
                              Mark Paid
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectWithdrawal(w.id)}
                              className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[11px] font-bold"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        )}

                        {w.status === 'APPROVED' && (
                          <div className="self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(w.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                            >
                              Mark as Paid
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: REFERRAL APPROVAL QUEUE */}
              {activeTab === 'referrals' && (
                <div className="space-y-2.5">
                  {referrals.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No referral records found.
                    </div>
                  ) : (
                    referrals.map(ref => (
                      <div
                        key={ref.id}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">
                            Referrer: <span className="font-mono text-cyan-400">{ref.referrerUserId}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Invited: {ref.referredFirstName} (UID: {ref.referredUserId})
                          </p>
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ref.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : ref.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {ref.status}
                          </span>
                        </div>

                        {ref.status === 'PENDING' && (
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveReferral(ref.id)}
                              className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                            >
                              Approve (+{ref.rewardAmount})
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectReferral(ref.id)}
                              className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 text-xs hover:bg-rose-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: CHANNELS SETTINGS */}
              {activeTab === 'channels' && (
                <form onSubmit={handleSaveChannels} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">
                      Channel 1 (Mandatory Gate)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={ch1Name}
                        onChange={e => setCh1Name(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="@Username"
                        value={ch1User}
                        onChange={e => setCh1User(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Invite Link (https://t.me/...)"
                        value={ch1Link}
                        onChange={e => setCh1Link(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">
                      Channel 2 (Mandatory Gate)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={ch2Name}
                        onChange={e => setCh2Name(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="@Username"
                        value={ch2User}
                        onChange={e => setCh2User(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Invite Link (https://t.me/...)"
                        value={ch2Link}
                        onChange={e => setCh2Link(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">
                      Channel 3 (Mandatory Gate)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={ch3Name}
                        onChange={e => setCh3Name(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="@Username"
                        value={ch3User}
                        onChange={e => setCh3User(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Invite Link (https://t.me/...)"
                        value={ch3Link}
                        onChange={e => setCh3Link(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">
                      Proof Channel & Support
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Payment Proof Channel Link
                        </label>
                        <input
                          type="text"
                          value={paymentProofChan}
                          onChange={e => setPaymentProofChan(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Support Username
                        </label>
                        <input
                          type="text"
                          value={supportHandle}
                          onChange={e => setSupportHandle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                  >
                    Save All Channel Configurations
                  </button>
                </form>
              )}

              {/* TAB 6: SETTINGS & REWARD RULES */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider">
                      Reward Quantities & Limits
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Rewarded Ad Bonus (iton)
                        </label>
                        <input
                          type="number"
                          value={adReward}
                          onChange={e => setAdReward(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Daily Ad Limit (per user)
                        </label>
                        <input
                          type="number"
                          value={dailyAdLimit}
                          onChange={e => setDailyAdLimit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Referral Bonus (iton)
                        </label>
                        <input
                          type="number"
                          value={refReward}
                          onChange={e => setRefReward(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Min Withdrawal Balance
                        </label>
                        <input
                          type="number"
                          value={minWithdraw}
                          onChange={e => setMinWithdraw(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          Min Approved Referrals
                        </label>
                        <input
                          type="number"
                          value={minRefs}
                          onChange={e => setMinRefs(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          🔧 Maintenance Mode
                        </label>
                        <button
                          type="button"
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            maintenanceMode
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {maintenanceMode ? 'ENABLED (LOCKED)' : 'DISABLED (LIVE)'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                  >
                    Update Reward & System Rules
                  </button>
                </form>
              )}

              {/* TAB 7: AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-2">
                  {auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No admin actions recorded yet.
                    </div>
                  ) : (
                    auditLogs.map(log => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-400">{log.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {log.targetUserId && (
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Target User: <span className="font-mono">{log.targetUserId}</span>
                          </p>
                        )}
                        {log.details && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for Balance Adjustments */}
        {adjustTargetUser && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-white text-sm">
                Adjust Balance for {adjustTargetUser.firstName}
              </h3>
              <p className="text-xs text-slate-400">
                Current Balance: <span className="text-cyan-400 font-bold">{adjustTargetUser.balance} iton</span>
              </p>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Adjustment Amount (+ / - iton)
                </label>
                <input
                  type="number"
                  placeholder="+100 or -50"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Reason for Audit Log
                </label>
                <input
                  type="text"
                  placeholder="Reason..."
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustTargetUser(null)}
                  className="py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBalanceAdjust}
                  className="py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
                >
                  Apply Change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
