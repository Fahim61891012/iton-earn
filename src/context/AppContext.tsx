import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TelegramUser, AppSettings } from '../types';
import { api, setTestUserId, getTestUserId } from '../services/api';

interface AppContextType {
  user: TelegramUser | null;
  settings: AppSettings | null;
  loading: boolean;
  activeTab: 'home' | 'earn' | 'spin' | 'refer' | 'profile';
  setActiveTab: (tab: 'home' | 'earn' | 'spin' | 'refer' | 'profile') => void;
  showWithdrawModal: boolean;
  setShowWithdrawModal: (show: boolean) => void;
  showHistoryModal: boolean;
  setShowHistoryModal: (show: boolean) => void;
  showLeaderboardModal: boolean;
  setShowLeaderboardModal: (show: boolean) => void;
  showPaymentProofModal: boolean;
  setShowPaymentProofModal: (show: boolean) => void;
  showAdminModal: boolean;
  setShowAdminModal: (show: boolean) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshUser: () => Promise<void>;
  switchTestUser: (id: string) => Promise<void>;
  verifyMembership: () => Promise<boolean>;
  isTelegramEnvironment: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'earn' | 'spin' | 'refer' | 'profile'>('home');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isTelegramEnvironment = typeof window !== 'undefined' && Boolean((window as any).Telegram?.WebApp?.initData);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(current => (current?.message === message ? null : current));
    }, 3800);
  }, []);

  const initApp = useCallback(async () => {
    try {
      setLoading(true);
      // Initialize Telegram WebApp view
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        tg.ready();
        tg.expand();
      }

      // Check URL start parameter for referral e.g. tgWebAppStartParam=ref_100001
      let refId: string | undefined = undefined;
      const urlParams = new URLSearchParams(window.location.search);
      const startParam = urlParams.get('tgWebAppStartParam') || urlParams.get('start_param') || urlParams.get('start');
      if (startParam && startParam.startsWith('ref_')) {
        refId = startParam.replace('ref_', '');
      }

      const res = await api.authenticate(refId);
      setUser(res.user);
      setSettings(res.settings);
    } catch (err) {
      console.error('Failed to initialize ITON EARN:', err);
      showToast('Could not load account data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  const refreshUser = async () => {
    try {
      const res = await api.getUserProfile();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const switchTestUser = async (id: string) => {
    setTestUserId(id);
    await initApp();
    showToast(`Switched to test user ID: ${id}`, 'info');
  };

  const verifyMembership = async (): Promise<boolean> => {
    try {
      const res = await api.verifyChannels();
      if (res.allJoined) {
        showToast('Channel membership verified! Welcome to ITON EARN.', 'success');
        await refreshUser();
        return true;
      } else {
        showToast(res.message, 'error');
        return false;
      }
    } catch (err: any) {
      showToast('Verification failed. Please try again.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        settings,
        loading,
        activeTab,
        setActiveTab,
        showWithdrawModal,
        setShowWithdrawModal,
        showHistoryModal,
        setShowHistoryModal,
        showLeaderboardModal,
        setShowLeaderboardModal,
        showPaymentProofModal,
        setShowPaymentProofModal,
        showAdminModal,
        setShowAdminModal,
        toast,
        showToast,
        refreshUser,
        switchTestUser,
        verifyMembership,
        isTelegramEnvironment
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
