import React, { useState } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Check, 
  ExternalLink, 
  Info,
  Sparkles,
  Sliders
} from 'lucide-react';
import { ConfigSettings, GroupKitty } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Partial<ConfigSettings>;
  group: GroupKitty;
  onUpdateConfig: (newConfig: any) => Promise<void>;
  onUpdateGroup: (groupData: Partial<GroupKitty>) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  group,
  onUpdateConfig,
  onUpdateGroup,
}) => {
  if (!isOpen) return null;

  const [paypalClientId, setPaypalClientId] = useState(config.paypalClientId || '');
  const [paypalClientSecret, setPaypalClientSecret] = useState(config.paypalClientSecret || '');
  const [groqApiKey, setGroqApiKey] = useState(config.groqApiKey || '');
  const [channel3ApiKey, setChannel3ApiKey] = useState(config.channel3ApiKey || '');
  const [spendCap, setSpendCap] = useState(group.spendCap.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateConfig({
        paypalClientId,
        paypalClientSecret,
        groqApiKey,
        channel3ApiKey,
      });

      if (spendCap && !isNaN(Number(spendCap))) {
        await onUpdateGroup({
          spendCap: Number(spendCap),
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Integration Settings & API Keys</h3>
              <p className="text-xs text-slate-400">Configure PayPal Sandbox, Groq Vision, and Channel3 API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Honesty Notice */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Hackathon Compliance Notice:</strong> When sandbox API credentials are supplied below or in <code>.env</code>, Kitty calls the live <code>api-m.sandbox.paypal.com</code> endpoints directly. In the absence of credentials, it operates in transparent <strong>Sandbox Simulator Mode</strong> labeled per hackathon rules.
            </div>
          </div>

          {/* Treasury Hard Spend Cap */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Organizer Hard Spend Cap ($ USD)</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={spendCap}
              onChange={(e) => setSpendCap(e.target.value)}
              placeholder="50.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Autonomous purchases strictly halt for human approval if the cost exceeds this cap.
            </p>
          </div>

          {/* PayPal Sandbox Client ID */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                PayPal Sandbox Client ID
              </label>
              <a
                href="https://developer.paypal.com/dashboard/applications/sandbox"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>developer.paypal.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              value={paypalClientId}
              onChange={(e) => setPaypalClientId(e.target.value)}
              placeholder="e.g. A21AA... or client credentials"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* PayPal Sandbox Secret */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              PayPal Sandbox Secret
            </label>
            <input
              type="password"
              value={paypalClientSecret}
              onChange={(e) => setPaypalClientSecret(e.target.value)}
              placeholder="PayPal App Secret"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Groq API Key */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Groq API Key (Optional — Gemini 2.5 Active by Default)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>console.groq.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Channel3 API Key */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Channel3 Product API Key
              </label>
              <a
                href="https://trychannel3.com/developers"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Promo: PAYPAL-HACKATHON-2026</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={channel3ApiKey}
              onChange={(e) => setChannel3ApiKey(e.target.value)}
              placeholder="ch3_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              When empty, uses built-in curated commerce catalog items for instant offline demo evaluation.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>{isSaving ? 'Saving...' : 'Save & Refresh Agent'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
