"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SlabsTab() {
  const { cards } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-600">
          Physical Slabs in Brink's Custody ({cards.length})
        </div>
        <span className="text-xs font-mono text-[#053b2a] font-semibold">
          Total Valuation: ${cards.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 0), 0).toLocaleString()} USDC
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-600 bg-white rounded-[28px] border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-4">
          <p>No physical slabs held in your vaults yet.</p>
          <Link
            href="/marketplace"
            className="inline-block px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-md"
          >
            Browse Slabs in Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id || card.card_id}
              className="group relative rounded-[24px] p-4 bg-white border border-neutral-200/80 hover:border-[#a8f0be] transition-all duration-300 flex flex-col justify-between shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(4,50,36,0.08)] hover:-translate-y-1"
            >
              <div>
                {/* PSA Header */}
                <div className="mb-3 px-3 py-1.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/70 flex items-center justify-between text-xs">
                  <span className="font-bold text-red-600 font-mono">PSA</span>
                  <span className="font-semibold text-neutral-900">{card.grade || "GEM MT 10"}</span>
                  <span className="text-[10px] text-[#053b2a] font-semibold">Brink's Sealed</span>
                </div>

                {/* Artwork Box */}
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#f4f6f5] flex items-center justify-center p-3 border border-neutral-200/60 mb-3 group-hover:border-neutral-300 transition">
                  <img
                    src={card.image_url}
                    alt={card.name}
                    loading="lazy"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
                  />

                  {card.rareness_score && (
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 text-[10px] font-semibold text-amber-700 flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>Rare {card.rareness_score}/100</span>
                    </div>
                  )}
                </div>

                {/* Title & Set */}
                <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 min-h-[36px] group-hover:text-[#053b2a] transition" title={card.name}>
                  {card.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                  <span>{card.category || "TCG"}</span>
                  <span>Cert #{card.psa_cert_number || "Verified"}</span>
                </div>

                {/* Holding Vault Badge */}
                <div className="mt-3 p-2.5 rounded-2xl bg-[#f8faf9] border border-neutral-200 text-xs flex items-center justify-between">
                  <span className="text-neutral-500">Held in Vault:</span>
                  <span className="font-mono text-[#053b2a] font-semibold truncate max-w-[130px]">
                    {card.vault?.name || card.owner_account || "Treasury"}
                  </span>
                </div>
              </div>

              {/* Price Footer */}
              <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Fair Value:</span>
                <span className="text-sm font-semibold text-neutral-900 font-mono">
                  ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} USDC
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
