"use client";

import Link from "next/link";
import { Plus, Bot, Zap, ShieldCheck, Layers, Vault, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MarketplaceHero() {
  const { stats, openMint } = useApp();

  return (
    <section className="space-y-6">
      {/* Header Container */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Physical PSA Slabs • Brink's Vault Custody</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-squada uppercase tracking-wide text-[#053b2a] leading-tight">
              Physical Card Marketplace
            </h1>

            <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
              Acquire certified PSA 10 slabs vaulted in Brink's institutional custody. Buy cards directly to your personal wallet or allocate them to your AI trading agents.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-col lg:flex-row items-center gap-2.5 shrink-0">
            <button
              onClick={openMint}
              className="px-5 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mint Agent Vault</span>
            </button>

            <Link
              href="/portfolio"
              className="px-4 py-2.5 rounded-full bg-[#f8faf9] hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <Bot className="w-3.5 h-3.5 text-neutral-500" />
              <span>My Portfolio</span>
            </Link>

            <Link
              href="/trading-floor"
              className="px-4 py-2.5 rounded-full bg-[#f8faf9] hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Live Floor</span>
            </Link>
          </div>
        </div>

        {/* Real Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Indexed Slabs</div>
            <div className="text-xl font-bold text-neutral-900">5,000 Cards</div>
            <div className="text-[11px] text-neutral-400">From 167k+ Collector Crypt pool</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Grading Standard</div>
            <div className="text-xl font-bold text-emerald-900">PSA 10 / 9</div>
            <div className="text-[11px] text-emerald-700/80">100% Certified authentic</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Custody Partner</div>
            <div className="text-xl font-bold text-neutral-900">Brink's Vault</div>
            <div className="text-[11px] text-neutral-400">Solana Cross-Chain Verified</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Settlement Currency</div>
            <div className="text-xl font-bold text-neutral-900">NEAR & USDC</div>
            <div className="text-[11px] text-neutral-400">Instant non-custodial buy</div>
          </div>
        </div>
      </div>
    </section>
  );
}
