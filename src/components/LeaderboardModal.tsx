import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Users, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { LeaderboardUser } from '../types';

export const LeaderboardModal: React.FC = () => {
  const { showLeaderboardModal, setShowLeaderboardModal } = useApp();
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showLeaderboardModal) {
      setLoading(true);
      api.getLeaderboard()
        .then(res => setLeaders(res.leaderboard))
        .catch(err => console.error('Error fetching leaderboard:', err))
        .finally(() => setLoading(false));
    }
  }, [showLeaderboardModal]);

  if (!showLeaderboardModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#0b1329] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto p-5 no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-white text-base">Top Referrers</h2>
              <p className="text-[11px] text-slate-400">Community leader rankings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLeaderboardModal(false)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Podium Top 3 */}
        {leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 my-4 pt-2">
            {/* Rank 2 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-end">
              <span className="text-xl mb-1">🥈</span>
              <p className="text-xs font-bold text-white truncate max-w-[80px]">
                {leaders[1].firstName}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {leaders[1].referralCount} refs
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">
                {leaders[1].totalEarned} iton
              </span>
            </div>

            {/* Rank 1 */}
            <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-500/10 to-slate-900 border border-amber-500/30 text-center flex flex-col items-center justify-end scale-105 shadow-md shadow-amber-500/10">
              <span className="text-2xl mb-1">🥇</span>
              <p className="text-xs font-extrabold text-amber-300 truncate max-w-[80px]">
                {leaders[0].firstName}
              </p>
              <span className="text-[10px] text-amber-200/90 font-bold mt-0.5">
                {leaders[0].referralCount} refs
              </span>
              <span className="text-[10px] text-amber-400 font-extrabold">
                {leaders[0].totalEarned} iton
              </span>
            </div>

            {/* Rank 3 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-end">
              <span className="text-xl mb-1">🥉</span>
              <p className="text-xs font-bold text-white truncate max-w-[80px]">
                {leaders[2].firstName}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {leaders[2].referralCount} refs
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">
                {leaders[2].totalEarned} iton
              </span>
            </div>
          </div>
        )}

        {/* Full Ranks List */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading leaderboard...</span>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {leaders.map((u, i) => (
              <div
                key={u.telegramUserId}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-center font-bold text-slate-400">
                    #{u.rank}
                  </span>
                  <div>
                    <h4 className="font-semibold text-white leading-tight">
                      {u.firstName}
                    </h4>
                    <p className="text-[10px] text-slate-400">{u.username}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-cyan-400 block">
                    {u.referralCount} Referrals
                  </span>
                  <span className="text-[10px] text-slate-400">
                    +{u.totalEarned.toLocaleString()} iton
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
