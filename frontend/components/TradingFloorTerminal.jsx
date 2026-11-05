"use client";

import { useState } from "react";
import { Terminal, Zap, ShieldAlert, CheckCircle2, ArrowRightLeft, RefreshCw, Cpu } from "lucide-react";

export default function TradingFloorTerminal({ socketStatus, onTriggerCycle, isTriggering, liveEvents, tradeHistory }) {
  const [selectedTrade, setSelectedTrade] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Terminal Streaming View */}
      <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              A2A Swarm Engine • Stateless RAM Worker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Socket: {socketStatus}
            </span>

            <button
              onClick={onTriggerCycle}
              disabled={isTriggering}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Zap className={`w-3.5 h-3.5 ${isTriggering ? "animate-spin" : ""}`} />
              {isTriggering ? "Negotiating..." : "Trigger A2A Deal"}
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 font-mono text-xs text-slate-300">
          <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800/80">
            [NEAR_SYSTEM] Event-driven stateless worker initialized. Listening on consensus.market.near...
          </div>

          {liveEvents.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
              <span>Awaiting next trading tick or manual trigger...</span>
              <button
                onClick={onTriggerCycle}
                className="mt-2 text-xs text-cyan-400 underline hover:text-cyan-300"
              >
                Click to simulate 3-round A2A negotiation
              </button>
            </div>
          ) : (
            liveEvents.map((evt, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition ${
                  evt.type === "round"
                    ? "bg-slate-900/60 border-slate-800/90 text-slate-200"
                    : evt.type === "settled"
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : evt.type === "match"
                    ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-300"
                    : "bg-amber-950/20 border-amber-500/30 text-amber-300"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold uppercase tracking-wider text-cyan-400">
                    {evt.speaker || evt.type}
                  </span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{evt.message}</p>
                {evt.details && (
                  <div className="mt-2 p-2 rounded bg-black/40 text-[10px] text-slate-400">
                    TX: <span className="text-indigo-400 font-mono">{evt.details.txHash || "0x..."}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settled Trades Sidebar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-2xl flex flex-col h-[650px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Settled Ledger Trades</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
            {tradeHistory.length} Deals
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {tradeHistory.map((trade) => (
            <div
              key={trade.id || trade.trade_id}
              onClick={() => setSelectedTrade(trade)}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                <span className="text-emerald-400 font-bold">ATOMIC SWAP</span>
                <span>Block #{trade.near_block || 1184920}</span>
              </div>

              <div className="text-xs font-bold text-white truncate">
                {trade.vault_a_name} ⇄ {trade.vault_b_name}
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Rounds: {trade.rounds_count}</span>
                <span className="text-cyan-400 font-bold">
                  Fee: ${trade.protocol_fee_usdc} USDC
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
