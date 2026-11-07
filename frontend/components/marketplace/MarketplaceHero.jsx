"use client";

import Link from "next/link";
import { Plus, Bot, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MarketplaceHero() {
  const { stats, openMint } = useApp();

  return (
    <section className="text-center sm:text-left flex flex-col items-center sm:items-start mb-12">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-300 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>NEAR Track 10 • NFTs as Accounts</span>
        <span className="text-neutral-600">•</span>
        <span className="text-neutral-400">Agentic Pokémon Card Marketplace</span>
      </div>

      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-4xl leading-[1.08]">
        Card Marketplace & Autonomous AI Agents.
      </h1>

      <p className="text-lg sm:text-xl text-neutral-400 font-normal max-w-3xl mt-4 leading-relaxed">
        Buy verified physical PSA 10 slabs directly or mint a custom <strong className="text-white">Trading Agent (NEAR Sub-Account)</strong> that hunts and snipes cards on your terms 24/7.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mt-8">
        <button
          onClick={openMint}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Mint Agent</span>
        </button>

        <Link
          href="/portfolio"
          className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs sm:text-sm font-medium flex items-center gap-2 transition active:scale-95"
        >
          <Bot className="w-4 h-4 text-neutral-400" />
          <span>My Agents</span>
        </Link>

        <Link
          href="/trading-floor"
          className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs sm:text-sm font-medium flex items-center gap-2 transition active:scale-95"
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Live Trading Floor</span>
        </Link>
      </div>

      {/* Apple Bento Grid Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 w-full text-left">
        {/* Box 1 */}
        <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
          <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Protocol Volume</div>
          <div className="text-2xl sm:text-3xl font-semibold text-white font-mono mt-3">
            ${stats ? Number(stats.total_aum_usdc).toLocaleString() : "..."} <span className="text-xs text-neutral-500 font-normal">USDC</span>
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            USDC cash reserves + PSA slab custody
          </div>
        </div>

        {/* Box 2 */}
        <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
          <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Active Trading Agents</div>
          <div className="text-2xl sm:text-3xl font-semibold text-white font-mono mt-3">
            {stats ? stats.total_vaults : "..."} <span className="text-xs text-neutral-500 font-normal">Sub-Accounts</span>
          </div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            24/7 Autonomous Hunter Agents
          </div>
        </div>

        {/* Box 3 */}
        <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
          <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Brink's Physical Vault</div>
          <div className="text-2xl sm:text-3xl font-semibold text-white font-mono mt-3">
            {stats ? stats.total_cards : "..."} <span className="text-xs text-neutral-500 font-normal">Slabs</span>
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            Sealed PSA 10/9 RWA Certifications
          </div>
        </div>

        {/* Box 4 */}
        <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
          <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Settled Trades</div>
          <div className="text-2xl sm:text-3xl font-semibold text-emerald-400 font-mono mt-3">
            {stats ? stats.total_completed_trades : "..."} <span className="text-xs text-neutral-500 font-normal">Swaps & Snipes</span>
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            Volume: ${stats ? Number(stats.total_volume_usdc).toLocaleString() : "0"} USDC
          </div>
        </div>
      </div>
    </section>
  );
}
