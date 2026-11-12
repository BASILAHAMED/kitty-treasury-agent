import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CollectFlow } from './components/CollectFlow';
import { SpendFlow } from './components/SpendFlow';
import { LedgerDashboard } from './components/LedgerDashboard';
import { AgentReasoningPanel } from './components/AgentReasoningPanel';
import { SettingsModal } from './components/SettingsModal';
import { HackathonGuideModal } from './components/HackathonGuideModal';
import { GroupKitty, InvoiceRecord, PurchaseRecord, AgentReasoningStep, ConfigSettings } from './types';
import { DEFAULT_GROUPS } from './data/sampleData';
import { Bot, Sparkles, Terminal, ChevronUp, ChevronDown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'collect' | 'spend' | 'ledger' | 'reasoning'>('collect');
  const [group, setGroup] = useState<GroupKitty>(DEFAULT_GROUPS[0]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [reasoningLogs, setReasoningLogs] = useState<AgentReasoningStep[]>([]);
  const [config, setConfig] = useState<Partial<ConfigSettings>>({
    isPayPalConfigured: false,
    paypalMode: 'sandbox',
    hasGeminiKey: true,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Load app state
  const fetchState = async () => {
    try {
      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (data.group) setGroup(data.group);
        if (data.config) setConfig(data.config);
      }

      const invRes = await fetch('/api/invoices');
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(invData);
      }

      const purchRes = await fetch('/api/purchases');
      if (purchRes.ok) {
        const purchData = await purchRes.json();
        setPurchases(purchData);
      }

      const logsRes = await fetch('/api/agent/reasoning');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setReasoningLogs(logsData);
      }
    } catch (err) {
      console.warn('Initial fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3500);
    return () => clearInterval(interval);
  }, []);

  // Update Config
  const handleUpdateConfig = async (newConfig: any) => {
    try {
      const res = await fetch('/api/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Update config failed:', err);
    }
  };

  // Update Group
  const handleUpdateGroup = async (groupData: Partial<GroupKitty>) => {
    try {
      const res = await fetch('/api/group/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Update group failed:', err);
    }
  };

  // Reset Data
  const handleResetData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
      fetchState();
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  // Clear Reasoning Stream
  const handleClearReasoning = async () => {
    try {
      await fetch('/api/agent/clear-reasoning', { method: 'POST' });
      fetchState();
    } catch (err) {
      console.error('Clear reasoning failed:', err);
    }
  };

  // Simulate Webhook
  const handleSimulateWebhook = async (eventType: string, id?: string) => {
    const res = await fetch('/api/paypal/simulate-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        invoiceId: id,
        orderId: id,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to simulate webhook');
    }
    fetchState();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <Header
        group={group}
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetData={handleResetData}
        reasoningCount={reasoningLogs.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28">
        {activeTab === 'collect' && (
          <CollectFlow
            group={group}
            onRefreshLedger={fetchState}
            onViewReasoning={() => setActiveTab('reasoning')}
          />
        )}

        {activeTab === 'spend' && (
          <SpendFlow
            group={group}
            onRefreshGroup={fetchState}
            onRefreshLedger={fetchState}
            onViewReasoning={() => setActiveTab('reasoning')}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerDashboard
            group={group}
            invoices={invoices}
            purchases={purchases}
            onRefresh={fetchState}
            onSimulateWebhook={handleSimulateWebhook}
          />
        )}

        {activeTab === 'reasoning' && (
          <AgentReasoningPanel
            steps={reasoningLogs}
            onClear={handleClearReasoning}
            className="h-[calc(100vh-180px)]"
          />
        )}
      </main>

      {/* Floating Bottom Live Agent Reasoning Drawer (Accessible from all tabs) */}
      {activeTab !== 'reasoning' && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Live Agent Thought Stream</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                    {reasoningLogs.length} Events
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-md sm:max-w-xl">
                  Latest: {reasoningLogs[0]?.title || 'Idle & monitoring'} — {reasoningLogs[0]?.detail?.slice(0, 70)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('reasoning')}
                className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Terminal className="w-3 h-3" />
                <span>Full Screen Stream</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                {isDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible mini reasoning stream */}
          {isDrawerOpen && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1 border-t border-slate-800/60 max-h-48 overflow-y-auto space-y-1.5">
              {reasoningLogs.slice(0, 3).map((step) => (
                <div
                  key={step.id}
                  className="p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 text-[11px] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {step.flow}
                    </span>
                    <span className="font-semibold text-slate-200">{step.title}</span>
                    <span className="text-slate-400 truncate hidden sm:inline">{step.detail}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        group={group}
        onUpdateConfig={handleUpdateConfig}
        onUpdateGroup={handleUpdateGroup}
      />

      {/* Judge Evaluation & Architecture Modal */}
      <HackathonGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
