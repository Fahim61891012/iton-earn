import React from 'react';
import { X, ShieldCheck, ExternalLink, CheckCircle2, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PaymentProofModal: React.FC = () => {
  const { showPaymentProofModal, setShowPaymentProofModal, settings } = useApp();

  if (!showPaymentProofModal) return null;

  const proofChannel = settings?.paymentProofChannel || 'https://t.me/ItonEarnProofs';

  const handleOpenChannel = () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(proofChannel);
    } else {
      window.open(proofChannel, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#0b1329] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto p-5 no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-white text-base">Payment Proofs</h2>
              <p className="text-[11px] text-slate-400">Public blockchain transaction ledger</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPaymentProofModal(false)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Banner */}
        <div className="my-5 p-5 rounded-3xl glass-card border border-cyan-500/30 text-center space-y-3 glow-cyan">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Send className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Official Payout Broadcast Channel
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Every approved withdrawal is broadcasted to our public channel with transaction hashes.
            </p>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-left space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Transparent on-chain transactions</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time transaction receipts & TxIDs</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified BSC and TON network payouts</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenChannel}
            className="w-full py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>VIEW PAYMENT PROOFS ON TELEGRAM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
