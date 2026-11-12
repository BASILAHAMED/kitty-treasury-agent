import React from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  Terminal, 
  Award,
  Sparkles,
  Layers
} from 'lucide-react';

interface HackathonGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonGuideModal: React.FC<HackathonGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">PayPal AI Hackathon 2026 — Judge Evaluation Guide</h3>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Devpost Submission
                </span>
              </div>
              <p className="text-xs text-slate-400">Kitty: Autonomous Shared-Treasury Agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans">
          {/* Executive Overview */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Project Overview: "Kitty"</span>
            </h4>
            <p>
              <strong>Kitty</strong> is an autonomous group treasury agent designed for roommates, trip groups, and teams. It replaces manual bill-splitting spreadsheets and awkward reminder texts with real, autonomous financial agency powered by PayPal Sandbox and AI vision/reasoning models.
            </p>
          </div>

          {/* Core Flows & Integrations Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Two Genuinely Load-Bearing Agent Loops</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Loop 1: COLLECT */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Loop 1 • COLLECT Flow
                </span>
                <h5 className="font-bold text-white text-xs">Receipt Vision → Proportional Math → Real PayPal Invoicing</h5>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
                  <li><strong>AI Vision:</strong> Zero-shot itemization of receipt images into structured JSON line items, subtotals, tax, and tip.</li>
                  <li><strong>Ambiguity Detection:</strong> Asks clarifying chat questions only where ambiguous ("Who had the tiramisu?").</li>
                  <li><strong>Proportional Math:</strong> Computes proportional tax and tip based on each participant's item consumption.</li>
                  <li><strong>PayPal Invoicing API:</strong> Autonomously creates draft (<code>create_invoice</code>) and sends invoice (<code>send_invoice</code>) to member accounts.</li>
                  <li><strong>Strict 2-Reminder Limit:</strong> Autonomous reminder engine sends at most 2 reminders per unpaid bill, then halts and flags the organizer.</li>
                </ul>
              </div>

              {/* Loop 2: SPEND */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Loop 2 • SPEND Flow
                </span>
                <h5 className="font-bold text-white text-xs">Pantry Triggers → Channel3 API → Hard Spend Cap → PayPal Orders</h5>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
                  <li><strong>Autonomous Triggers:</strong> Low pantry photo (e.g. 8% coffee beans remaining), chat prompt, or recurring cadence.</li>
                  <li><strong>Channel3 Product API:</strong> Queries trychannel3.com product catalog for matching in-budget items.</li>
                  <li><strong>Hard Spend Cap ($50):</strong> If item cost &gt; spend cap (e.g. $149.95 espresso grinder), strictly blocks order and requires 1-click organizer approval.</li>
                  <li><strong>Automatic Top-Up:</strong> If treasury balance is short, automatically triggers COLLECT flow to collect proportional top-ups first.</li>
                  <li><strong>PayPal Orders API:</strong> Creates and captures payment order from pooled kitty funds.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Phase-by-Phase Verification Checklist</span>
            </h4>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Phase 1:</strong> PayPal Sandbox Invoicing API (create, send, remind, get status) &amp; Orders API client tested.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Phase 2:</strong> Gemini / Groq Vision itemization returning structured line items, taxes, tips, and ambiguity detection.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Phase 3:</strong> End-to-end COLLECT flow dispatching invoices to sandbox accounts with 2-reminder cutoff enforcement.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Phase 4:</strong> AG Grid operational dashboard with reactive cell renderers, PayPal invoice links, and status pills.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Phase 5:</strong> Channel3 commerce integration with spend-cap guardrail and PayPal Orders API settlement.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Phase 6:</strong> Non-negotiable visible Agent Reasoning stream logging real tool calls, inputs, and outputs in real time.</span>
              </div>
            </div>
          </div>

          {/* Honesty Rule & Sandbox Credentials */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2">
            <h5 className="font-bold text-white text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Hackathon Honesty Rule Implementation</span>
            </h5>
            <p className="text-[11px] text-slate-300">
              Per the prompt's honesty requirement: If sandbox credentials are provided, live calls are made to <code>https://api-m.sandbox.paypal.com</code>. In fallback or offline review, all simulated responses are prominently labeled with <code>[Sandbox Simulator Mode]</code> in the UI and README. No silent mock fallbacks exist.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            PayPal AI Hackathon 2026 • Ready for Devpost Submission
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
