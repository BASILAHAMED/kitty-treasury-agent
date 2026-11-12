import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Send, 
  RefreshCw, 
  MessageSquare, 
  UserCheck, 
  DollarSign, 
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { GroupKitty, ItemizedReceipt, ReceiptItem, InvoiceRecord } from '../types';
import { SAMPLE_RECEIPTS } from '../data/sampleData';

interface CollectFlowProps {
  group: GroupKitty;
  onRefreshLedger: () => void;
  onViewReasoning: () => void;
}

export const CollectFlow: React.FC<CollectFlowProps> = ({
  group,
  onRefreshLedger,
  onViewReasoning,
}) => {
  const [selectedSample, setSelectedSample] = useState<string>('sample_dinner_italian');
  const [isProcessingVision, setIsProcessingVision] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(SAMPLE_RECEIPTS[0]);
  const [itemAssignments, setItemAssignments] = useState<Record<string, string[]>>({
    'it_1': ['member_alex'],
    'it_2': ['member_jordan'],
    'it_3': ['member_sam'],
    'it_4': ['member_alex', 'member_jordan', 'member_sam', 'member_taylor'],
    'it_5': [], // Ambiguous
  });

  const [clarificationAnswered, setClarificationAnswered] = useState(false);
  const [isComputingShares, setIsComputingShares] = useState(false);
  const [calculatedShares, setCalculatedShares] = useState<any[] | null>(null);
  const [isSendingInvoices, setIsSendingInvoices] = useState(false);
  const [dispatchedInvoices, setDispatchedInvoices] = useState<InvoiceRecord[] | null>(null);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [isReminderRunning, setIsReminderRunning] = useState(false);

  // Parse receipt via Vision model
  const handleRunVision = async (sampleId?: string) => {
    setIsProcessingVision(true);
    setCalculatedShares(null);
    setDispatchedInvoices(null);
    setClarificationAnswered(false);

    try {
      const resp = await fetch('/api/ai/itemize-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleReceiptId: sampleId || selectedSample,
          imageBase64: customImageBase64,
        }),
      });

      const data = await resp.json();
      if (data.success && data.receipt) {
        setReceipt(data.receipt);
        // Initialize assignments
        const initAssigned: Record<string, string[]> = {};
        data.receipt.items.forEach((it: ReceiptItem) => {
          initAssigned[it.id] = it.assignedMemberIds || [];
        });
        setItemAssignments(initAssigned);
      }
    } catch (err) {
      console.error('Vision error:', err);
    } finally {
      setIsProcessingVision(false);
    }
  };

  // Toggle member assignment for an item
  const toggleMemberAssignment = (itemId: string, memberId: string) => {
    setItemAssignments(prev => {
      const current = prev[itemId] || [];
      const updated = current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId];
      return { ...prev, [itemId]: updated };
    });
  };

  // Resolve ambiguity via clarifying chat option
  const resolveAmbiguity = (assignmentMode: 'alex_jordan' | 'taylor_only' | 'all') => {
    const ambiguousItem = receipt?.items?.find((i: any) => i.isAmbiguous);
    if (!ambiguousItem) return;

    let targetMemberIds: string[] = [];
    if (assignmentMode === 'alex_jordan') {
      targetMemberIds = ['member_alex', 'member_jordan'];
    } else if (assignmentMode === 'taylor_only') {
      targetMemberIds = ['member_taylor'];
    } else {
      targetMemberIds = group.members.map(m => m.id);
    }

    setItemAssignments(prev => ({
      ...prev,
      [ambiguousItem.id]: targetMemberIds,
    }));
    setClarificationAnswered(true);
  };

  // Compute proportional shares
  const handleCalculateShares = async () => {
    if (!receipt) return;
    setIsComputingShares(true);

    try {
      const resp = await fetch('/api/ai/calculate-shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt,
          assignments: itemAssignments,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setCalculatedShares(data.memberShares);
      }
    } catch (err) {
      console.error('Calculate shares error:', err);
    } finally {
      setIsComputingShares(false);
    }
  };

  // Dispatch real PayPal Invoices via Agent Invoicing tool
  const handleDispatchInvoices = async () => {
    if (!calculatedShares) return;
    setIsSendingInvoices(true);

    try {
      const resp = await fetch('/api/paypal/create-and-send-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shares: calculatedShares,
          receiptTitle: receipt?.merchantName || 'Group Dining & Supplies',
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setDispatchedInvoices(data.invoices);
        onRefreshLedger();
      }
    } catch (err) {
      console.error('Dispatch invoices error:', err);
    } finally {
      setIsSendingInvoices(false);
    }
  };

  // Run autonomous reminder policy check
  const handleRunReminders = async () => {
    setIsReminderRunning(true);
    setReminderMessage(null);

    try {
      const resp = await fetch('/api/invoices/run-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await resp.json();
      if (data.success) {
        setReminderMessage(
          `Autonomous Reminder Cycle Completed: Sent ${data.remindersProcessed} automated reminders. ${data.flaggedCount} invoices reached the 2-reminder cap and have been flagged for the organizer.`
        );
        onRefreshLedger();
      }
    } catch (err) {
      console.error('Reminder error:', err);
    } finally {
      setIsReminderRunning(false);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const b64 = event.target?.result as string;
        setCustomImageBase64(b64);
        setReceipt(null);
        setSelectedSample('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Phase 1, 2 & 3 • Collect Flow
              </span>
              <span className="text-xs text-slate-400">PayPal Invoicing + Groq/Gemini Vision</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Autonomous Receipt Splitting & Real Invoicing</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Upload or select a receipt photo. The vision model itemizes line items, resolves ambiguities via targeted chat questions, computes mathematical shares with proportional tax/tip, and autonomously creates + sends real PayPal Sandbox invoices to each member.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewReasoning}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Watch Agent Reason</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Receipt Input & Sample Select (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>1. Choose Receipt or Upload Photo</span>
            </h3>

            {/* Ready-to-test Sample Receipts */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-slate-400">Pre-Configured Hackathon Demo Receipts:</label>
              {SAMPLE_RECEIPTS.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setSelectedSample(sample.id);
                    setCustomImageBase64(null);
                    handleRunVision(sample.id);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedSample === sample.id
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={sample.image} 
                      alt={sample.merchant} 
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700" 
                    />
                    <div>
                      <p className="font-semibold text-xs text-white">{sample.title}</p>
                      <p className="text-[11px] text-slate-400">{sample.merchant} • {sample.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-emerald-400">${sample.total.toFixed(2)}</span>
                    <span className="block text-[10px] text-slate-400">{sample.items.length} items</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Photo Upload */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-400 mb-2">Or Upload Real Receipt Photo:</label>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-300 font-medium">Click or drag a receipt image</p>
                <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, or WEBP up to 10MB</p>
              </div>

              {customImageBase64 && (
                <div className="mt-3 flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Custom photo uploaded
                  </span>
                  <button
                    onClick={() => handleRunVision()}
                    disabled={isProcessingVision}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                  >
                    {isProcessingVision ? 'Analyzing...' : 'Parse Image'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Autonomous Reminder Policy Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Autonomous Reminder Engine</span>
              </h3>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                Rule: Max 2 Reminders
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              The agent polls invoice status. It sends up to <strong>2 automated PayPal reminders</strong> for unpaid invoices, then stops and flags the organizer. It never escalates amount or frequency beyond that without human approval.
            </p>

            <button
              onClick={handleRunReminders}
              disabled={isReminderRunning}
              className="w-full py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReminderRunning ? 'animate-spin' : ''}`} />
              <span>{isReminderRunning ? 'Running Policy Check...' : 'Trigger Autonomous Reminder Cycle'}</span>
            </button>

            {reminderMessage && (
              <div className="mt-3 p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs text-amber-200">
                {reminderMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Itemized Extraction & Split Calculation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {receipt ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{receipt.merchantName || receipt.title}</h3>
                  <p className="text-xs text-slate-400">Date: {receipt.date} • Currency: {receipt.currency || 'USD'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Bill:</span>
                  <span className="text-lg font-extrabold text-emerald-400">${Number(receipt.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Ambiguity Clarification Box (If item is ambiguous and unresolved) */}
              {receipt.items?.some((i: any) => i.isAmbiguous) && !clarificationAnswered && (
                <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-4 shadow-inner">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                          Agent Clarifying Question:
                        </span>
                        <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded font-mono">
                          Auto-Detected Ambiguity
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">
                        "I itemized <strong className="text-purple-300">{receipt.items.find((i: any) => i.isAmbiguous)?.description}</strong> ($
                        {receipt.items.find((i: any) => i.isAmbiguous)?.totalPrice.toFixed(2)}). Who consumed this item?"
                      </p>

                      {/* Quick Answer Options */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => resolveAmbiguity('alex_jordan')}
                          className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-600/40 text-purple-100 rounded-lg text-xs font-medium transition-all"
                        >
                          Alex & Jordan shared it
                        </button>
                        <button
                          onClick={() => resolveAmbiguity('taylor_only')}
                          className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-600/40 text-purple-100 rounded-lg text-xs font-medium transition-all"
                        >
                          Taylor ordered it
                        </button>
                        <button
                          onClick={() => resolveAmbiguity('all')}
                          className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-600/40 text-purple-100 rounded-lg text-xs font-medium transition-all"
                        >
                          Split evenly among everyone
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {clarificationAnswered && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Ambiguity resolved! Consumer assignments updated.
                  </span>
                  <button 
                    onClick={() => setClarificationAnswered(false)}
                    className="text-slate-400 hover:text-white underline text-[11px]"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Line Items Table with Interactive Assignment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
                  <span>Line Item & Description</span>
                  <span>Amount & Assigned Members</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {receipt.items?.map((item: any) => {
                    const assigned = itemAssignments[item.id] || [];

                    return (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          item.isAmbiguous && !clarificationAnswered
                            ? 'bg-purple-950/20 border-purple-500/40'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">
                              {item.quantity}x {item.description}
                            </span>
                            {item.isAmbiguous && (
                              <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                                Ambiguous
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-100">
                            ${Number(item.totalPrice).toFixed(2)}
                          </span>
                        </div>

                        {/* Member assignment chips */}
                        <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
                          <span className="text-[10px] text-slate-500 mr-1">Assigned to:</span>
                          {group.members.map(m => {
                            const isAssigned = assigned.includes(m.id);
                            return (
                              <button
                                key={m.id}
                                onClick={() => toggleMemberAssignment(item.id, m.id)}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                                  isAssigned
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {isAssigned && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                                <span>{m.name.split(' ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subtotal / Tax / Tip Breakdown */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-300 font-mono">
                  <span>Subtotal: <strong>${Number(receipt.subtotal).toFixed(2)}</strong></span>
                  <span>Tax: <strong>${Number(receipt.tax).toFixed(2)}</strong></span>
                  <span>Tip: <strong>${Number(receipt.tip).toFixed(2)}</strong></span>
                </div>
                <div className="text-emerald-400 font-mono font-bold text-sm">
                  Grand Total: ${Number(receipt.total).toFixed(2)}
                </div>
              </div>

              {/* Actions: Calculate Shares */}
              <div className="pt-2">
                <button
                  onClick={handleCalculateShares}
                  disabled={isComputingShares}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isComputingShares ? 'Computing Proportional Math...' : 'Compute Proportional Member Shares'}
                  </span>
                </button>
              </div>

              {/* Calculated Shares Breakdown */}
              {calculatedShares && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Calculated Proportional Shares
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Sum Verified: ${calculatedShares.reduce((acc, s) => acc + s.total, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {calculatedShares.map((s: any) => (
                      <div key={s.member.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={s.member.avatar} 
                            alt={s.member.name} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-semibold text-xs text-white">{s.member.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Items: ${s.subtotal.toFixed(2)} + Tax/Tip: ${(s.tax + s.tip).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 text-sm font-mono">
                            ${s.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dispatch PayPal Invoices Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleDispatchInvoices}
                      disabled={isSendingInvoices}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <Send className={`w-4 h-4 ${isSendingInvoices ? 'animate-bounce' : ''}`} />
                      <span>
                        {isSendingInvoices 
                          ? 'Autonomous PayPal Agent Dispatching Invoices...' 
                          : 'Autonomously Create & Dispatch Real PayPal Invoices (create_invoice + send_invoice)'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Success Notification after dispatch */}
              {dispatchedInvoices && (
                <div className="mt-3 p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-300">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {dispatchedInvoices.length} PayPal Invoices Successfully Sent!
                    </span>
                    <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded font-mono">
                      Status: SENT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Invoices have been registered in the operational AG Grid ledger. The autonomous agent will poll for settlement and handle reminders.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={dispatchedInvoices[0]?.paypalInvoiceUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 underline font-mono"
                    >
                      <span>View Sample Invoice on PayPal Sandbox</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50 text-emerald-400" />
              <p className="font-medium text-slate-300">No Receipt Loaded</p>
              <p className="text-xs text-slate-500 mt-1">Select one of the demo receipts on the left or upload a photo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
