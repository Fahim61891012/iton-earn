import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Referral } from '../types';

export const ReferTab: React.FC = () => {
  const { user, showToast, settings } = useApp();
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<{
    referrals: Referral[];
    totalInvited: number;
    approvedCount: number;
    pendingCount: number;
    totalEarnings: number;
    inviteLink: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await api.getReferrals();
      setReferralData(data);
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, [user]);

  const botUsername = settings?.botUsername || 'ItonEarnBot';
  const inviteLink = `https://t.me/${botUsername}?start=ref_${user?.telegramUserId || '100001'}`;
  const rewardAmount = settings?.referralRewardAmount || 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(
      `🎁 Join ITON EARN! Complete tasks, watch ads, spin & win, and collect iton tokens. Use my invitation link to join:`
    );
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${text}`;
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold font-heading text-white">👥 REFER & EARN</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Invite friends and earn +{rewardAmount} iton for every qualified member
        </p>
      </div>

      {/* Referral Link & Share Card */}
      <div className="glass-card rounded-3xl p-5 border border-cyan-500/20 glow-cyan">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Your Unique Referral Link
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            +{rewardAmount} iton / referral
          </span>
        </div>

        {/* Link Input Box */}
        <div className="flex items-center bg-slate-900/90 rounded-2xl border border-slate-700/80 p-2 mb-3">
          <input
            type="text"
            readOnly
            value={inviteLink}
            className="bg-transparent text-xs text-slate-200 px-2 w-full focus:outline-none font-mono truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 p-2 rounded-xl bg-slate-800 text-cyan-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'COPIED' : 'COPY LINK'}</span>
          </button>

          <button
            type="button"
            onClick={handleTelegramShare}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>SHARE ON TELEGRAM</span>
          </button>
        </div>
      </div>

      {/* Referral Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass-card rounded-2xl p-3.5 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Total Invited</span>
          <span className="text-xl font-bold font-heading text-white">
            {referralData?.totalInvited ?? (user?.referralCount || 0)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Friends joined</span>
        </div>

        <div className="glass-card rounded-2xl p-3.5 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Referral Earnings</span>
          <span className="text-xl font-bold font-heading text-emerald-400">
            +{referralData?.totalEarnings ?? (user?.referralEarnings || 0)} iton
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Approved rewards</span>
        </div>

        <div className="glass-card rounded-2xl p-3.5 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Approved Referrals</span>
          <span className="text-xl font-bold font-heading text-cyan-400">
            {referralData?.approvedCount ?? 0}
          </span>
          <span className="text-[10px] text-emerald-400/80 block mt-0.5">Eligible members</span>
        </div>

        <div className="glass-card rounded-2xl p-3.5 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Pending Review</span>
          <span className="text-xl font-bold font-heading text-amber-400">
            {referralData?.pendingCount ?? 0}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting channel join</span>
        </div>
      </div>

      {/* How Referrals Work Guide */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Referral Qualification Steps</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] pl-1">
          <li>Friend opens ITON EARN bot through your referral link.</li>
          <li>Friend joins all 3 required Telegram channels.</li>
          <li>Once onboarding is verified, referral status is updated and +{rewardAmount} iton is granted.</li>
        </ol>
      </div>

      {/* Referrals List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider">
            Referred Friends
          </h3>
          <span className="text-[11px] text-cyan-400 font-medium">
            {referralData?.referrals?.length || 0} Records
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading referral list...</span>
          </div>
        ) : !referralData?.referrals || referralData.referrals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No referrals yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Share your invitation link with friends to start earning!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {referralData.referrals.map(ref => (
              <div
                key={ref.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    {ref.referredFirstName.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-tight">
                      {ref.referredFirstName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {ref.referredUsername ? `@${ref.referredUsername}` : `ID: ${ref.referredUserId.slice(0, 5)}...`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ref.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : ref.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {ref.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                    {ref.status === 'PENDING' && <Clock className="w-3 h-3" />}
                    {ref.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                    <span>{ref.status}</span>
                  </span>
                  <span className="block text-[10px] font-bold text-cyan-400 mt-0.5">
                    +{ref.rewardAmount} iton
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
