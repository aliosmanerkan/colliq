"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Target } from "lucide-react";
import TradingFloorTerminal from "@/components/TradingFloorTerminal";
import { useApp } from "@/context/AppContext";

export default function TradingFloorPage() {
  const {
    vaults,
    trades,
    stats,
    isTriggering,
    handleTriggerSwarm,
    isSniping,
    handleTriggerSnipe,
  } = useApp();

  const [isAutoRunning, setIsAutoRunning] = useState(false);

  // Autonomous continuous trading loop (runs every 14s if enabled)
  useEffect(() => {
    if (!isAutoRunning) return;
    const interval = setInterval(() => {
      if (!isTriggering) {
        handleTriggerSwarm();
      }
    }, 14000);
    return () => clearInterval(interval);
  }, [isAutoRunning, isTriggering, handleTriggerSwarm]);

  const userVaultsCount = (vaults || []).filter(
    (v) => !v.sub_account?.includes("collectorcrypt")
  ).length;
  const settledTradesCount = (trades || []).filter(
    (t) => t.status !== "REJECTED_GUARDRAIL"
  ).length;
  const vetoedTradesCount = (trades || []).filter(
    (t) => t.status === "REJECTED_GUARDRAIL"
  ).length;
  const volume = stats?.total_volume_usdc || 1494;

  return (
    <section className="space-y-4 animate-in fade-in duration-200">
      {/* Compact Institutional Top Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-6 py-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Title & Inline Metrics */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Live Agent Trading Floor
          </h1>
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 sm:gap-4 mt-1">
            <span>
              <strong className="text-slate-700 font-semibold">Active Agents:</strong> {userVaultsCount}
            </span>
            <span className="text-slate-300">•</span>
            <span>
              <strong className="text-slate-700 font-semibold">Completed Trades:</strong> {settledTradesCount}
            </span>
            <span className="text-slate-300">•</span>
            <span>
              <strong className="text-slate-700 font-semibold">Declined Offers:</strong> {vetoedTradesCount}
            </span>
            <span className="text-slate-300">•</span>
            <span>
              <strong className="text-slate-700 font-semibold">Total Volume:</strong> ${Number(volume).toLocaleString()} USDC
            </span>
          </div>
        </div>

        {/* Right Side: Integrated Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Auto-Pilot Toggle */}
          <button
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border cursor-pointer ${
              isAutoRunning
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="When enabled, agents continuously trade and find deals every 14 seconds"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAutoRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            <span>Auto-Pilot: {isAutoRunning ? "ON" : "OFF"}</span>
          </button>

          {/* Find Market Deals Button */}
          <button
            onClick={handleTriggerSnipe}
            disabled={isSniping}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-2xs cursor-pointer"
            title="Scan 170k+ Collector Crypt physical slabs against agent buying directives"
          >
            <Target className={`w-3.5 h-3.5 text-slate-600 ${isSniping ? "animate-spin" : ""}`} />
            <span>{isSniping ? "Scanning Market..." : "Find Market Deals"}</span>
          </button>

          {/* Start Agent Trade Button */}
          <button
            onClick={handleTriggerSwarm}
            disabled={isTriggering}
            className="px-4 py-1.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
            title="Start an autonomous trade negotiation between two agents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTriggering ? "animate-spin" : ""}`} />
            <span>{isTriggering ? "Starting Trade..." : "Start Agent Trade"}</span>
          </button>
        </div>
      </div>

      {/* Main Terminal: Active Deal Desk (7 cols) + Deal Tape (5 cols) */}
      <TradingFloorTerminal
        trades={trades}
        onTriggerCycle={handleTriggerSwarm}
        isTriggering={isTriggering}
        onTriggerSnipe={handleTriggerSnipe}
        isSniping={isSniping}
      />
    </section>
  );
}
