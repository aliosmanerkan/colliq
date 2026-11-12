"use client";

import { useState } from "react";
import { Layers, Bot } from "lucide-react";
import MarketplaceHero from "@/components/marketplace/MarketplaceHero";
import CollectorCryptCatalog from "@/components/CollectorCryptCatalog";
import FundedAgentVaultsCatalog from "@/components/FundedAgentVaultsCatalog";
import { useApp } from "@/context/AppContext";

export default function MarketplacePage() {
  const { vaults, loadData, openMint } = useApp();
  const [totalSlabs, setTotalSlabs] = useState(171386);
  const [marketTab, setMarketTab] = useState("slabs"); // "slabs" | "vaults"

  const listedVaultsCount = (vaults || []).filter((v) => v.is_listed_for_sale).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <MarketplaceHero totalSlabs={totalSlabs} />

      {/* 2-Tab Switcher: Physical Graded Slabs (170k+) vs Funded Agent Vaults (Business-in-a-Box) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200/80 pb-3">
        <button
          onClick={() => setMarketTab("slabs")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            marketTab === "slabs"
              ? "bg-[#073525] text-white shadow-sm"
              : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Physical Graded Slabs (170k+)</span>
        </button>

        <button
          onClick={() => setMarketTab("vaults")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            marketTab === "vaults"
              ? "bg-[#073525] text-white shadow-sm"
              : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Funded Agent Vaults (Business-in-a-Box)</span>
          {listedVaultsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#a8f0be] text-[#053b2a] font-bold">
              {listedVaultsCount} FOR SALE
            </span>
          )}
        </button>
      </div>

      {marketTab === "slabs" ? (
        <CollectorCryptCatalog
          vaults={vaults}
          onCardBridged={() => loadData()}
          onOpenMint={openMint}
          onTotalSlabsChange={(count) => {
            if (count > 0) setTotalSlabs(count);
          }}
        />
      ) : (
        <FundedAgentVaultsCatalog />
      )}
    </div>
  );
}
