import React, { useState } from 'react';
import { 
  Bot, 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Filter,
  Trash2
} from 'lucide-react';
import { AgentReasoningStep } from '../types';

interface AgentReasoningPanelProps {
  steps: AgentReasoningStep[];
  onClear: () => void;
  className?: string;
  isCompact?: boolean;
}

export const AgentReasoningPanel: React.FC<AgentReasoningPanelProps> = ({
  steps,
  onClear,
  className = '',
  isCompact = false,
}) => {
  const [filterFlow, setFilterFlow] = useState<string>('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSteps = steps.filter(step => {
    if (filterFlow === 'ALL') return true;
    return step.flow === filterFlow;
  });

  const getStepIcon = (step: AgentReasoningStep) => {
    switch (step.stepType) {
      case 'tool_call':
      case 'tool_result':
        return <Terminal className="w-3.5 h-3.5 text-cyan-400" />;
      case 'spend_cap_block':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'clarification_needed':
        return <Bot className="w-3.5 h-3.5 text-purple-400" />;
      case 'vision_analysis':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'action_executed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getFlowBadgeColor = (flow: string) => {
    switch (flow) {
      case 'COLLECT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SPEND':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'REMINDER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'WEBHOOK':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-100">Live Agent Reasoning Stream</h3>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Autonomous Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time decisions, tool calls, and API responses</p>
          </div>
        </div>

        {/* Filters and Clear */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
            {['ALL', 'COLLECT', 'SPEND', 'REMINDER', 'WEBHOOK'].map(flow => (
              <button
                key={flow}
                onClick={() => setFilterFlow(flow)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterFlow === flow
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {flow}
              </button>
            ))}
          </div>

          <button
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Clear stream"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {filteredSteps.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="font-medium text-slate-400">No reasoning events in this filter</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Trigger a receipt upload or Channel3 restock to watch the agent reason in real time.
            </p>
          </div>
        ) : (
          filteredSteps.map((step, idx) => {
            const isExpanded = Boolean(expandedIds[step.id]);
            const hasData = Boolean(step.toolArgs || step.toolResult);

            return (
              <div 
                key={step.id}
                className={`rounded-xl border p-3 transition-all ${
                  step.level === 'warning'
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                    : step.level === 'success'
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                }`}
              >
                {/* Step Top Bar */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-slate-900 border border-slate-800">
                      {getStepIcon(step)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getFlowBadgeColor(step.flow)}`}>
                      {step.flow}
                    </span>
                    {step.toolName && (
                      <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        tool: {step.toolName}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Title & Detail */}
                <div className="mt-2">
                  <h4 className="font-semibold text-slate-100 text-xs">{step.title}</h4>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{step.detail}</p>
                </div>

                {/* Expandable tool arguments / response inspection */}
                {hasData && (
                  <div className="mt-2 pt-2 border-t border-slate-800/50">
                    <button
                      onClick={() => toggleExpand(step.id)}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <span>{isExpanded ? 'Hide Payload / Tool Inspection' : 'Inspect Tool Arguments & Results'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 bg-slate-950 rounded-lg p-2.5 font-mono text-[10px] text-slate-300 border border-slate-800 overflow-x-auto space-y-2">
                        {step.toolArgs && (
                          <div>
                            <span className="text-amber-400 font-semibold block mb-0.5">// Tool Input Arguments:</span>
                            <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(step.toolArgs, null, 2)}</pre>
                          </div>
                        )}
                        {step.toolResult && (
                          <div>
                            <span className="text-emerald-400 font-semibold block mb-0.5">// Tool Execution Output:</span>
                            <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(step.toolResult, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between px-4">
        <span>Displaying {filteredSteps.length} reasoning events</span>
        <span className="text-slate-500">Autonomous execution verifiable via API response inspector</span>
      </div>
    </div>
  );
};
