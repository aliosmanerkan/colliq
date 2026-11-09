"use client";

import { useState } from "react";
import { 
  Lock, 
  Sparkles, 
  Send, 
  Coins, 
  Copy, 
  Check, 
  Eye, 
  FileCode, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  MessageSquare,
  Bot
} from "lucide-react";

export default function VaultCard({ vault, onInspect, onTransfer, onChat }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // "card" | "svg"

  if (!vault) return null;

  const isLocked = vault.is_locked;
  const pnl = vault.pnl_percentage || 0;
  const pnlPositive = pnl >= 0;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const svgUrl = `${baseUrl}/vaults/${vault.id}/svg`;

  let customRulesCount = 0;
  try {
    customRulesCount = JSON.parse(vault.custom_rules || "[]").length;
  } catch {}

  const handleCopySubAccount = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vault.sub_account || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apple-style Tier Labels
  const getTierBadge = (tier) => {
    const t = (tier || "").toUpperCase();
    if (t.includes("WHALE")) return "Whale Tier";
    if (t.includes("SHARK") || t.includes("CERTIFIED")) return "Shark Merchant";
    return "Rookie Vault";
  };

  return (
    <div className="group relative rounded-[24px] bg-white border border-neutral-200/80 hover:border-[#a8f0be] p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(4,50,36,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      
      <div>
        {/* Top Header: Tier, View Mode Toggle & Status Pills */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#e3fb71]/60 border border-[#d2ec5a]/70 text-[#4d7c0f]">
              {getTierBadge(vault.tier)}
            </span>

            {/* Live SVG Toggle Button */}
            <button
              onClick={() => setViewMode(viewMode === "card" ? "svg" : "card")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium flex items-center gap-1 transition ${
                viewMode === "svg"
                  ? "bg-[#073525] text-white border border-[#073525]"
                  : "bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200"
              }`}
              title="Toggle Live Dynamic On-Chain SVG"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{viewMode === "svg" ? "Metrics" : "Live SVG"}</span>
            </button>

            {/* Chat & Directives Pill Button in Header */}
            <button
              onClick={() => onChat && onChat(vault)}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium flex items-center gap-1 bg-[#a8f0be]/40 hover:bg-[#a8f0be]/60 text-[#053b2a] border border-[#053b2a]/20 transition active:scale-95 shadow-sm"
              title="Chat with Agent & Manage Trading Rules"
            >
              <Bot className="w-3 h-3 text-[#053b2a]" />
              <span>Chat {customRulesCount > 0 && `(${customRulesCount})`}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isLocked ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Locked</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Active</span>
              </span>
            )}
          </div>
        </div>

        {/* View Mode: Dynamic SVG vs Card Details */}
        {viewMode === "svg" ? (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative aspect-[450/600] w-full max-h-[320px] rounded-2xl overflow-hidden border border-neutral-200 bg-[#f4f6f5] flex items-center justify-center p-1 shadow-inner group/svg">
              <img
                src={svgUrl}
                alt="On-Chain Dynamic SVG"
                className="w-full h-full object-contain rounded-xl"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-neutral-200 text-[9px] font-mono text-neutral-800 font-semibold shadow-sm">
                On-Chain SVG (NEP-171)
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono text-center">
              Rendered on NEAR from live vault state & inventory.
            </p>
          </div>
        ) : (
          <>
            {/* Name & Sub-Account Capsule */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-neutral-900 group-hover:text-[#053b2a] transition">
                {vault.name}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <div 
                  onClick={handleCopySubAccount}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f8faf9] border border-neutral-200 text-xs font-mono text-neutral-700 hover:text-neutral-900 cursor-pointer transition select-none"
                  title="Autonomous Bot Execution Sub-Account"
                >
                  <span className="text-[10px] text-[#053b2a] font-semibold uppercase">Sub-Acc:</span>
                  <span>{vault.sub_account}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600" />
                  )}
                </div>

                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f8faf9] border border-neutral-200 text-xs font-mono text-neutral-600"
                  title="Owner & Beneficiary Controller"
                >
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase">Owner:</span>
                  <span className="text-[#053b2a] font-medium truncate max-w-[130px]">{vault.owner_account}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-neutral-500 mt-3 line-clamp-2 leading-relaxed">
              {vault.bio || "Autonomous Merchant Vault trading graded physical Pokémon slabs."}
            </p>

            {/* Strategy Pill */}
            <div className="mt-3.5 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-[11px] text-neutral-700 border border-neutral-200">
                {vault.strategy || "Balanced"}
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                Cap: ${vault.guardrail_max_spend_per_trade || 350}/trade
              </span>
            </div>

            {/* Bento Metrics Box */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              <div className="p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/70">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Cash Treasury</div>
                <div className="text-base font-semibold text-neutral-900 font-mono mt-0.5">
                  ${Number(vault.usdc_balance || 0).toLocaleString()} <span className="text-[10px] text-neutral-400 font-normal">USDC</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/70">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Net Return</div>
                <div className={`text-base font-semibold font-mono mt-0.5 flex items-center gap-1 ${pnlPositive ? "text-emerald-600" : "text-rose-600"}`}>
                  {pnlPositive ? "+" : ""}{pnl.toFixed(1)}%
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/70">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Slabs Custody</div>
                <div className="text-base font-semibold text-neutral-900 font-mono mt-0.5">
                  {vault.inventoryCount || 0} <span className="text-[10px] text-neutral-400 font-normal">Slabs</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/70">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Settled Barters</div>
                <div className="text-base font-semibold text-neutral-900 font-mono mt-0.5">
                  {vault.total_trades || 0} <span className="text-[10px] text-neutral-400 font-normal">Deals</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2">
        <button
          onClick={() => onChat && onChat(vault)}
          className="flex-1 py-2.5 px-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-white" />
          <span>Chat & Rules</span>
        </button>

        <button
          onClick={() => onInspect(vault)}
          className="py-2.5 px-3.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
          title="Open Full Inspector"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#053b2a]" />
          <span>Inspect</span>
        </button>

        <button
          onClick={() => onTransfer(vault)}
          title="Transfer NFT + Cash + Slabs"
          className="py-2.5 px-3 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-600 hover:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
