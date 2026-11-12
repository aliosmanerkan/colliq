"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  ArrowRightLeft, 
  Clock,
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Bot
} from "lucide-react";
import TradeDetailModal from "@/components/TradeDetailModal";

export default function TradingFloorTerminal({ socketStatus, onTriggerCycle, isTriggering, liveEvents, tradeHistory = [] }) {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState("all"); // "all" | "settled" | "declined"

  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    } catch {
      return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nov 11, 2026";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " • " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Nov 11, 2026";
    }
  };

  // Autonomous continuous trading loop (runs every 14s if enabled)
  useEffect(() => {
    if (!isAutoRunning) return;
    const interval = setInterval(() => {
      if (!isTriggering) {
        onTriggerCycle();
      }
    }, 14000);
    return () => clearInterval(interval);
  }, [isAutoRunning, isTriggering, onTriggerCycle]);

  // Filter settled vs declined
  const filteredTrades = tradeHistory.filter((t) => {
    if (ledgerFilter === "settled") return t.status !== "REJECTED_GUARDRAIL";
    if (ledgerFilter === "declined") return t.status === "REJECTED_GUARDRAIL";
    return true;
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Agent Negotiation Stream (2/3 width) */}
        <div className="lg:col-span-2 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col h-[700px] overflow-hidden">
          
          {/* Stream Header */}
          <div className="px-6 py-4 bg-[#fbfdfc] border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Live Agent Dialogue
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                {liveEvents.length} events
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Auto-Pilot Toggle */}
              <button
                onClick={() => setIsAutoRunning(!isAutoRunning)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border cursor-pointer ${
                  isAutoRunning
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                }`}
                title="When enabled, agents continuously negotiate trades every 14 seconds"
              >
                {isAutoRunning ? (
                  <>
                    <Pause className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-pulse" />
                    <span>Auto-Trade: ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-neutral-500 fill-neutral-500" />
                    <span>Auto-Trade: OFF</span>
                  </>
                )}
              </button>

              {/* Trigger Single Deal Button */}
              <button
                onClick={onTriggerCycle}
                disabled={isTriggering}
                className="px-4 py-1.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                <Zap className={`w-3.5 h-3.5 ${isTriggering ? "animate-spin" : ""}`} />
                <span>{isTriggering ? "Negotiating..." : "Start Agent Negotiation"}</span>
              </button>
            </div>
          </div>

          {/* Dialogue Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3.5 bg-[#fbfdfc]">
            {liveEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#053b2a] mb-3">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">Agents Ready to Barter</h3>
                <p className="text-xs text-neutral-500 max-w-sm mb-4 leading-relaxed">
                  Start an autonomous negotiation to watch two AI collectors evaluate each other's PSA slabs and propose trades in real time.
                </p>
                <button
                  onClick={onTriggerCycle}
                  disabled={isTriggering}
                  className="px-5 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Start Live Negotiation</span>
                </button>
              </div>
            ) : (
              liveEvents.map((evt, idx) => {
                const isMatch = evt.type === "match";
                const isSettled = evt.type === "settled";
                const isRejected = evt.type === "rejected";
                const isSnipe = evt.type === "snipe";
                const isRound = evt.type === "round";

                // Market Snipe Banner
                if (isSnipe) {
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-teal-50/90 border border-teal-300 text-teal-950 space-y-1.5 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-teal-900">
                          <Zap className="w-4 h-4 text-teal-600" />
                          <span>AUTONOMOUS MARKET SNIPE SECURED</span>
                        </div>
                        <span className="text-[10px] text-teal-700 font-mono">{formatTime(evt.timestamp)}</span>
                      </div>
                      <p className="text-xs leading-relaxed font-sans">{evt.message}</p>
                    </div>
                  );
                }

                // Match Found Banner
                if (isMatch) {
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-center justify-between text-xs animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{evt.message}</span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-mono shrink-0 ml-2">{formatTime(evt.timestamp)}</span>
                    </div>
                  );
                }

                // Settled Swap Banner
                if (isSettled) {
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 space-y-2 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>ATOMIC SWAP SETTLED ON NEAR</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono">{formatTime(evt.timestamp)}</span>
                      </div>
                      <p className="text-xs leading-relaxed font-sans">{evt.message}</p>
                      {evt.details?.txHash && (
                        <div className="text-[10px] font-mono text-emerald-800 bg-emerald-100/60 p-2 rounded-xl flex items-center justify-between">
                          <span>NEAR TX Hash:</span>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{evt.details.txHash}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                // Declined / Rejected Banner
                if (isRejected) {
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-rose-50/90 border border-rose-300 text-rose-950 space-y-1.5 animate-in fade-in duration-200 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-rose-900">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>TRADE DECLINED BY GUARDRAIL</span>
                        </div>
                        <span className="text-[10px] text-rose-700 font-mono">{formatTime(evt.timestamp)}</span>
                      </div>
                      <p className="text-xs leading-relaxed font-sans text-rose-900">{evt.message}</p>
                    </div>
                  );
                }

                // Regular Agent Negotiation Turn
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#053b2a]/10 flex items-center justify-center text-[#053b2a] font-bold text-[11px]">
                          {evt.speaker?.[0] || "A"}
                        </div>
                        <span className="font-bold text-neutral-900 text-xs">
                          {evt.speaker}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {evt.decision && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            evt.decision === "ACCEPT" ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                            evt.decision === "REJECT" ? "bg-rose-50 text-rose-800 border-rose-300" :
                            "bg-amber-50 text-amber-800 border-amber-300"
                          }`}>
                            {evt.decision === "ACCEPT" ? "ACCEPTED" : evt.decision === "REJECT" ? "DECLINED" : "COUNTER-OFFER"}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {formatTime(evt.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-800 leading-relaxed font-sans">
                      {evt.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Settled Ledger Sidebar (1/3 width) */}
        <div className="rounded-[28px] bg-white border border-neutral-200/80 p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col h-[700px]">
          
          {/* Ledger Title & Filter Tabs */}
          <div className="pb-4 border-b border-neutral-100 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#053b2a]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Trade Ledger
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                {tradeHistory.length} deals
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 text-xs">
              <button
                onClick={() => setLedgerFilter("all")}
                className={`flex-1 py-1 rounded-lg font-medium transition cursor-pointer text-center ${
                  ledgerFilter === "all" ? "bg-white text-neutral-900 shadow-sm font-semibold" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLedgerFilter("settled")}
                className={`flex-1 py-1 rounded-lg font-medium transition cursor-pointer text-center ${
                  ledgerFilter === "settled" ? "bg-white text-emerald-800 shadow-sm font-semibold" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Settled
              </button>
              <button
                onClick={() => setLedgerFilter("declined")}
                className={`flex-1 py-1 rounded-lg font-medium transition cursor-pointer text-center ${
                  ledgerFilter === "declined" ? "bg-white text-rose-800 shadow-sm font-semibold" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Declined
              </button>
            </div>
          </div>

          {/* Ledger Items List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredTrades.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
                <span>No trades found for this filter.</span>
              </div>
            ) : (
              filteredTrades.map((trade) => {
                const isDeclined = trade.status === "REJECTED_GUARDRAIL";
                const cardA = trade.cards_from_a?.[0];
                const cardB = trade.cards_from_b?.[0];

                return (
                  <div
                    key={trade.id || trade.trade_id}
                    onClick={() => setSelectedTrade(trade)}
                    className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 hover:border-emerald-300 hover:bg-white cursor-pointer transition group shadow-sm relative"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        isDeclined
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}>
                        {isDeclined ? "DECLINED" : "SETTLED"}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {formatDate(trade.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-neutral-900 group-hover:text-[#053b2a] transition truncate">
                      {trade.vault_a_name} <span className="text-neutral-400 font-normal">⇄</span> {trade.vault_b_name}
                    </div>

                    {(cardA || cardB) && (
                      <div className="text-[11px] text-neutral-500 truncate mt-1">
                        {cardA?.name || "Slab"} ⇄ {cardB?.name || "Slab"}
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
                      <span>{trade.rounds_count || 4} Rounds</span>
                      <span className="text-xs font-semibold text-[#053b2a] group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                        Inspect Transcript <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Full Transcript Inspection Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </>
  );
}
