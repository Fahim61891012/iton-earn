import React, { useState } from 'react';
import { Coins, ShieldAlert, Sparkles, UserCheck, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopNav: React.FC = () => {
  const { user, setShowAdminModal, isTelegramEnvironment, switchTestUser } = useApp();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand & User identity */}
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-md shadow-cyan-500/20">
                {user?.firstName?.slice(0, 1) || 'I'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#080d1a]" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-extrabold text-sm text-white tracking-wide">
                ITON EARN
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight truncate max-w-[120px]">
              Hi, {user?.firstName || 'Earner'}
            </p>
          </div>
        </div>

        {/* Right side: Balance badge, test switcher, admin button */}
        <div className="flex items-center space-x-2">
          {/* Compact Balance Pill */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-inner">
            <Coins className="w-4 h-4 text-cyan-400" />
            <span className="font-heading font-bold text-white text-xs">
              {user ? user.balance.toLocaleString() : 0}
            </span>
            <span className="text-[10px] font-semibold text-cyan-400">iton</span>
          </div>

          {/* Dev Test User Switcher (only shown when testing outside Telegram) */}
          {!isTelegramEnvironment && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                title="Switch test user"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                    Test User Switcher
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      switchTestUser('100001');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <span>User 1 (Alex)</span>
                    <span className="text-[10px] text-cyan-400">2,850 iton</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchTestUser('100002');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <span>User 2 (Elena)</span>
                    <span className="text-[10px] text-cyan-400">1,420 iton</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchTestUser('100003');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <span>User 3 (Rahim)</span>
                    <span className="text-[10px] text-cyan-400">950 iton</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = (Date.now() % 100000).toString();
                      switchTestUser(newId);
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-emerald-400 hover:bg-emerald-950/40 rounded-lg"
                  >
                    + New Fresh User
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin Access Button */}
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all active:scale-95"
            title="Admin Console"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
