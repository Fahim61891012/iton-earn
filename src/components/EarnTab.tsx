import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Tv, 
  AlertCircle,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Task } from '../types';

export const EarnTab: React.FC = () => {
  const { user, refreshUser, showToast, settings } = useApp();
  const [tasks, setTasks] = useState<(Task & { isCompleted: boolean })[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adInProgress, setAdInProgress] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Fetch tasks
  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await api.getTasks();
      setTasks(res.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Ad cooldown ticker
  useEffect(() => {
    if (!user?.adCooldownUntil) {
      setCooldownRemaining(0);
      return;
    }

    const checkCooldown = () => {
      const diff = new Date(user.adCooldownUntil!).getTime() - Date.now();
      if (diff > 0) {
        setCooldownRemaining(Math.ceil(diff / 1000));
      } else {
        setCooldownRemaining(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [user?.adCooldownUntil]);

  // Handle Watch Ad & Earn Flow
  const handleWatchAd = async () => {
    if (adLoading || adInProgress || cooldownRemaining > 0) return;

    if ((user?.adsWatchedToday || 0) >= (settings?.dailyAdLimit || 15)) {
      showToast(`Daily limit of ${settings?.dailyAdLimit || 15} ads reached. Check back tomorrow!`, 'info');
      return;
    }

    try {
      setAdLoading(true);
      const session = await api.startRewardedAd();
      setAdLoading(false);
      setAdInProgress(true);
      setAdProgress(0);

      // Simulate official Monetag rewarded duration (e.g. 5 seconds for interactive preview)
      const durationMs = 5000;
      const stepMs = 100;
      let elapsed = 0;

      const timer = setInterval(async () => {
        elapsed += stepMs;
        const pct = Math.min(100, Math.floor((elapsed / durationMs) * 100));
        setAdProgress(pct);

        if (elapsed >= durationMs) {
          clearInterval(timer);
          try {
            const result = await api.completeRewardedAd(session.sessionId);
            setAdInProgress(false);
            if (result.success) {
              confetti({
                particleCount: 70,
                spread: 60,
                origin: { y: 0.6 }
              });
              showToast(result.message, 'success');
              await refreshUser();
            } else {
              showToast(result.message, 'error');
            }
          } catch (e: any) {
            setAdInProgress(false);
            showToast(e.message || 'Ad verification error', 'error');
          }
        }
      }, stepMs);

    } catch (err: any) {
      setAdLoading(false);
      showToast(err.message || 'Ad unavailable. Please try again later.', 'error');
    }
  };

  const handleCompleteTask = async (task: Task & { isCompleted: boolean }) => {
    if (task.isCompleted || completingTaskId) return;

    // Open task external URL if present
    if (task.actionUrl) {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openLink) {
        (window as any).Telegram.WebApp.openLink(task.actionUrl);
      } else {
        window.open(task.actionUrl, '_blank');
      }
    }

    setCompletingTaskId(task.id);
    try {
      // Simulate brief action verification delay
      setTimeout(async () => {
        const res = await api.completeTask(task.id);
        setCompletingTaskId(null);
        if (res.success) {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 }
          });
          showToast(res.message, 'success');
          await refreshUser();
          await loadTasks();
        } else {
          showToast(res.message, 'error');
        }
      }, 1500);
    } catch (err: any) {
      setCompletingTaskId(null);
      showToast(err.message || 'Failed to complete task', 'error');
    }
  };

  const adsWatched = user?.adsWatchedToday || 0;
  const maxAds = settings?.dailyAdLimit || 15;
  const rewardPerAd = settings?.adRewardAmount || 10;

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-white">Earn iton</h2>
          <p className="text-xs text-slate-400">Complete tasks & watch rewarded ads to earn tokens</p>
        </div>
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Flame className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* Rewarded Ad Card */}
      <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 relative overflow-hidden glow-cyan">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-white text-sm">Monetag Rewarded Ads</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  +{rewardPerAd} iton
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Watch the advertisement and receive your reward</p>
            </div>
          </div>
        </div>

        {/* Ad Progress Bar if active */}
        {adInProgress && (
          <div className="my-3 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-cyan-300 font-medium flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Playing Monetag Rewarded Sponsor...</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{adProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${adProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-900/50 border border-slate-800/80 mb-3 text-slate-300">
          <span>Today's Ads:</span>
          <span className="font-semibold text-white">
            {adsWatched} / {maxAds} Watched
          </span>
        </div>

        {/* Action Button */}
        {cooldownRemaining > 0 ? (
          <div className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-semibold">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Ad Cooldown Active:</span>
            <span className="font-mono text-cyan-300 font-bold">{cooldownRemaining}s</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleWatchAd}
            disabled={adLoading || adInProgress || adsWatched >= maxAds}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-slate-950 font-bold text-xs tracking-wider uppercase hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            {adLoading ? (
              <span>Loading Advertisement...</span>
            ) : adInProgress ? (
              <span>Watching Sponsor Video...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>🎬 WATCH AD & EARN (+{rewardPerAd} iton)</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center space-x-1.5 mt-2.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Server-verified legitimate rewarded ads. No fake clicks or redirects.</span>
        </div>
      </div>

      {/* Daily Tasks List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider">
            Daily Tasks
          </h3>
          <span className="text-[11px] text-cyan-400 font-medium">Reset Daily</span>
        </div>

        {loadingTasks ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading active tasks...</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map(task => {
              const isBusy = completingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl glass-card border transition-all ${
                    task.isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-xs leading-tight">{task.title}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          +{task.reward} iton
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{task.description}</p>
                    </div>

                    {task.isCompleted ? (
                      <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCompleteTask(task)}
                        disabled={isBusy}
                        className="py-1.5 px-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 active:scale-95 transition-all shadow-sm shadow-cyan-500/20 shrink-0 flex items-center space-x-1 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <span>Checking...</span>
                        ) : (
                          <>
                            <span>Complete</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
