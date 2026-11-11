"use client";

import { Plus, Wallet, ShieldCheck, ArrowUpRight, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function PortfolioHero() {
  const { openMint, vaults, cards, connectedAccount } = useApp();

  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const userVaults = vaults.filter((v) => (v.owner_account || "").toLowerCase() === userAccount);
  const userVaultIds = userVaults.map((v) => v.id);
  const userCards = cards.filter(
    (c) => (c.vault_id && userVaultIds.includes(c.vault_id)) || (c.owner_account || "").toLowerCase() === userAccount
  );

  const liquidCash = userVaults.reduce((sum, v) => sum + Number(v.usdc_balance || 0), 0);
  const slabsValue = userCards.reduce((sum, c) => sum + Number(c.oracle_fair_value_usdc || 0), 0);
  const nav = liquidCash + slabsValue;
  const activeAgentsCount = userVaults.filter((v) => !v.is_locked).length;

  // Average PnL calculation
  const totalPnL = userVaults.length > 0
    ? userVaults.reduce((sum, v) => sum + (Number(v.pnl_percentage) || 0), 0) / userVaults.length
    : 0;
  const pnlSign = totalPnL >= 0 ? "+" : "";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
      {/* Left: Account Identity & Net Asset Value (NAV) */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{connectedAccount || "alierkan.testnet"}</span>
            <span className="text-neutral-300">•</span>
            <span>Net Asset Value</span>
          </div>

          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 tracking-tight">
              ${Math.round(nav).toLocaleString()}{" "}
              <span className="text-xs font-normal text-neutral-400 font-sans">USDC</span>
            </span>

            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>{pnlSign}{totalPnL.toFixed(1)}%</span>
            </span>
          </div>
        </div>

        {/* Divider for desktop */}
        <div className="hidden lg:block h-10 w-px bg-neutral-200 mx-2" />

        {/* Middle: Breakdown (Liquid Cash • Slabs Value • Active Agents) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-sans">Liquid Treasury</div>
            <div className="text-sm font-bold text-neutral-800">${Math.round(liquidCash).toLocaleString()} USDC</div>
          </div>

          <span className="text-neutral-300 hidden sm:inline">|</span>

          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-sans">Vaulted Slabs</div>
            <div className="text-sm font-bold text-neutral-800">
              {userCards.length} Slabs <span className="text-neutral-400 font-normal">(${Math.round(slabsValue).toLocaleString()})</span>
            </div>
          </div>

          <span className="text-neutral-300 hidden sm:inline">|</span>

          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-sans">Active Agents</div>
            <div className="text-sm font-bold text-[#073525]">{activeAgentsCount} / {userVaults.length} Online</div>
          </div>
        </div>
      </div>

      {/* Right: Compact Deploy Agent Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={openMint}
          className="px-4 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Deploy New Agent</span>
        </button>
      </div>
    </div>
  );
}
