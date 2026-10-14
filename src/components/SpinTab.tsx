import React, { useState, useRef } from 'react';
import { Disc, Play, Sparkles, Trophy, Tv, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const SpinTab: React.FC = () => {
  const { user, refreshUser, showToast, settings } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [unlockingWithAd, setUnlockingWithAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [lastWin, setLastWin] = useState<{ reward: number; message: string } | null>(null);

  const wheelRef = useRef<HTMLDivElement>(null);

  const rewards = settings?.spinRewards || [0, 5, 10, 20, 30, 50, 100];
  const sliceCount = rewards.length;
  const sliceAngle = 360 / sliceCount;

  // Colors for slices
  const sliceColors = [
    '#334155', // 0: slate
    '#06b6d4', // 5: cyan
    '#3b82f6', // 10: blue
    '#8b5cf6', // 20: violet
    '#ec4899', // 30: pink
    '#10b981', // 50: emerald
    '#f59e0b'  // 100: amber
  ];

  // Watch Ad & Unlock Spin
  const handleWatchAdToUnlock = async () => {
    if (unlockingWithAd || isSpinning) return;

    setUnlockingWithAd(true);
    setAdProgress(0);

    const durationMs = 4000;
    const stepMs = 100;
    let elapsed = 0;

    const interval = setInterval(async () => {
      elapsed += stepMs;
      const pct = Math.min(100, Math.floor((elapsed / durationMs) * 100));
      setAdProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        try {
          const res = await api.unlockSpin();
          setUnlockingWithAd(false);
          if (res.success) {
            showToast('🎉 Rewarded ad completed! +1 Spin Unlocked.', 'success');
            await refreshUser();
          } else {
            showToast('Could not unlock spin', 'error');
          }
        } catch (err: any) {
          setUnlockingWithAd(false);
          showToast(err.message || 'Error unlocking spin', 'error');
        }
      }
    }, stepMs);
  };

  // Perform Server Authoritative Spin
  const handleSpin = async () => {
    if (isSpinning || (user?.spinsAvailable || 0) <= 0) return;

    setIsSpinning(true);
    setLastWin(null);

    try {
      const res = await api.spinWheel();
      if (!res.success) {
        setIsSpinning(false);
        showToast(res.message, 'error');
        return;
      }

      // Calculate target angle to point pointer to chosen slice index
      // Pointer is at top (270 or 0 deg depending on orientation)
      const targetSlice = res.sliceIndex;
      const extraSpins = 5 * 360; // 5 full rotations
      const targetAngleInCircle = (targetSlice * sliceAngle) + (sliceAngle / 2);
      // Invert angle for clockwise rotation: 360 - angle
      const finalDeg = rotationDegree + extraSpins + (360 - (rotationDegree % 360)) + (360 - targetAngleInCircle);

      setRotationDegree(finalDeg);

      // Wait for spin animation duration (4s)
      setTimeout(async () => {
        setIsSpinning(false);
        setLastWin({ reward: res.reward, message: res.message });

        if (res.reward > 0) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        await refreshUser();
      }, 4000);

    } catch (err: any) {
      setIsSpinning(false);
      showToast(err.message || 'Spin execution failed', 'error');
    }
  };

  const spinsAvailable = user?.spinsAvailable || 0;

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold font-heading text-white">🎡 SPIN & WIN</h2>
        <p className="text-xs text-slate-400 mt-0.5">Spin the lucky wheel for instant iton token rewards</p>
      </div>

      {/* Wheel Card */}
      <div className="glass-card rounded-3xl p-5 border border-cyan-500/20 relative overflow-hidden flex flex-col items-center">
        {/* Spins available badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Available Spins:</span>
          <span className="text-amber-400 font-bold">{spinsAvailable}</span>
        </div>

        {/* Wheel container with pointer */}
        <div className="relative w-64 h-64 my-2 flex items-center justify-center">
          {/* Outer glowing ring */}
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/40 glow-cyan pointer-events-none" />

          {/* Top Indicator Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-md" />

          {/* Rotating Canvas/SVG Wheel */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full overflow-hidden shadow-2xl relative transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotationDegree}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {rewards.map((reward, i) => {
                const startAngle = (i * 360) / sliceCount;
                const endAngle = ((i + 1) * 360) / sliceCount;

                // SVG slice path math
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const textAngle = startAngle + sliceAngle / 2;
                const tx = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                const ty = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                return (
                  <g key={i}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={sliceColors[i % sliceColors.length]}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                    >
                      {reward === 0 ? '0' : `+${reward}`}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-lg flex items-center justify-center">
              <Disc className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
        </div>

        {/* Ad Progress Bar if unlocking */}
        {unlockingWithAd && (
          <div className="w-full my-3 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-cyan-300 font-medium">Playing Sponsor Video to Unlock Spin...</span>
              <span className="font-mono text-cyan-400 font-bold">{adProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${adProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Win Announcement Modal/Banner */}
        {lastWin && (
          <div className="w-full my-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 text-center animate-in zoom-in-95 duration-200">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="font-bold text-sm text-white">{lastWin.message}</p>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="w-full space-y-2.5 mt-4">
          {spinsAvailable > 0 ? (
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSpinning ? (
                <span>Wheel is Spinning...</span>
              ) : (
                <>
                  <Disc className="w-4 h-4" />
                  <span>SPIN NOW ({spinsAvailable} Left)</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleWatchAdToUnlock}
              disabled={unlockingWithAd || isSpinning}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {unlockingWithAd ? (
                <span>Watching Advertisement...</span>
              ) : (
                <>
                  <Tv className="w-4 h-4" />
                  <span>WATCH AD & UNLOCK SPIN</span>
                </>
              )}
            </button>
          )}

          <p className="text-[11px] text-center text-slate-400">
            Rewards are randomly generated server-side. Probability: 0 to 100 iton.
          </p>
        </div>
      </div>
    </div>
  );
};
