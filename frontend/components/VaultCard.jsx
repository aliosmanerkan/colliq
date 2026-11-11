"use client";

import { useState } from "react";
import { 
  Bot, 
  Wallet, 
  Layers, 
  TrendingUp, 
  Copy, 
  Check, 
  Send, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export default function VaultCard({ vault, onInspect, onTransfer, onChat }) {
  const [copied, setCopied] = useState(false);

  if (!vault) return null;

  const isLocked = vault.is_locked;
  const pnl = vault.pnl_percentage || 0;
  const pnlPositive = pnl >= 0;
  const cardsCount = vault.inventoryCount || (vault.inventory ? vault.inventory.length : 0);
  const cardsValue = (vault.inventory || []).reduce((acc, c) => acc + (c.oracle_fair_value_usdc || 0), 0);
  const totalBalance = Number(vault.usdc_balance || 0) + cardsValue;

  let customRules = [];
  try {
    customRules = JSON.parse(vault.custom_rules || "[]");
  } catch {}

  const handleCopySubAccount = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vault.sub_account || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-[28px] bg-white border border-neutral-200/80 hover:border-[#a8f0be] p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(4,50,36,0.08)] transition-all duration-300 flex flex-col justify-between">
      
      <div>
        {/* Header: Avatar, Name & Live Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a8f0be]/30 border border-[#a8f0be] flex items-center justify-center text-[#053b2a] shadow-sm">
              <Bot className="w-5 h-5 text-[#053b2a]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 group-hover:text-[#053b2a] transition leading-tight">
                {vault.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-500 font-mono">
                <span>@{vault.sub_account}</span>
                <span>•</span>
                <span>Cap: ${vault.guardrail_max_spend_per_trade || 250}</span>
              </div>
            </div>
          </div>

          <div>
            {isLocked ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                <span>Negotiating...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Total Assets Managed Card */}
        <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 mb-4 space-y-3">
          <div>
            <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
              Total Agent Valuation
            </span>
            <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5 flex items-baseline justify-between">
              <span>${totalBalance.toLocaleString()} <span className="text-xs font-normal text-neutral-500 font-sans">USDC</span></span>
              <span className={`text-xs font-semibold font-mono ${pnlPositive ? "text-emerald-700" : "text-rose-700"}`}>
                {pnlPositive ? "+" : ""}{pnl.toFixed(1)}% PnL
              </span>
            </div>
          </div>

          {/* Breakdown: Cash vs Cards */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/70 text-xs">
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-400">Cash Treasury</div>
                <div className="font-mono font-semibold text-neutral-800">${Number(vault.usdc_balance || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#053b2a] shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-400">Cards Owned</div>
                <div className="font-mono font-semibold text-neutral-800">{cardsCount} Cards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Directives Preview */}
        <div className="space-y-1.5 mb-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#053b2a]" />
              <span>Trading Directives ({customRules.length})</span>
            </span>
            <span className="text-[10px] text-neutral-400">{vault.total_trades || 0} Trades Settled</span>
          </div>
          
          <div className="p-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-600 text-ellipsis overflow-hidden line-clamp-1">
            {customRules.length > 0 
              ? customRules[0] 
              : "Standard fair-value target (≤80% Oracle appraisal)."}
          </div>
        </div>

        {/* Sub-Account Tag */}
        <div 
          onClick={handleCopySubAccount}
          className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8faf9] border border-neutral-200 text-[11px] font-mono text-neutral-600 hover:text-neutral-900 cursor-pointer transition select-none"
          title="Click to copy on-chain agent address"
        >
          <span>{vault.sub_account}</span>
          {copied ? <Check className="w-3 h-3 text-[#053b2a]" /> : <Copy className="w-3 h-3 text-neutral-400" />}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-2">
        <button
          onClick={() => onChat && onChat(vault)}
          className="flex-1 py-2.5 px-4 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5 text-white" />
          <span>Command Studio</span>
        </button>

        <button
          onClick={() => onInspect && onInspect(vault)}
          className="py-2.5 px-3.5 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <span>Cards ({cardsCount})</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-600" />
        </button>

        <button
          onClick={() => onTransfer && onTransfer(vault)}
          title="Transfer or sell this agent"
          className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
