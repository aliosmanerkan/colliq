"use client";

import { ShieldCheck, ArrowRightLeft, Lock, TrendingUp, Sparkles, Send, Coins } from "lucide-react";

export default function VaultCard({ vault, onInspect, onTransfer }) {
  if (!vault) return null;

  const isLocked = vault.is_locked;
  const pnlPositive = (vault.pnl_percentage || 0) >= 0;

  // Tier styling
  const tierBadges = {
    ROOKIE: { label: "ROOKIE TRADER", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    CERTIFIED_MERCHANT: { label: "CERTIFIED MERCHANT", bg: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
    WHALE_VAULT: { label: "WHALE VAULT", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    LEGENDARY_DECK: { label: "LEGENDARY DECK", bg: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
  };

  const badge = tierBadges[vault.tier] || tierBadges.ROOKIE;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between transition hover:-translate-y-1 duration-200">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${badge.bg}`}>
            {badge.label}
          </span>

          <div className="flex items-center gap-1.5">
            {isLocked ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/30">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live A2A
              </span>
            )}
          </div>
        </div>

        {/* Vault Title & Sub-account */}
        <h3 className="text-base font-bold text-white tracking-tight truncate">{vault.name}</h3>
        <div className="text-xs font-mono text-cyan-400 flex items-center gap-1 mt-0.5">
          <span>{vault.sub_account}</span>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{vault.bio}</p>

        {/* Strategy pill */}
        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-medium text-slate-300 border border-slate-700/60">
            {vault.strategy}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Max Spend: ${vault.guardrail_max_spend_per_trade}
          </span>
        </div>

        {/* Metric Boxes */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">Cash Vault</div>
            <div className="text-sm font-black text-white font-mono flex items-center gap-1 mt-0.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              ${Number(vault.usdc_balance || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">USDC</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">Net PnL (A2A)</div>
            <div className={`text-sm font-black font-mono mt-0.5 ${pnlPositive ? "text-emerald-400" : "text-rose-400"}`}>
              {pnlPositive ? "+" : ""}{(vault.pnl_percentage || 0).toFixed(1)}%
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">RWA Inventory</div>
            <div className="text-sm font-black text-cyan-300 font-mono mt-0.5">
              {vault.inventoryCount || 0} Slabs
            </div>
            <div className="text-[9px] text-slate-400 font-mono truncate">
              Val: ${Number(vault.inventoryValueUsdc || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[9px] font-mono text-slate-400 uppercase">Settled Deals</div>
            <div className="text-sm font-black text-slate-200 font-mono mt-0.5">
              {vault.total_trades || 0} Trades
            </div>
            <div className="text-[9px] text-slate-400 font-mono truncate">
              {vault.unique_counterparties || 0} Peers
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onInspect(vault)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Inspect NFT
        </button>

        <button
          onClick={() => onTransfer(vault)}
          title="Transfer NFT + Cash + Slabs + Wipe Zombie Key"
          className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          Transfer Box
        </button>
      </div>
    </div>
  );
}
