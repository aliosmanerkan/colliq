"use client";

import { Flame, ShieldCheck, Sparkles } from "lucide-react";
import { usdToNear } from "@/lib/near";

export default function CardSlab({ card, compact = false }) {
  if (!card) return null;

  const isGemMint = card.grade?.includes("10");

  return (
    <div className="group relative rounded-[24px] p-4 bg-white border border-neutral-200/80 hover:border-[#a8f0be] shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(4,50,36,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      
      <div>
        {/* Apple Style Slab Header */}
        <div className="mb-3 px-3 py-1.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-red-600 font-mono tracking-wider">PSA</span>
            <span className="text-xs font-semibold text-neutral-900 tracking-tight">{card.grade || "GEM MT 10"}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#053b2a]">
            <ShieldCheck className="w-3 h-3 text-[#053b2a]" />
            <span>Brink's RWA</span>
          </div>
        </div>

        {/* Card Artwork Presentation */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#f4f6f5] flex items-center justify-center p-3 border border-neutral-200/60 group-hover:border-neutral-300 transition">
          {card.image_url ? (
            <img
              src={card.image_url}
              alt={card.name}
              className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-xs text-neutral-400 font-medium">PSA SLAB</div>
          )}

          {card.rareness_score && (
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 text-[10px] font-semibold text-amber-700 flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Rare {card.rareness_score}/100</span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="mt-3.5 space-y-1">
          <h3 className="text-sm font-semibold text-neutral-900 tracking-tight truncate group-hover:text-[#053b2a] transition" title={card.name}>
            {card.name}
          </h3>
          <p className="text-xs text-neutral-500 truncate">{card.set_name || "Insured Vault Sealed"}</p>
        </div>
      </div>

      {/* Valuation Footer */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Fair Value</div>
          <div className="text-sm font-semibold text-neutral-900 font-mono mt-0.5">
            ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} <span className="text-xs text-neutral-400 font-normal">USDC</span>
          </div>
          <div className="text-[11px] font-mono text-[#053b2a] font-semibold">
            ≈ {usdToNear(card.oracle_fair_value_usdc || 0)} NEAR
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Custody</div>
          <div className="text-xs text-neutral-600 font-mono mt-0.5 truncate max-w-[90px] font-medium">
            {card.owner_account ? card.owner_account.split(".")[0] : "Brink's"}
          </div>
        </div>
      </div>
    </div>
  );
}
