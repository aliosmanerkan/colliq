"use client";

import { ShieldCheck, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function PortfolioHero() {
  const { openMint } = useApp();

  return (
    <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a8f0be]/40 border border-[#043224]/15 text-xs font-medium text-[#043224]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#053b2a]" />
          <span>NEAR Track 10 • NFTs as Accounts Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-squada uppercase tracking-wide text-[#053b2a]">
          My Portfolio Hub
        </h1>
        <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-poppins">
          Manage your deployed NEAR Sub-Accounts (<code className="text-[#053b2a] font-mono font-semibold">vault-id.vaultdeck.testnet</code>), view all physical PSA Pokémon slabs held in vault custody, and track recent purchases.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={openMint}
          className="px-6 py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Mint New Agent</span>
        </button>
      </div>
    </div>
  );
}
