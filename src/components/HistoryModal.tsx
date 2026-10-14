import React, { useState, useEffect } from 'react';
import { X, History, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Transaction } from '../types';

export const HistoryModal: React.FC = () => {
  const { showHistoryModal, setShowHistoryModal, user } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions();
      setTransactions(res.transactions);
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showHistoryModal) {
      loadHistory();
    }
  }, [showHistoryModal, user?.balance]);

  if (!showHistoryModal) return null;

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'ALL') return true;
    if (filter === 'ADS') return tx.type === 'AD_REWARD';
    if (filter === 'SPINS') return tx.type === 'SPIN_REWARD';
    if (filter === 'REFERRALS') return tx.type === 'REFERRAL_REWARD';
    if (filter === 'WITHDRAWALS') return tx.type.startsWith('WITHDRAWAL');
    if (filter === 'BONUS') return tx.type === 'DAILY_BONUS';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#0b1329] border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto p-5 no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-white text-base">Transaction History</h2>
              <p className="text-[11px] text-slate-400">Complete balance ledger activity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHistoryModal(false)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-3 no-scrollbar text-xs">
          {['ALL', 'ADS', 'SPINS', 'REFERRALS', 'BONUS', 'WITHDRAWALS'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filter === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Transaction Ledger Records */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading ledger records...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
            No transactions found for this filter.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map(tx => {
              const isPositive = tx.amount > 0;
              const isNegative = tx.amount < 0;
              const dateObj = new Date(tx.createdAt);
              const formattedDate = dateObj.toLocaleDateString();
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl glass-card border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : isNegative
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-white leading-tight">
                        {tx.description}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formattedDate} • {formattedTime} • <span className="font-mono text-slate-500">{tx.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-heading font-bold text-xs ${
                        isPositive
                          ? 'text-emerald-400'
                          : isNegative
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} iton
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Bal: {tx.balanceAfter} iton
                    </span>
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
