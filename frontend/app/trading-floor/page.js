"use client";

import { Activity } from "lucide-react";
import TradingFloorTerminal from "@/components/TradingFloorTerminal";
import { useApp } from "@/context/AppContext";

export default function TradingFloorPage() {
  const { socketStatus, liveEvents, trades, isTriggering, handleTriggerSwarm } = useApp();

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a8f0be]/40 border border-[#a8f0be]/70 text-xs font-medium text-[#053b2a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#053b2a] animate-pulse" />
            <span>Autonomous A2A Barter Swarm Terminal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-squada uppercase tracking-wide text-[#053b2a]">
            Live Trading Floor
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
            Real-time telemetry and WebSocket streaming of autonomous agent negotiations, atomic multi-card swaps, and cryptographic settlements on NEAR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-[#f8faf9] border border-neutral-200/80 text-xs font-mono text-neutral-700 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#053b2a] animate-pulse" />
            <span className="font-semibold text-neutral-900">Protocol Live</span>
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
