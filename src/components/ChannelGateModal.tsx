import React, { useState } from 'react';
import { Send, ShieldCheck, ArrowRight, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export const ChannelGateModal: React.FC = () => {
  const { user, settings, verifyMembership, showToast } = useApp();
  const [verifying, setVerifying] = useState(false);
  const [clickedChannels, setClickedChannels] = useState<Record<string, boolean>>({});

  if (!user || user.channelsJoined) return null;

  const channels = settings?.channels.filter(c => c.isMandatory) || [];

  const handleChannelClick = (channelId: string, url: string) => {
    setClickedChannels(prev => ({ ...prev, [channelId]: true }));
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const verified = await verifyMembership();
      if (verified) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Verification failed. Please ensure you joined all 3 channels.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const clickedCount = Object.keys(clickedChannels).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#080d1a] flex flex-col justify-between p-5 overflow-y-auto">
      <div className="max-w-md mx-auto w-full my-auto py-6">
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-emerald-500/20 border border-cyan-500/30 glow-cyan mb-4">
            <ShieldCheck className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Join Our Channels To Continue
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            ITON EARN অ্যাপে প্রবেশের পূর্বে আপনাকে নিচের ৩টি অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন হতে হবে।
          </p>
        </div>

        {/* Progress tracker */}
        <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800/80 mb-5 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>চ্যানেল জয়েন অগ্রগতি:</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {clickedCount} / {channels.length} টি ভিজিট সম্পন্ন
          </span>
        </div>

        {/* Channels Cards */}
        <div className="space-y-3 mb-6">
          {channels.map((chan, idx) => {
            const isVisited = clickedChannels[chan.id];
            return (
              <div
                key={chan.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isVisited
                    ? 'bg-slate-900/80 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm leading-tight">{chan.name}</h3>
                      <p className="text-xs text-slate-400">{chan.username}</p>
                    </div>
                  </div>
                  {isVisited && (
                    <span className="flex items-center text-emerald-400 text-xs font-medium space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Visited</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-3">{chan.description}</p>

                <button
                  type="button"
                  onClick={() => handleChannelClick(chan.id, chan.inviteLink)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                    isVisited
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isVisited ? 'RE-OPEN CHANNEL' : 'JOIN CHANNEL'}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Security / Anti-Bypass Note */}
        <div className="flex items-start space-x-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            যাচাইকরণ আমাদের টেলিগ্রাম বটের মাধ্যমে স্বয়ংক্রিয়ভাবে করা হবে। কোনো চ্যানেল বাদ পড়লে অ্যাপ আনলক হবে না।
          </span>
        </div>

        {/* Verify Action */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {verifying ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>চ্যানেল সদস্যপদ যাচাই হচ্ছে...</span>
            </div>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>VERIFY MEMBERSHIP / যাচাই করে প্রবেশ করুন</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
