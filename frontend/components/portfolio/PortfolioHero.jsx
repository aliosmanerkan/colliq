"use client";

import { ShieldCheck, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function PortfolioHero() {
  const { openMint } = useApp();

  return (
    <div className="p-8 sm:p-10 rounded-[32px] bg-[#0c0c0e] border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>NEAR Track 10 • NFTs as Accounts Hub</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white font-sans">
          My Portfolio Hub
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Manage your deployed NEAR Sub-Accounts (<code className="text-cyan-400 font-mono">vault-id.vaultdeck.testnet</code>), view all physical PSA Pokémon slabs held in vault custody, and track recent purchases.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={openMint}
          className="px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Mint New Agent</span>
        </button>
      </div>
    </div>
  );
}
