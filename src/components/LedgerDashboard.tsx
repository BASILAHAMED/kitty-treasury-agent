import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { 
  Table, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Zap, 
  Send, 
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Bell
} from 'lucide-react';
import { InvoiceRecord, PurchaseRecord, GroupKitty } from '../types';

interface LedgerDashboardProps {
  group: GroupKitty;
  invoices: InvoiceRecord[];
  purchases: PurchaseRecord[];
  onRefresh: () => void;
  onSimulateWebhook: (eventType: string, id?: string) => Promise<void>;
}

export const LedgerDashboard: React.FC<LedgerDashboardProps> = ({
  group,
  invoices,
  purchases,
  onRefresh,
  onSimulateWebhook,
}) => {
  const [activeLedgerTab, setActiveLedgerTab] = useState<'invoices' | 'purchases'>('invoices');
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [webhookFeedback, setWebhookFeedback] = useState<string | null>(null);

  const handleWebhookClick = async (eventType: string, targetId?: string) => {
    setIsSimulatingWebhook(true);
    setWebhookFeedback(null);
    try {
      await onSimulateWebhook(eventType, targetId);
      setWebhookFeedback(`Webhook "${eventType}" delivered and processed in live ledger!`);
    } catch (e: any) {
      setWebhookFeedback(`Webhook delivery error: ${e.message}`);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  // AG Grid Column Definitions for Invoices
  const invoiceColumnDefs: ColDef<InvoiceRecord>[] = useMemo(() => [
    {
      headerName: 'Invoice #',
      field: 'invoiceNumber',
      width: 150,
      cellRenderer: (params: any) => (
        <span className="font-mono font-semibold text-slate-200">{params.value}</span>
      ),
    },
    {
      headerName: 'Participant',
      field: 'memberName',
      width: 180,
      cellRenderer: (params: any) => {
        const row = params.data as InvoiceRecord;
        return (
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
              {row.memberName.charAt(0)}
            </span>
            <div className="leading-tight truncate">
              <span className="font-medium text-xs text-white block truncate">{row.memberName}</span>
              <span className="text-[10px] text-slate-400 block truncate">{row.memberEmail}</span>
            </div>
          </div>
        );
      },
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 110,
      cellRenderer: (params: any) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          ${Number(params.value).toFixed(2)}
        </span>
      ),
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 170,
      cellRenderer: (params: any) => {
        const val = params.value as string;
        if (val === 'PAID') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              PAID
            </span>
          );
        }
        if (val === 'REMINDED_1') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-3 h-3 text-amber-400" />
              REMINDED (1/2)
            </span>
          );
        }
        if (val === 'REMINDED_2') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              FINAL REMINDER (2/2)
            </span>
          );
        }
        if (val === 'FLAGGED_ORGANIZER') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <AlertTriangle className="w-3 h-3 text-purple-400" />
              FLAGGED FOR ORGANIZER
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Send className="w-3 h-3 text-blue-400" />
            SENT (UNPAID)
          </span>
        );
      },
    },
    {
      headerName: 'Proportional Split Breakdown',
      field: 'itemsBreakdown',
      width: 250,
      cellRenderer: (params: any) => {
        const row = params.data as InvoiceRecord;
        return (
          <span className="text-[11px] text-slate-300 font-mono">
            Sub: ${row.subtotalShare.toFixed(2)} + Tax: ${row.taxShare.toFixed(2)} + Tip: ${row.tipShare.toFixed(2)}
          </span>
        );
      },
    },
    {
      headerName: 'PayPal Invoice ID',
      field: 'paypalInvoiceId',
      width: 210,
      cellRenderer: (params: any) => {
        const row = params.data as InvoiceRecord;
        return (
          <div className="flex items-center gap-1 font-mono text-[11px] text-blue-400">
            <span className="truncate">{row.paypalInvoiceId || 'N/A'}</span>
            {row.paypalInvoiceUrl && (
              <a
                href={row.paypalInvoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-300 shrink-0 ml-1"
                title="View on PayPal Sandbox"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Actions',
      width: 140,
      cellRenderer: (params: any) => {
        const row = params.data as InvoiceRecord;
        if (row.status === 'PAID') {
          return <span className="text-[10px] text-slate-500 italic">Settled</span>;
        }
        return (
          <button
            onClick={() => handleWebhookClick('INVOICING.INVOICE.PAID', row.id)}
            className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-semibold transition-all"
            title="Simulate PayPal webhook receipt indicating payer completed payment"
          >
            Mark Paid (Webhook)
          </button>
        );
      },
    },
  ], []);

  // AG Grid Column Definitions for Purchases
  const purchaseColumnDefs: ColDef<PurchaseRecord>[] = useMemo(() => [
    {
      headerName: 'Item',
      field: 'itemName',
      width: 260,
      cellRenderer: (params: any) => {
        const row = params.data as PurchaseRecord;
        return (
          <div className="flex items-center gap-2.5">
            {row.imageUrl && (
              <img
                src={row.imageUrl}
                alt={row.itemName}
                className="w-7 h-7 rounded object-cover border border-slate-700 shrink-0"
              />
            )}
            <span className="font-medium text-xs text-white truncate">{row.itemName}</span>
          </div>
        );
      },
    },
    {
      headerName: 'Merchant & Channel3',
      field: 'merchant',
      width: 210,
      cellRenderer: (params: any) => (
        <span className="text-xs text-slate-300">{params.value}</span>
      ),
    },
    {
      headerName: 'Price',
      field: 'price',
      width: 100,
      cellRenderer: (params: any) => (
        <span className="font-mono font-bold text-cyan-400 text-xs">
          ${Number(params.value).toFixed(2)}
        </span>
      ),
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 150,
      cellRenderer: (params: any) => {
        const val = params.value as string;
        if (val === 'COMPLETED') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              COMPLETED
            </span>
          );
        }
        if (val === 'PENDING_APPROVAL') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              NEEDS APPROVAL
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
            {val}
          </span>
        );
      },
    },
    {
      headerName: 'Triggered By',
      field: 'triggeredBy',
      width: 160,
      cellRenderer: (params: any) => (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'PayPal Order ID',
      field: 'paypalOrderId',
      width: 200,
      cellRenderer: (params: any) => (
        <span className="font-mono text-[11px] text-blue-400">{params.value || 'Pending'}</span>
      ),
    },
    {
      headerName: 'Date',
      field: 'purchasedAt',
      width: 150,
      cellRenderer: (params: any) => (
        <span className="text-[11px] text-slate-400">
          {new Date(params.value).toLocaleDateString()} {new Date(params.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Phase 4 • AG Grid Operational Dashboard
              </span>
              <span className="text-xs text-slate-400">Enterprise High-Density Ledger</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Operational Group Treasury Ledger & Webhooks</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time AG Grid operational view of active PayPal invoices, participant shares, autonomous reminder counts, and PayPal Orders history. Includes a Sandbox Webhook Event Relay for live testing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Refresh ledger state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Webhook Testing Console Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">PayPal Sandbox Webhook Event Relay</h4>
            <p className="text-[11px] text-slate-400">
              Simulate webhook triggers to test live event-driven state transitions:
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => handleWebhookClick('INVOICING.INVOICE.PAID')}
            disabled={isSimulatingWebhook}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate INVOICE.PAID Webhook</span>
          </button>

          <button
            onClick={() => handleWebhookClick('PAYMENT.CAPTURE.COMPLETED')}
            disabled={isSimulatingWebhook}
            className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate PAYMENT.CAPTURE Webhook</span>
          </button>
        </div>
      </div>

      {webhookFeedback && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{webhookFeedback}</span>
        </div>
      )}

      {/* AG Grid Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Ledger Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveLedgerTab('invoices')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeLedgerTab === 'invoices'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Invoices Ledger ({invoices.length})</span>
            </button>

            <button
              onClick={() => setActiveLedgerTab('purchases')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeLedgerTab === 'purchases'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Purchases & Orders ({purchases.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            AG Grid Community Edition • Reactive Updates
          </span>
        </div>

        {/* AG Grid Table View */}
        <div className="ag-theme-quartz-dark w-full h-[420px] rounded-xl overflow-hidden border border-slate-800">
          {activeLedgerTab === 'invoices' ? (
            <AgGridReact
              rowData={invoices}
              columnDefs={invoiceColumnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              animateRows={true}
            />
          ) : (
            <AgGridReact
              rowData={purchases}
              columnDefs={purchaseColumnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              animateRows={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};
