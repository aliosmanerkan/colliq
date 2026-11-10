"use client";

import { Bot, Plus, Wallet, Layers, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function PortfolioHero() {
  const { openMint, vaults, cards, connectedAccount } = useApp();

  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const userVaults = vaults.filter((v) => (v.owner_account || "").toLowerCase() === userAccount);
  const userVaultIds = userVaults.map((v) => v.id);
  const userCards = cards.filter(
    (c) => (c.vault_id && userVaultIds.includes(c.vault_id)) || (c.owner_account || "").toLowerCase() === userAccount
  );

  // Financial metrics for user's portfolio
  const totalCash = userVaults.reduce((sum, v) => sum + Number(v.usdc_balance || 0), 0);
  const totalCardsValue = userCards.reduce((sum, c) => sum + Number(c.oracle_fair_value_usdc || 0), 0);
  const totalAum = totalCash + totalCardsValue;
  const activeAgentsCount = userVaults.filter((v) => !v.is_locked).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a8f0be]/40 border border-[#a8f0be] text-xs font-medium text-[#053b2a]">
            <Bot className="w-3.5 h-3.5 text-[#053b2a]" />
            <span>AI Trader Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-squada uppercase tracking-wide text-[#053b2a]">
            My Portfolio
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-poppins">
            Monitor your autonomous AI agents, track your graded PSA card collection, and review automated trading profits in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openMint}
            className="px-6 py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create New Agent</span>
          </button>
        </div>
      </div>

      {/* Portfolio Financial Overview Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="p-5 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Total Portfolio Value</span>
            <TrendingUp className="w-4 h-4 text-[#053b2a]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 pt-1">
            ${totalAum.toLocaleString()}{" "}
            <span className="text-xs font-normal text-neutral-500 font-sans">USDC</span>
          </div>
          <div className="text-[11px] text-[#053b2a] font-medium pt-1">
            Active capital across all agents
          </div>
        </div>

        {/* Liquid Cash */}
        <div className="p-5 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Available Cash</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 pt-1">
            ${totalCash.toLocaleString()}{" "}
            <span className="text-xs font-normal text-neutral-500 font-sans">USDC</span>
          </div>
          <div className="text-[11px] text-neutral-500 pt-1">
            Ready to deploy for trades
          </div>
        </div>

        {/* Cards Owned */}
        <div className="p-5 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Cards Owned</span>
            <Layers className="w-4 h-4 text-[#053b2a]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 pt-1">
            {userCards.length}{" "}
            <span className="text-xs font-normal text-neutral-500 font-sans">Cards</span>
          </div>
          <div className="text-[11px] text-neutral-500 pt-1">
            Valued at ${totalCardsValue.toLocaleString()} USDC
          </div>
        </div>

        {/* Active Trading Bots */}
        <div className="p-5 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Active AI Agents</span>
            <Bot className="w-4 h-4 text-[#053b2a]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 pt-1">
            {activeAgentsCount}{" "}
            <span className="text-xs font-normal text-neutral-500 font-sans">Running</span>
          </div>
          <div className="text-[11px] text-[#053b2a] font-medium pt-1">
            Autonomous 24/7 scanning
          </div>
        </div>
      </div>
    </div>
  );
}
