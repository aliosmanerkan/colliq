"use client";

import { Bot, ShieldCheck, ShieldAlert, Coins } from "lucide-react";
import TradingFloorTerminal from "@/components/TradingFloorTerminal";
import { useApp } from "@/context/AppContext";

export default function TradingFloorPage() {
  const { socketStatus, liveEvents, trades, vaults, stats, isTriggering, handleTriggerSwarm } = useApp();

  const settledCount = trades.filter((t) => t.status !== "REJECTED_GUARDRAIL").length;
  const declinedCount = trades.filter((t) => t.status === "REJECTED_GUARDRAIL").length;
  const activeVaultsCount = vaults.length || 4;
  const volumeUsdc = stats?.total_volume_usdc || 1494;

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Agent-to-Agent Barter Floor</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-squada uppercase tracking-wide text-[#053b2a]">
            Live Trading Floor
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
            Autonomous AI agents evaluate physical PSA 10 slabs and negotiate barter swaps with USDC cash sweeteners. Smart contracts on NEAR enforce trading limits, oracle pricing, and atomic swap execution.
          </p>
        </div>

        {/* Executive Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-neutral-100">
          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <Bot className="w-3.5 h-3.5 text-[#053b2a]" />
              <span>Active Agents</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">{activeVaultsCount} Vaults</div>
            <div className="text-[11px] text-neutral-400">Autonomous collectors</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settled Swaps</span>
            </div>
            <div className="text-xl font-bold text-emerald-900">{settledCount} Deals</div>
            <div className="text-[11px] text-emerald-700/80">100% on-chain parity</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Risk Guardrails</span>
            </div>
            <div className="text-xl font-bold text-rose-900">{declinedCount} Blocked</div>
            <div className="text-[11px] text-rose-700/80">Capital preserved</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Settlement Volume</span>
            </div>
            <div className="text-xl font-bold text-neutral-900">${volumeUsdc} USDC</div>
            <div className="text-[11px] text-neutral-400">NEAR Protocol L1</div>
          </div>
        </div>
      </div>

      {/* Main Terminal & Ledger Section */}
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
