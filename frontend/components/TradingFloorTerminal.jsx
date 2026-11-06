"use client";

import { useState } from "react";
import { 
  Terminal, 
  Zap, 
  CheckCircle2, 
  ArrowRightLeft, 
  Clock
} from "lucide-react";

export default function TradingFloorTerminal({ socketStatus, onTriggerCycle, isTriggering, liveEvents, tradeHistory }) {
  const [selectedTrade, setSelectedTrade] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Live macOS Terminal View */}
      <div className="lg:col-span-2 rounded-[32px] bg-[#0c0c0e] border border-white/[0.08] shadow-2xl flex flex-col h-[680px] overflow-hidden">
        
        {/* macOS Window Titlebar */}
        <div className="px-6 py-4 bg-neutral-950/80 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block shadow-sm" />
            </div>

            <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-300">
                A2A Swarm Engine • RAM Worker
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>WS: {socketStatus}</span>
            </div>

            <button
              onClick={onTriggerCycle}
              disabled={isTriggering}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <Zap className={`w-3.5 h-3.5 ${isTriggering ? "animate-spin" : ""}`} />
              <span>{isTriggering ? "Negotiating..." : "Trigger Deal"}</span>
            </button>
          </div>
        </div>

        {/* Terminal Body Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3 font-mono text-xs text-neutral-300">
          <div className="text-neutral-500 text-[11px] pb-3 border-b border-neutral-900 flex items-center justify-between">
            <span>[NEAR_SYSTEM] Event-driven RAM worker active. Listening on consensus.market.near...</span>
            <span className="flex items-center gap-1 text-neutral-500">
              <Clock className="w-3 h-3" /> Live Feed
            </span>
          </div>

          {liveEvents.length === 0 ? (
            <div className="h-[460px] flex flex-col items-center justify-center text-neutral-500 gap-3 text-center px-4 font-sans">
              <p className="text-sm font-medium text-white">Awaiting next barter cycle...</p>
              <p className="text-xs text-neutral-400 max-w-sm">
                Click below to simulate autonomous 3-round barter negotiation between Merchant Vaults.
              </p>
              <button
                onClick={onTriggerCycle}
                className="mt-2 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-medium transition"
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
                    ? "bg-neutral-950/80 border-neutral-900 text-neutral-200"
                    : evt.type === "settled"
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : evt.type === "match"
                    ? "bg-neutral-900/80 border-neutral-700 text-white"
                    : "bg-amber-950/20 border-amber-500/30 text-amber-300"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-white">
                    {evt.speaker || evt.type}
                  </span>

                  <div className="flex items-center gap-2">
                    {evt.decision && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        evt.decision === "ACCEPT" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" :
                        evt.decision === "COUNTER" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                        "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      }`}>
                        {evt.decision}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap text-xs font-mono">{evt.message}</p>

                {evt.details && (
                  <div className="mt-2 p-2 rounded-xl bg-black/60 text-[10px] text-neutral-400 flex items-center justify-between">
                    <span>NEAR Atomic Settlement TX:</span>
                    <span className="text-white font-mono">{evt.details.txHash || "0x9482bf...38a"}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settled Trades Sidebar */}
      <div className="rounded-[32px] bg-[#0c0c0e] border border-white/[0.08] p-6 shadow-2xl flex flex-col h-[680px]">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Settled Ledger</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
            {tradeHistory.length} Deals
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tradeHistory.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-neutral-500 text-xs text-center font-sans">
              <span>No settled trades yet.</span>
            </div>
          ) : (
            tradeHistory.map((trade) => (
              <div
                key={trade.id || trade.trade_id}
                onClick={() => setSelectedTrade(trade)}
                className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-700 cursor-pointer transition group"
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-2">
                  <span className="text-emerald-400 font-medium">ATOMIC SWAP</span>
                  <span>Block #{trade.near_block || 276376000}</span>
                </div>

                <div className="text-xs font-semibold text-white group-hover:text-neutral-200 transition truncate">
                  {trade.vault_a_name} <span className="text-neutral-600 font-normal">⇄</span> {trade.vault_b_name}
                </div>

                <div className="mt-2.5 pt-2 border-t border-neutral-900 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500">{trade.rounds_count || 3} Rounds</span>
                  <span className="text-white font-medium">Fee: ${trade.protocol_fee_usdc || 1.25}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
