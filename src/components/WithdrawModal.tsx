import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownToLine, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Withdrawal, WithdrawalMethod } from '../types';

export const WithdrawModal: React.FC = () => {
  const { 
    showWithdrawModal, 
    setShowWithdrawModal, 
    user, 
    refreshUser, 
    showToast, 
    settings 
  } = useApp();

  const [method, setMethod] = useState<WithdrawalMethod>('USDT_BEP20');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [referralsCount, setReferralsCount] = useState<number>(0);

  const minBalance = settings?.minWithdrawalBalance || 1000;
  const minApprovedRefs = settings?.minApprovedReferrals || 2;

  // Load history and referral stats
  const loadWithdrawalData = async () => {
    try {
      setLoadingHistory(true);
      const [wRes, rRes] = await Promise.all([
        api.getWithdrawals(),
        api.getReferrals()
      ]);
      setWithdrawals(wRes.withdrawals);
      setReferralsCount(rRes.approvedCount);
    } catch (err) {
      console.error('Failed to load withdrawal details:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (showWithdrawModal) {
      loadWithdrawalData();
    }
  }, [showWithdrawModal]);

  if (!showWithdrawModal) return null;

  const userBalance = user?.balance || 0;
  const hasMinBalance = userBalance >= minBalance;
  const hasMinReferrals = referralsCount >= minApprovedRefs;
  const isEligible = hasMinBalance && hasMinReferrals;

  const handleMaxClick = () => {
    setAmount(userBalance.toString());
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEligible) {
      if (!hasMinBalance) {
        showToast(`Minimum withdrawal balance is ${minBalance} iton`, 'error');
      } else {
        showToast(`Minimum ${minApprovedRefs} approved referrals required to withdraw.`, 'error');
      }
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < minBalance) {
      showToast(`Amount must be at least ${minBalance} iton`, 'error');
      return;
    }

    if (numAmount > userBalance) {
      showToast('Insufficient iton balance', 'error');
      return;
    }

    if (!walletAddress.trim() || walletAddress.trim().length < 8) {
      showToast('Please enter a valid wallet address', 'error');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmWithdrawal = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitWithdrawal({
        method,
        walletAddress: walletAddress.trim(),
        amount: Number(amount)
      });

      if (res.success) {
        showToast(res.message, 'success');
        setShowConfirm(false);
        setAmount('');
        setWalletAddress('');
        await refreshUser();
        await loadWithdrawalData();
      } else {
        showToast(res.error || res.message || 'Withdrawal failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting withdrawal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#0b1329] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-white text-base">Withdraw iton</h2>
              <p className="text-[11px] text-slate-400">Direct transfer to your crypto wallet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowWithdrawModal(false);
              setShowConfirm(false);
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Withdrawal Eligibility Checklist Card */}
        <div className="my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>WITHDRAWAL REQUIREMENTS</span>
            <span className={isEligible ? 'text-emerald-400' : 'text-amber-400'}>
              {isEligible ? 'Eligible' : 'Not Eligible'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {/* Req 1: Minimum Balance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasMinBalance ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className={hasMinBalance ? 'text-slate-200' : 'text-slate-400'}>
                  Minimum balance: {minBalance.toLocaleString()} iton
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                ({userBalance.toLocaleString()} iton)
              </span>
            </div>

            {/* Req 2: Minimum Approved Referrals */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasMinReferrals ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className={hasMinReferrals ? 'text-slate-200' : 'text-slate-400'}>
                  Minimum {minApprovedRefs} approved referrals
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                ({referralsCount}/{minApprovedRefs} approved)
              </span>
            </div>
          </div>

          {!isEligible && (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start space-x-1.5 mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {!hasMinBalance && !hasMinReferrals
                  ? `You need at least ${minBalance} iton and ${minApprovedRefs} approved referrals to withdraw.`
                  : !hasMinBalance
                  ? `Accumulate ${minBalance - userBalance} more iton to reach the minimum balance.`
                  : `Minimum ${minApprovedRefs} approved referrals required. Invite friends in the Refer tab.`}
              </span>
            </div>
          )}
        </div>

        {/* Withdrawal Form */}
        {!showConfirm ? (
          <form onSubmit={handleInitialSubmit} className="space-y-3.5">
            {/* Network / Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Payout Network
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('USDT_BEP20')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    method === 'USDT_BEP20'
                      ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">USDT (BEP20)</div>
                  <div className="text-[10px] text-slate-400">BNB Smart Chain</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('GRAM')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    method === 'GRAM'
                      ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">GRAM (TON)</div>
                  <div className="text-[10px] text-slate-400">The Open Network</div>
                </button>
              </div>
            </div>

            {/* Wallet Address Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Destination Wallet Address
              </label>
              <input
                type="text"
                placeholder={method === 'USDT_BEP20' ? '0x...' : 'EQ... / UQ...'}
                value={walletAddress}
                onChange={e => setWalletAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Withdrawal Amount (iton)
                </label>
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                >
                  MAX ({userBalance} iton)
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder={`Min ${minBalance}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={minBalance}
                  max={userBalance}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-3.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  iton
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isEligible}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Confirmation
            </button>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                Confirm Withdrawal Details
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Method / Network</span>
                  <span className="font-semibold text-white">
                    {method === 'USDT_BEP20' ? 'USDT (BEP20 Network)' : 'GRAM (TON Network)'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-bold text-amber-400">{amount} iton</span>
                </div>

                <div className="py-1 border-b border-slate-800">
                  <span className="text-slate-400 block mb-1">Destination Address:</span>
                  <span className="font-mono text-[11px] text-white break-all block bg-slate-950 p-2 rounded-lg">
                    {walletAddress}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-slate-400 text-[11px]">
                  <span>Status on submit:</span>
                  <span className="text-cyan-400 font-semibold">Pending Admin Review</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdrawal}
                disabled={submitting}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>CONFIRM WITHDRAWAL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Withdrawal History Section */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <h3 className="font-heading font-bold text-xs text-slate-300 uppercase tracking-wider mb-2.5">
            Your Withdrawal History
          </h3>

          {loadingHistory ? (
            <div className="p-4 text-center text-xs text-slate-500">Loading history...</div>
          ) : withdrawals.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl">
              No withdrawal requests submitted yet
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map(w => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{w.amount} iton</span>
                      <span className="text-[10px] text-slate-400">({w.method})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                      {w.walletAddress}
                    </p>
                    {w.transactionHash && (
                      <p className="text-[10px] text-cyan-400 font-mono truncate max-w-[180px]">
                        Tx: {w.transactionHash}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      w.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : w.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : w.status === 'APPROVED'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
