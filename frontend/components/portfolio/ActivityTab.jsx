"use client";

import { ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ActivityTab() {
  const { trades, cards } = useApp();

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-neutral-400 pb-2">
        Recent Purchases, Snipes & A2A Deals
      </div>

      {trades.length === 0 && cards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-500 bg-[#0c0c0e] rounded-[32px] border border-white/[0.08]">
          No activity recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Trades Activity */}
          {trades.map((trade) => (
            <div
              key={trade.id || trade.trade_id}
              className="p-4 sm:p-5 rounded-2xl bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.16] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      A2A Barter Swap Settled
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400">
                      Block #{trade.near_block || "276,376,000"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {trade.vault_a_name} ⇄ {trade.vault_b_name} ({trade.rounds_count || 3} negotiation rounds)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="text-xs text-emerald-400 font-semibold">
                  Fee: ${trade.protocol_fee_usdc || 1.25} USDC
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  Atomic Swap Verified
                </div>
              </div>
            </div>
          ))}

          {/* Recently Acquired Cards */}
          {cards.slice(0, 8).map((card) => (
            <div
              key={`acq-${card.id}`}
              className="p-4 sm:p-5 rounded-2xl bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.16] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={card.image_url}
                  alt=""
                  className="w-10 h-14 object-contain rounded-xl bg-black p-1 border border-neutral-800 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {card.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {card.grade}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Acquired into {card.vault?.name || card.owner_account} • Brink's Sealed
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="text-xs text-white font-semibold">
                  ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} USDC
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>In Vault Custody</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
