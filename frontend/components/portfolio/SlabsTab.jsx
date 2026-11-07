"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SlabsTab() {
  const { cards } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-400">
          Physical Slabs in Brink's Custody ({cards.length})
        </div>
        <span className="text-xs font-mono text-cyan-400">
          Total Valuation: ${cards.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 0), 0).toLocaleString()} USDC
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-500 bg-[#0c0c0e] rounded-[32px] border border-white/[0.08] space-y-4">
          <p>No physical slabs held in your vaults yet.</p>
          <Link
            href="/marketplace"
            className="inline-block px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold transition hover:bg-neutral-200"
          >
            Browse Slabs in Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id || card.card_id}
              className="group relative rounded-[28px] p-4 bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* PSA Header */}
                <div className="mb-3 px-3 py-1.5 rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center justify-between text-xs">
                  <span className="font-bold text-red-500 font-mono">PSA</span>
                  <span className="font-semibold text-white">{card.grade || "GEM MT 10"}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Brink's Sealed</span>
                </div>

                {/* Artwork Box */}
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center p-3 border border-neutral-900 mb-3 group-hover:border-neutral-800 transition">
                  <img
                    src={card.image_url}
                    alt={card.name}
                    loading="lazy"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300"
                  />

                  {card.rareness_score && (
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-[10px] font-medium text-amber-300 flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Rare {card.rareness_score}/100</span>
                    </div>
                  )}
                </div>

                {/* Title & Set */}
                <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[36px] group-hover:text-neutral-200 transition" title={card.name}>
                  {card.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                  <span>{card.category || "TCG"}</span>
                  <span>Cert #{card.psa_cert_number || "Verified"}</span>
                </div>

                {/* Holding Vault Badge */}
                <div className="mt-3 p-2.5 rounded-2xl bg-neutral-950 border border-neutral-900 text-xs flex items-center justify-between">
                  <span className="text-neutral-500">Held in Vault:</span>
                  <span className="font-mono text-cyan-400 font-medium truncate max-w-[130px]">
                    {card.vault?.name || card.owner_account || "Treasury"}
                  </span>
                </div>
              </div>

              {/* Price Footer */}
              <div className="mt-4 pt-3.5 border-t border-neutral-900 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Fair Value:</span>
                <span className="text-sm font-semibold text-white font-mono">
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
