import React from 'react';
import { 
  User, 
  Coins, 
  ArrowDownToLine, 
  History, 
  Trophy, 
  ShieldCheck, 
  Headphones, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileTab: React.FC = () => {
  const { 
    user, 
    setShowWithdrawModal, 
    setShowHistoryModal, 
    setShowLeaderboardModal, 
    setShowPaymentProofModal,
    setShowAdminModal,
    settings,
    showToast 
  } = useApp();

  const [copiedId, setCopiedId] = React.useState(false);

  const supportHandle = settings?.supportUsername || '@ItonSupport';

  const handleCopyId = () => {
    if (user?.telegramUserId) {
      navigator.clipboard.writeText(user.telegramUserId);
      setCopiedId(true);
      showToast('Telegram ID copied', 'info');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleOpenSupport = () => {
    const cleanUsername = supportHandle.replace('@', '');
    const url = `https://t.me/${cleanUsername}`;
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Profile Header Card */}
      <div className="glass-card rounded-3xl p-5 border border-cyan-500/20 text-center relative overflow-hidden">
        <div className="relative inline-block mb-3">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName}
              className="w-20 h-20 rounded-3xl object-cover mx-auto border-2 border-cyan-400 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-extrabold text-2xl mx-auto shadow-xl">
              {user?.firstName?.slice(0, 1) || 'U'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0c1329]" />
        </div>

        <h2 className="text-lg font-bold font-heading text-white">
          {user?.firstName} {user?.lastName || ''}
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          {user?.username ? `@${user.username}` : 'Telegram Member'}
        </p>

        {/* Telegram ID pill */}
        <button
          type="button"
          onClick={handleCopyId}
          className="inline-flex items-center space-x-1.5 mt-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          <span>UID: {user?.telegramUserId}</span>
          {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>

        {/* Summary metrics row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase">Balance</span>
            <p className="text-xs font-bold text-white mt-0.5">{user?.balance || 0} iton</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase">Earned</span>
            <p className="text-xs font-bold text-emerald-400 mt-0.5">+{user?.totalEarned || 0}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase">Withdrawn</span>
            <p className="text-xs font-bold text-amber-400 mt-0.5">{user?.totalWithdrawn || 0}</p>
          </div>
        </div>
      </div>

      {/* Account Menu */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
        <button
          type="button"
          onClick={() => setShowWithdrawModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Withdrawal Portal</h4>
              <p className="text-[10px] text-slate-400">Request payouts to USDT or GRAM</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Transaction History</h4>
              <p className="text-[10px] text-slate-400">View complete earnings ledger</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => setShowLeaderboardModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Leaderboard</h4>
              <p className="text-[10px] text-slate-400">Global referral ranking</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          type="button"
          onClick={() => setShowPaymentProofModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Payment Proof Channel</h4>
              <p className="text-[10px] text-slate-400">Official telegram payment channel</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Support Section */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-sm">Need Help?</h3>
            <p className="text-xs text-slate-400">Official Support: {supportHandle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenSupport}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          <span>CONTACT SUPPORT ON TELEGRAM</span>
        </button>
      </div>

      {/* Admin Panel Trigger */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin Portal Login</span>
        </button>
      </div>
    </div>
  );
};
