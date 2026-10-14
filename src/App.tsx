import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { EarnTab } from './components/EarnTab';
import { SpinTab } from './components/SpinTab';
import { ReferTab } from './components/ReferTab';
import { ProfileTab } from './components/ProfileTab';
import { ChannelGateModal } from './components/ChannelGateModal';
import { WithdrawModal } from './components/WithdrawModal';
import { HistoryModal } from './components/HistoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PaymentProofModal } from './components/PaymentProofModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Toast } from './components/Toast';
import { Wrench } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading, activeTab, settings, setShowAdminModal } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center p-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan animate-pulse">
            <span className="font-heading font-extrabold text-2xl text-cyan-400">IT</span>
          </div>
          <div className="absolute -inset-1 rounded-3xl border border-cyan-500/20 animate-ping opacity-25" />
        </div>
        <h2 className="font-heading font-bold text-base text-white tracking-wide">
          ITON EARN
        </h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Telegram Secure Ledger...</p>
      </div>
    );
  }

  // Maintenance Mode Screen
  if (settings?.isMaintenanceMode) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-xl text-white">System Under Maintenance</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed">
          ITON EARN is temporarily undergoing scheduled maintenance to upgrade blockchain nodes. Please check back shortly.
        </p>
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="mt-6 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white"
        >
          Admin Console
        </button>
      </div>
    );
  }

  // Mandatory 3-Channel Verification Gate
  // If user has not joined all 3 mandatory channels, lock the entire app!
  if (user && !user.channelsJoined) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col">
        <ChannelGateModal />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <TopNav />

      {/* Main Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-20">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'earn' && <EarnTab />}
        {activeTab === 'spin' && <SpinTab />}
        {activeTab === 'refer' && <ReferTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNav />

      {/* Overlays & Modals */}
      <WithdrawModal />
      <HistoryModal />
      <LeaderboardModal />
      <PaymentProofModal />
      <AdminPanelModal />
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
