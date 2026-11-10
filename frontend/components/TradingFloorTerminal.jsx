"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  ArrowRightLeft, 
  Clock,
  Play,
  Pause
} from "lucide-react";

export default function TradingFloorTerminal({ socketStatus, onTriggerCycle, isTriggering, liveEvents, tradeHistory }) {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  const formatFullDate = (dateString) => {
    if (!dateString) return "Nov 10, 2026 • 15:29";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Nov 10, 2026";
      const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      return `${day} • ${time}`;
    } catch {
      return "Nov 10, 2026";
    }
  };

  // Autonomous continuous trading loop (runs every 12s if enabled)
  useEffect(() => {
    if (!isAutoRunning) return;
    const interval = setInterval(() => {
      if (!isTriggering) {
        onTriggerCycle();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [isAutoRunning, isTriggering, onTriggerCycle]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Live macOS Terminal View */}
      <div className="lg:col-span-2 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col h-[680px] overflow-hidden">
        
        {/* macOS Window Titlebar */}
        <div className="px-6 py-4 bg-[#f8faf9] border-b border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block shadow-sm" />
            </div>

            <div className="h-4 w-[1px] bg-neutral-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-800">
                A2A Swarm Engine • RAM Worker
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200/80 text-[11px] text-neutral-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#053b2a]" />
              <span>WS: {socketStatus}</span>
            </div>

            {/* Auto-Pilot Continuous Mode Toggle */}
            <button
              onClick={() => setIsAutoRunning(!isAutoRunning)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border cursor-pointer ${
                isAutoRunning
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
                  : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
              }`}
              title="When enabled, agents negotiate and trade continuously every 20 seconds"
            >
              {isAutoRunning ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-pulse" />
                  <span>Auto-Pilot: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-neutral-500 fill-neutral-500" />
                  <span>Auto-Pilot: OFF</span>
                </>
              )}
            </button>

            <button
              onClick={onTriggerCycle}
              disabled={isTriggering}
              className="px-4 py-1.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${isTriggering ? "animate-spin" : ""}`} />
              <span>{isTriggering ? "Negotiating..." : "Trigger Deal"}</span>
            </button>
          </div>
        </div>

        {/* Terminal Body Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3 font-mono text-xs text-neutral-700 bg-[#fbfdfc]">
          <div className="text-neutral-500 text-[11px] pb-3 border-b border-neutral-200/80 flex items-center justify-between">
            <span>[NEAR_SYSTEM] Event-driven RAM worker active. Listening on consensus.market.near...</span>
            <span className="flex items-center gap-1 text-neutral-500">
              <Clock className="w-3 h-3" /> Live Feed
            </span>
          </div>

          {liveEvents.length === 0 ? (
            <div className="h-[460px] flex flex-col items-center justify-center text-neutral-500 gap-3 text-center px-4 font-sans">
              <p className="text-sm font-semibold text-neutral-900">Awaiting next barter cycle...</p>
              <p className="text-xs text-neutral-500 max-w-sm">
                Click below to simulate autonomous 3-round barter negotiation between Merchant Vaults.
              </p>
              <button
                onClick={onTriggerCycle}
                className="mt-2 px-4 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-sm"
              >
                Simulate 3-Round Negotiation
              </button>
            </div>
          ) : (
            liveEvents.map((evt, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  evt.type === "round"
                    ? "bg-white border-neutral-200/80 text-neutral-800 shadow-sm"
                    : evt.type === "settled"
                    ? "bg-[#a8f0be]/20 border-[#a8f0be] text-[#053b2a] shadow-sm ring-1 ring-[#a8f0be]/40"
                    : evt.type === "match"
                    ? "bg-[#e3fb71]/25 border-[#d2ec5a] text-[#3f6212] shadow-sm font-medium"
                    : evt.type === "telemetry"
                    ? "bg-[#f8faf9] border-neutral-200/80 text-neutral-600 font-mono text-[11px]"
                    : "bg-amber-50 border-amber-200 text-amber-900 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-neutral-900">
                    {evt.speaker || evt.type}
                  </span>

                  <div className="flex items-center gap-2">
                    {evt.decision && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        evt.decision === "ACCEPT" ? "bg-[#a8f0be]/40 text-[#053b2a] border-[#a8f0be]" :
                        evt.decision === "COUNTER" ? "bg-amber-100 text-amber-800 border-amber-300" :
                        "bg-rose-100 text-rose-800 border-rose-300"
                      }`}>
                        {evt.decision}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap text-xs font-mono">{evt.message}</p>

                {evt.details && (
                  <div className="mt-2 p-2 rounded-xl bg-neutral-50 border border-neutral-200/70 text-[10px] text-neutral-600 flex items-center justify-between">
                    <span>NEAR Atomic Settlement TX:</span>
                    <span className="text-neutral-900 font-mono font-medium">{evt.details.txHash || "0x9482bf...38a"}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settled Trades Sidebar */}
      <div className="rounded-[28px] bg-white border border-neutral-200/80 p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col h-[680px]">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#053b2a]" />
            <h3 className="text-sm font-squada uppercase tracking-wider text-[#053b2a]">Settled Ledger</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f8faf9] text-neutral-600 border border-neutral-200">
            {tradeHistory.length} Deals
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tradeHistory.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-neutral-400 text-xs text-center font-sans">
              <span>No settled trades yet.</span>
            </div>
          ) : (
            tradeHistory.map((trade) => (
              <div
                key={trade.id || trade.trade_id}
                onClick={() => setSelectedTrade(trade)}
                className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 hover:border-[#a8f0be] hover:bg-white cursor-pointer transition group shadow-sm"
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-2">
                  <span className="text-[#053b2a] font-semibold">ATOMIC SWAP</span>
                  <div className="flex items-center gap-1 font-mono text-neutral-600 text-[10px] font-medium">
                    <Clock className="w-3 h-3 text-[#053b2a]" />
                    <span>{formatFullDate(trade.createdAt)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 font-mono mb-1">
                  Block #{trade.near_block || 276376000}
                </div>

                <div className="text-xs font-semibold text-neutral-900 group-hover:text-[#053b2a] transition truncate">
                  {trade.vault_a_name} <span className="text-neutral-400 font-normal">⇄</span> {trade.vault_b_name}
                </div>

                <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500">{trade.rounds_count || 4} Turns</span>
                  <span className="text-neutral-900 font-semibold">Fee: ${trade.protocol_fee_usdc || 1.25}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
