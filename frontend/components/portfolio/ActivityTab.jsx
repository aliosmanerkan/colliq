"use client";

import { ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ActivityTab() {
  const { trades, cards } = useApp();

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-neutral-600 pb-2">
        Recent Purchases, Snipes & A2A Deals
      </div>

      {trades.length === 0 && cards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-600 bg-white rounded-[28px] border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          No activity recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Trades Activity */}
          {trades.map((trade) => (
            <div
              key={trade.id || trade.trade_id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#a8f0be] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#a8f0be]/40 border border-[#043224]/15 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-4 h-4 text-[#053b2a]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900">
                      A2A Barter Swap Settled
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 border border-neutral-200 text-neutral-600">
                      Block #{trade.near_block || "276,376,000"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 font-poppins">
                    {trade.vault_a_name} ⇄ {trade.vault_b_name} ({trade.rounds_count || 3} negotiation rounds)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="text-xs text-[#053b2a] font-semibold">
                  Fee: ${trade.protocol_fee_usdc || 1.25} USDC
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Atomic Swap Verified
                </div>
              </div>
            </div>
          ))}

          {/* Recently Acquired Cards */}
          {cards.slice(0, 8).map((card) => (
            <div
              key={`acq-${card.id}`}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#a8f0be] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={card.image_url}
                  alt=""
                  className="w-10 h-14 object-contain rounded-xl bg-[#f4f6f5] p-1 border border-neutral-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900">
                      {card.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {card.grade}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 font-poppins">
                    Acquired into {card.vault?.name || card.owner_account} • Brink's Sealed
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="text-xs text-neutral-900 font-semibold">
                  ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} USDC
                </div>
                <div className="text-[10px] text-[#053b2a] mt-0.5 flex items-center gap-1 justify-end font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
