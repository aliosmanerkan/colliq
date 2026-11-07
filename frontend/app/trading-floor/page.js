"use client";

import { Activity } from "lucide-react";
import TradingFloorTerminal from "@/components/TradingFloorTerminal";
import { useApp } from "@/context/AppContext";

export default function TradingFloorPage() {
  const { socketStatus, liveEvents, trades, isTriggering, handleTriggerSwarm } = useApp();

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#0c0c0e] border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous A2A Barter Swarm Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white font-sans">
            Live Trading Floor
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Real-time telemetry and WebSocket streaming of autonomous agent negotiations, atomic multi-card swaps, and cryptographic settlements on NEAR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-neutral-900 border border-white/[0.08] text-xs font-mono text-neutral-400 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Protocol Live</span>
          </div>
        </div>
      </div>

      <TradingFloorTerminal
        socketStatus={socketStatus}
        onTriggerCycle={handleTriggerSwarm}
        isTriggering={isTriggering}
        liveEvents={liveEvents}
        tradeHistory={trades}
      />
    </section>
  );
}
