import React from 'react';
import { 
  Coins, 
  Sparkles, 
  Disc, 
  Users, 
  ArrowDownToLine, 
  History, 
  Trophy, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyBonusCard } from './DailyBonusCard';

export const HomeTab: React.FC = () => {
  const { 
    user, 
    setActiveTab, 
    setShowWithdrawModal, 
    setShowHistoryModal, 
    setShowLeaderboardModal, 
    setShowPaymentProofModal,
    settings 
  } = useApp();

  const quickActions = [
    {
      id: 'earn',
      label: 'Earn iton',
      desc: 'Watch ads & tasks',
      icon: Coins,
      color: 'from-cyan-500 to-blue-600',
      action: () => setActiveTab('earn')
    },
    {
      id: 'spin',
      label: 'Spin & Win',
      desc: 'Lucky reward wheel',
      icon: Disc,
      color: 'from-purple-500 to-pink-600',
      action: () => setActiveTab('spin')
    },
    {
      id: 'refer',
      label: 'Refer & Earn',
      desc: `+${settings?.referralRewardAmount || 100} iton / friend`,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      action: () => setActiveTab('refer')
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      desc: 'USDT & GRAM network',
      icon: ArrowDownToLine,
      color: 'from-amber-500 to-orange-600',
      action: () => setShowWithdrawModal(true)
    },
    {
      id: 'history',
      label: 'History',
      desc: 'Transaction ledger',
      icon: History,
      color: 'from-slate-700 to-slate-800',
      action: () => setShowHistoryModal(true)
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      desc: 'Top community earners',
      icon: Trophy,
      color: 'from-yellow-600 to-amber-700',
      action: () => setShowLeaderboardModal(true)
    },
    {
      id: 'payment_proof',
      label: 'Payment Proof',
      desc: 'Official channel logs',
      icon: ShieldCheck,
      color: 'from-blue-600 to-cyan-700',
      action: () => setShowPaymentProofModal(true)
    },
    {
      id: 'daily_bonus',
      label: 'Daily Bonus',
      desc: '7-day streak rewards',
      icon: Gift,
      color: 'from-indigo-500 to-violet-600',
      action: () => {
        const el = document.getElementById('daily-bonus-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Balance Card */}
      <div className="relative rounded-3xl p-5 overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#0c182f] via-[#0f2347] to-[#081224] shadow-2xl glow-cyan">
        {/* Glow orbs */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              YOUR BALANCE
            </span>
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Verified Ledger</span>
            </div>
          </div>

          <div className="flex items-baseline space-x-2 my-2">
            <h2 className="text-4xl font-extrabold font-heading text-white tracking-tight">
              {user ? user.balance.toLocaleString() : '0'}
            </h2>
            <span className="text-base font-bold text-cyan-400">iton</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/60 text-center">
            <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Total Earned</span>
              <span className="text-xs font-bold text-emerald-400">
                +{user?.totalEarned?.toLocaleString() || 0}
              </span>
            </div>

            <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Withdrawn</span>
              <span className="text-xs font-bold text-amber-400">
                {user?.totalWithdrawn?.toLocaleString() || 0}
              </span>
            </div>

            <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Referrals</span>
              <span className="text-xs font-bold text-cyan-400">
                {user?.referralCount || 0} Friends
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bonus Card Section */}
      <div id="daily-bonus-section">
        <DailyBonusCard />
      </div>

      {/* Main Feature Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider">
            Quick Actions
          </h3>
          <span className="text-[11px] text-cyan-400 font-medium">8 Services</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={action.action}
                className="group relative text-left p-3.5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs leading-tight">{action.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{action.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community Announcement Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900/80 border border-blue-500/20 flex items-center justify-between">
        <div className="space-y-0.5 pr-2">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Official Channel</span>
          <p className="text-xs font-semibold text-white">Join ITON Telegram Community</p>
          <p className="text-[11px] text-slate-400">Get early updates, drops & payment proof proofs.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const chan = settings?.channels?.[0]?.inviteLink || 'https://t.me/ItonEarnNews';
            if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
              (window as any).Telegram.WebApp.openTelegramLink(chan);
            } else {
              window.open(chan, '_blank');
            }
          }}
          className="shrink-0 p-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold active:scale-95 transition-all shadow-md shadow-cyan-500/20"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
