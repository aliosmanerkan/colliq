"use client";

import { Flame, ShieldCheck, Sparkles } from "lucide-react";
import { usdToNear } from "@/lib/near";

export default function CardSlab({ card, compact = false }) {
  if (!card) return null;

  const isGemMint = card.grade?.includes("10");

  return (
    <div className="group relative rounded-[28px] p-4 bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.2] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      
      <div>
        {/* Apple Style Slab Header */}
        <div className="mb-3 px-3 py-1.5 rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-red-500 font-mono tracking-wider">PSA</span>
            <span className="text-xs font-semibold text-white tracking-tight">{card.grade || "GEM MT 10"}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Brink's RWA</span>
          </div>
        </div>

        {/* Card Artwork Presentation */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center p-3 border border-neutral-900 group-hover:border-neutral-800 transition">
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.name}
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-xs text-neutral-500 font-medium">PSA SLAB</div>
          )}

          {card.rareness_score && (
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-[10px] font-medium text-amber-300 flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Rare {card.rareness_score}/100</span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="mt-3.5 space-y-1">
          <h3 className="text-sm font-semibold text-white tracking-tight truncate group-hover:text-neutral-200 transition" title={card.name}>
            {card.name}
          </h3>
          <p className="text-xs text-neutral-500 truncate">{card.set_name || "Collector Crypt Sealed"}</p>
        </div>
      </div>

      {/* Valuation Footer */}
      <div className="mt-4 pt-3.5 border-t border-neutral-900 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Fair Value</div>
          <div className="text-sm font-semibold text-white font-mono mt-0.5">
            ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} <span className="text-xs text-neutral-500 font-normal">USDC</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 font-medium">
            ≈ {usdToNear(card.oracle_fair_value_usdc || 0)} NEAR
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Custody</div>
          <div className="text-xs text-neutral-300 font-mono mt-0.5 truncate max-w-[90px]">
            {card.owner_account ? card.owner_account.split(".")[0] : "Brink's"}
          </div>
        </div>
      </div>
    </div>
  );
}
