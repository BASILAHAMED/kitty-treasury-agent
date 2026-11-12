import React from 'react';
import { 
  PiggyBank, 
  ShieldCheck, 
  Sliders, 
  BookOpen, 
  Zap, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GroupKitty, ConfigSettings } from '../types';

interface HeaderProps {
  group: GroupKitty;
  config: Partial<ConfigSettings>;
  activeTab: 'collect' | 'spend' | 'ledger' | 'reasoning';
  setActiveTab: (tab: 'collect' | 'spend' | 'ledger' | 'reasoning') => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onResetData: () => void;
  reasoningCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  group,
  config,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenGuide,
  onResetData,
  reasoningCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Kitty</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PayPal AI Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Shared Treasury & Invoicing</p>
          </div>
        </div>

        {/* Group & Treasury Badges */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Kitty Balance */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Pooled Kitty:</span>
            <span className="font-bold text-emerald-400 text-sm">
              ${group.balance.toFixed(2)}
            </span>
          </div>

          {/* Hard Spend Cap */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800" title="Purchases above this cap require explicit human organizer approval">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400">Spend Cap:</span>
            <span className="font-bold text-amber-400 text-sm">
              ${group.spendCap.toFixed(2)}
            </span>
          </div>

          {/* PayPal Sandbox Status */}
          <div 
            onClick={onOpenSettings}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              config.isPayPalConfigured
                ? 'bg-blue-950/60 text-blue-400 border-blue-800/60 hover:bg-blue-900/60'
                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Click to configure PayPal credentials"
          >
            <div className={`w-2 h-2 rounded-full ${config.isPayPalConfigured ? 'bg-blue-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{config.isPayPalConfigured ? 'PayPal Sandbox (Live)' : 'PayPal Sandbox (Simulator)'}</span>
          </div>

          {/* Settings & Reset */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Configure API Keys (PayPal, Groq, Channel3)"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Judge Guide</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset demo data to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between border-t border-slate-800/60">
        <nav className="flex space-x-1 sm:space-x-4 py-2">
          <button
            onClick={() => setActiveTab('collect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'collect'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Collect (Receipt Split & Invoicing)</span>
          </button>

          <button
            onClick={() => setActiveTab('spend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'spend'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Spend (Channel3 Restock & Orders)</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'ledger'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span>3. AG Grid Ledger & Webhooks</span>
          </button>

          <button
            onClick={() => setActiveTab('reasoning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'reasoning'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Agent Reasoning Panel</span>
            {reasoningCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-mono">
                {reasoningCount}
              </span>
            )}
          </button>
        </nav>

        {/* Group name pill */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Group: <strong className="text-slate-200">{group.name}</strong> ({group.members.length} members)</span>
        </div>
      </div>
    </header>
  );
};
