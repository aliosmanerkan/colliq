"use client";

import { ShieldCheck, Flame, ExternalLink } from "lucide-react";

export default function CardSlab({ card, compact = false }) {
  if (!card) return null;

  const isPsa10 = card.grade?.includes("10");

  return (
    <div className="group relative rounded-2xl p-3 bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950 border border-slate-700/80 shadow-2xl hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1">
      {/* Acrylic Slab Header (PSA Tag) */}
      <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-red-500/40 flex items-center justify-between shadow-inner">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black tracking-wider text-red-500 font-mono">PSA</span>
            <span className="text-[11px] font-extrabold text-white font-mono">{card.grade}</span>
          </div>
          <div className="text-[9px] text-slate-400 font-mono tracking-tighter truncate max-w-[150px]">
            #{card.psa_cert_number}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-mono text-emerald-400 font-bold">VERIFIED RWA</div>
          <div className="text-[8px] text-slate-400 font-mono">Brink's Vault</div>
        </div>
      </div>

      {/* Card Artwork & Holographic Window */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950/80 flex items-center justify-center p-2 border border-slate-800">
        {/* Ambient Holographic Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-pink-500/10 opacity-60 group-hover:opacity-100 transition" />

        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            PSA
          </div>
        )}

        {/* Rareness Tag */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 shadow-md">
          <Flame className="w-3 h-3 text-amber-500" />
          Rare {card.rareness_score}/100
        </div>
      </div>

      {/* Slab Footer Info */}
      <div className="mt-3">
        <h3 className="text-xs font-bold text-white truncate" title={card.name}>
          {card.name}
        </h3>
        <p className="text-[10px] text-slate-400 font-mono truncate">{card.set_name}</p>

        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-mono">Oracle Fair Value</div>
            <div className="text-xs font-black text-cyan-400 font-mono">
              ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} <span className="text-[9px] text-slate-400">USDC</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-slate-400 uppercase font-mono">Vault Owner</div>
            <div className="text-[10px] text-slate-300 font-mono truncate max-w-[90px]">
              {card.owner_account?.split(".")[0] || "Treasury"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
