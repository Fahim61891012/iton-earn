import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, CheckCircle2, Clock, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const DailyBonusCard: React.FC = () => {
  const { user, refreshUser, showToast } = useApp();
  const [isClaiming, setIsClaiming] = useState(false);
  const [bonusStatus, setBonusStatus] = useState<{
    canClaim: boolean;
    streak: number;
    nextReward: number;
    timeRemainingSeconds: number;
    rewards: number[];
  } | null>(null);

  const [remainingTime, setRemainingTime] = useState<number>(0);

  const fetchStatus = async () => {
    try {
      const data = await api.getDailyBonusStatus();
      setBonusStatus(data);
      setRemainingTime(data.timeRemainingSeconds || 0);
    } catch (err) {
      console.error('Failed to fetch daily bonus status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user?.lastDailyBonusClaimedAt]);

  // Countdown timer interval
  useEffect(() => {
    if (remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          fetchStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handleClaim = async () => {
    if (isClaiming || !bonusStatus?.canClaim) return;
    setIsClaiming(true);

    try {
      const res = await api.claimDailyBonus();
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(res.message, 'success');
        await refreshUser();
        await fetchStatus();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error claiming bonus', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  const streakDays = [
    { day: 1, reward: 5 },
    { day: 2, reward: 10 },
    { day: 3, reward: 15 },
    { day: 4, reward: 20 },
    { day: 5, reward: 30 },
    { day: 6, reward: 40 },
    { day: 7, reward: 100, isJackpot: true }
  ];

  const currentStreak = bonusStatus?.streak || user?.dailyBonusStreak || 0;
  const activeDayIndex = currentStreak % 7; // 0 to 6

  return (
    <div className="glass-card rounded-2xl p-4 border border-cyan-500/20 relative overflow-hidden mb-4">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Gift className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-sm">7-Day Bonus Streak</h3>
            <p className="text-[11px] text-slate-400">Claim daily to multiply your iton</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Streak: {currentStreak} Days</span>
        </div>
      </div>

      {/* Streak 7-Day Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-3.5">
        {streakDays.map((item, idx) => {
          const isCompleted = idx < activeDayIndex;
          const isActive = idx === activeDayIndex && bonusStatus?.canClaim;
          const isLocked = idx > activeDayIndex || (idx === activeDayIndex && !bonusStatus?.canClaim);

          return (
            <div
              key={item.day}
              className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl text-center border transition-all ${
                isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/30 scale-105'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-70'
              }`}
            >
              <span className="text-[10px] font-semibold text-slate-400">D{item.day}</span>

              <div className="my-1">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                ) : item.isJackpot ? (
                  <Crown className="w-4 h-4 text-amber-400 mx-auto animate-bounce" />
                ) : (
                  <Gift className="w-3.5 h-3.5 text-cyan-400 mx-auto" />
                )}
              </div>

              <span className={`text-[10px] font-bold ${item.isJackpot ? 'text-amber-400' : 'text-white'}`}>
                +{item.reward}
              </span>
            </div>
          );
        })}
      </div>

      {/* Claim Action Button or Cooldown Notice */}
      {bonusStatus?.canClaim ? (
        <button
          type="button"
          onClick={handleClaim}
          disabled={isClaiming}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-slate-950 font-bold text-xs tracking-wider uppercase hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-md shadow-cyan-500/25 disabled:opacity-50"
        >
          {isClaiming ? (
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Claiming Reward...</span>
            </div>
          ) : (
            <>
              <Gift className="w-3.5 h-3.5 text-slate-950" />
              <span>Claim Today's Bonus (+{bonusStatus.nextReward} iton)</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next bonus unlocks in:</span>
          <span className="font-mono font-bold text-cyan-300">
            {formatCountdown(remainingTime)}
          </span>
        </div>
      )}
    </div>
  );
};
