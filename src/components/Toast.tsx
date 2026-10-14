import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] w-auto animate-in fade-in slide-in-from-top-4 duration-200">
      <div
        className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-medium border backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
            : toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
            : 'bg-slate-900/90 text-cyan-200 border-cyan-500/40 shadow-cyan-950/50'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
        <span className="leading-tight">{toast.message}</span>
      </div>
    </div>
  );
};
