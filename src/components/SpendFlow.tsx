import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  ShoppingCart, 
  Camera, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  Check, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { GroupKitty, Channel3Product, PurchaseRecord } from '../types';
import { SAMPLE_PANTRY_PHOTOS, CHANNEL3_CATALOG } from '../data/sampleData';

interface SpendFlowProps {
  group: GroupKitty;
  onRefreshGroup: () => void;
  onRefreshLedger: () => void;
  onViewReasoning: () => void;
}

export const SpendFlow: React.FC<SpendFlowProps> = ({
  group,
  onRefreshGroup,
  onRefreshLedger,
  onViewReasoning,
}) => {
  const [triggerMode, setTriggerMode] = useState<'photo' | 'chat' | 'recurring'>('photo');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(SAMPLE_PANTRY_PHOTOS[0]);
  const [chatPrompt, setChatPrompt] = useState<string>('We ran out of whole bean espresso coffee in the kitchen');
  const [searchQuery, setSearchQuery] = useState<string>('coffee');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Channel3Product[]>(CHANNEL3_CATALOG.slice(0, 3));
  const [selectedProduct, setSelectedProduct] = useState<Channel3Product>(CHANNEL3_CATALOG[0]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [blockedResult, setBlockedResult] = useState<any | null>(null);
  const [successPurchase, setSuccessPurchase] = useState<PurchaseRecord | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Search Channel3 API
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setBlockedResult(null);
    setSuccessPurchase(null);
    try {
      const resp = await fetch(`/api/channel3/search?q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (data.success && data.products) {
        setSearchResults(data.products);
        if (data.products.length > 0) {
          setSelectedProduct(data.products[0]);
        }
      }
    } catch (err) {
      console.error('Channel3 search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger selection of photo
  const handleSelectPhoto = (photo: any) => {
    setSelectedPhoto(photo);
    setBlockedResult(null);
    setSuccessPurchase(null);

    // Auto-search Channel3 for the detected item
    if (photo.id === 'photo_coffee_empty') {
      setSearchQuery('espresso whole bean coffee');
      handleSearch('coffee');
    } else if (photo.id === 'photo_paper_towels_empty') {
      setSearchQuery('paper towels');
      handleSearch('paper towels');
    } else if (photo.id === 'photo_dish_soap_empty') {
      setSearchQuery('dish soap');
      handleSearch('dish soap');
    } else if (photo.id === 'photo_espresso_machine_high_cost') {
      setSearchQuery('coffee grinder');
      handleSearch('grinder');
    }
  };

  // Handle autonomous spend evaluation & purchase
  const handleExecutePurchase = async () => {
    if (!selectedProduct) return;
    setIsPurchasing(true);
    setBlockedResult(null);
    setSuccessPurchase(null);

    try {
      const resp = await fetch('/api/spend/evaluate-and-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          triggeredBy: triggerMode === 'photo' ? 'PHOTO_EMPTY_SUPPLY' : triggerMode === 'chat' ? 'CHAT_REQUEST' : 'RECURRING_RESTOCK',
          photoReason: selectedPhoto?.detectedLevel,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        setSuccessPurchase(data.purchase);
        onRefreshGroup();
        onRefreshLedger();
      } else if (data.blocked) {
        setBlockedResult(data);
        onRefreshLedger();
      }
    } catch (err) {
      console.error('Spend purchase error:', err);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Organizer explicit approval for above-cap item
  const handleApproveAboveCap = async () => {
    if (!blockedResult?.purchase?.id) return;
    setIsApproving(true);

    try {
      const resp = await fetch('/api/spend/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId: blockedResult.purchase.id,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setSuccessPurchase(data.purchase);
        setBlockedResult(null);
        onRefreshGroup();
        onRefreshLedger();
      }
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/20 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Phase 5 • Autonomous Spend Flow
              </span>
              <span className="text-xs text-slate-400">Channel3 Product API + PayPal Orders API</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Autonomous Group Restock & Spend Guardrails</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              When triggered by a low supply photo or chat request, the agent searches Channel3 for in-budget supplies. If within the <strong>${group.spendCap.toFixed(2)} hard spend cap</strong> and covered by kitty funds, it autonomously buys via PayPal Orders API. If short, it triggers top-up. If above cap, it halts for organizer sign-off.
            </p>
          </div>

          {/* Quick Treasury Metric Pills */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Available Treasury:</span>
              <span className="font-extrabold text-emerald-400 text-sm">${group.balance.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Hard Spend Cap:</span>
              <span className="font-extrabold text-amber-400 text-sm">${group.spendCap.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triggers (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>1. Choose Restock Trigger</span>
            </h3>

            {/* Trigger Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setTriggerMode('photo')}
                className={`py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                  triggerMode === 'photo'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Shelf Photo</span>
              </button>

              <button
                onClick={() => setTriggerMode('chat')}
                className={`py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                  triggerMode === 'chat'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Prompt</span>
              </button>

              <button
                onClick={() => setTriggerMode('recurring')}
                className={`py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                  triggerMode === 'recurring'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </button>
            </div>

            {/* Trigger A: Shelf Photo List */}
            {triggerMode === 'photo' && (
              <div className="space-y-2.5">
                <label className="text-xs font-medium text-slate-400">
                  Select Pantry / Supply Detection Image:
                </label>
                {SAMPLE_PANTRY_PHOTOS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPhoto(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPhoto?.id === p.id
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                      />
                      <div>
                        <p className="font-semibold text-xs text-white leading-tight">{p.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Target: {p.itemTarget} ({p.detectedLevel})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        p.estimatedCost > group.spendCap
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        ~${p.estimatedCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trigger B: Chat Command */}
            {triggerMode === 'chat' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">
                  Member Chat Restock Request:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    placeholder="e.g. Can we order paper towels and oat milk?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleSearch(chatPrompt)}
                    className="mt-2 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Channel3 for In-Budget Option</span>
                  </button>
                </div>
              </div>
            )}

            {/* Trigger C: Recurring Restock */}
            {triggerMode === 'recurring' && (
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Cadence: Bi-Weekly Kitchen Essentials</span>
                  <span className="text-cyan-400 font-mono">Next: Today (Auto-Triggered)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Autonomous timer fired. Scanning Channel3 commerce feed for paper goods and dish refill.
                </p>
                <button
                  onClick={() => handleSearch('paper towels')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold"
                >
                  Trigger Scheduled Restock Scan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Channel3 Product Options & Spend Execution (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-cyan-400" />
                  <span>2. Channel3 Product Search & Guardrails Check</span>
                </h3>
                <p className="text-xs text-slate-400">trychannel3.com Product API integration</p>
              </div>

              {/* Search bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 w-36 sm:w-48"
                />
                <button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isSearching}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Product Cards List */}
            <div className="space-y-2.5">
              <label className="text-xs font-medium text-slate-400">Matching Channel3 Products:</label>
              <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {searchResults.map(p => {
                  const isSelected = selectedProduct?.id === p.id;
                  const exceedsCap = p.price > group.spendCap;
                  const exceedsBalance = p.price > group.balance;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setBlockedResult(null);
                        setSuccessPurchase(null);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-100 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-white leading-snug">{p.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{p.merchant}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-amber-400">★ {p.rating}</span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded">In Stock</span>
                            {exceedsCap && (
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 rounded border border-amber-500/20">
                                Exceeds Spend Cap (${group.spendCap.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:shrink-0">
                        <span className="text-base font-extrabold text-white font-mono block">
                          ${p.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {exceedsCap ? 'Needs Approval' : exceedsBalance ? 'Needs Top-Up' : 'Autonomously Payable'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Product Decision Box */}
            {selectedProduct && (
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Selected Autonomous Action:</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{selectedProduct.title}</h4>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block">Total Cost:</span>
                    <span className="text-base font-extrabold text-cyan-400">${selectedProduct.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Guardrails Evaluation preview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border ${
                    selectedProduct.price <= group.spendCap
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Spend Cap Check</span>
                    <span className="font-semibold">
                      {selectedProduct.price <= group.spendCap
                        ? `✓ Within $${group.spendCap.toFixed(2)} cap`
                        : `✗ Exceeds $${group.spendCap.toFixed(2)} cap`}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    selectedProduct.price <= group.balance
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Kitty Funds Check</span>
                    <span className="font-semibold">
                      {selectedProduct.price <= group.balance
                        ? `✓ Covered by balance ($${group.balance.toFixed(2)})`
                        : `✗ Short by $${(selectedProduct.price - group.balance).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleExecutePurchase}
                  disabled={isPurchasing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <Zap className={`w-4 h-4 ${isPurchasing ? 'animate-spin' : ''}`} />
                  <span>
                    {isPurchasing 
                      ? 'Agent Evaluating Guardrails & Orders API...' 
                      : 'Trigger Autonomous Agent Purchase Flow'}
                  </span>
                </button>
              </div>
            )}

            {/* Guardrail Halt: Spend Cap Blocked Result */}
            {blockedResult && blockedResult.reason === 'SPEND_CAP_EXCEEDED' && (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Autonomous Guardrail Enforced: Hard Spend Cap Halted Order
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {blockedResult.message} The autonomous agent strictly refuses to place the order without explicit organizer sign-off.
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={handleApproveAboveCap}
                        disabled={isApproving}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isApproving ? 'Capturing PayPal Order...' : 'Organizer 1-Click Explicit Approval'}</span>
                      </button>

                      <button
                        onClick={() => setBlockedResult(null)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Insufficient Funds Top-Up Result */}
            {blockedResult && blockedResult.reason === 'INSUFFICIENT_FUNDS_TOPUP_TRIGGERED' && (
              <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Autonomous Collect Top-Up Triggered</span>
                </div>
                <p className="text-xs text-slate-200">
                  {blockedResult.message} The agent automatically issued top-up requests of <strong>${blockedResult.perMemberTopUp.toFixed(2)}</strong> to each member via PayPal Invoicing.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-purple-300">
                    Once invoices are settled via webhook, the treasury will execute the purchase.
                  </span>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {successPurchase && (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Autonomous Purchase Completed via PayPal Orders API!
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded">
                    Order #{successPurchase.paypalOrderId}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Settled <strong>${successPurchase.price.toFixed(2)}</strong> for "{successPurchase.itemName}". Deducted from group kitty. Logged in AG Grid operational dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
