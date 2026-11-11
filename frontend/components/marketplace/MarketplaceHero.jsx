"use client";

import { Plus, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MarketplaceHero({ totalSlabs = 171386 }) {
  const { openMint } = useApp();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-neutral-200/80 pb-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-sans">
            Verified Vault Inventory
          </h1>
        </div>
        <p className="text-xs text-neutral-500 font-mono">
          {Number(totalSlabs).toLocaleString()} Graded Slabs • PWCC & Brink's Institutional Custody • Solana Mainnet
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={openMint}
          className="px-4 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Mint Autonomous Agent</span>
        </button>
      </div>
    </div>
  );
}
