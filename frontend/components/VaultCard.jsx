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
    <div className="group relative rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.18] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      
      <div>
        {/* Top Header: Tier, View Mode Toggle & Status Pills */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
              {getTierBadge(vault.tier)}
            </span>

            {/* Live SVG Toggle Button */}
            <button
              onClick={() => setViewMode(viewMode === "card" ? "svg" : "card")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium flex items-center gap-1 transition ${
                viewMode === "svg"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
              title="Toggle Live Dynamic On-Chain SVG"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{viewMode === "svg" ? "Metrics" : "Live SVG"}</span>
            </button>

            {/* Chat & Directives Pill Button in Header */}
            <button
              onClick={() => onChat && onChat(vault)}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 transition active:scale-95 shadow-sm"
              title="Chat with Agent & Manage Trading Rules"
            >
              <Bot className="w-3 h-3 text-cyan-400" />
              <span>Chat {customRulesCount > 0 && `(${customRulesCount})`}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isLocked ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-medium border border-amber-500/20">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Locked</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </span>
            )}
          </div>
        </div>

        {/* View Mode: Dynamic SVG vs Card Details */}
        {viewMode === "svg" ? (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative aspect-[450/600] w-full max-h-[320px] rounded-2xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center p-1 shadow-inner group/svg">
              <img
                src={svgUrl}
                alt="On-Chain Dynamic SVG"
                className="w-full h-full object-contain rounded-xl"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/[0.1] text-[9px] font-mono text-cyan-300">
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
              <h3 className="text-lg font-semibold tracking-tight text-white group-hover:text-neutral-100 transition">
                {vault.name}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <div 
                  onClick={handleCopySubAccount}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white cursor-pointer transition select-none"
                  title="Autonomous Bot Execution Sub-Account"
                >
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase">Sub-Acc:</span>
                  <span>{vault.sub_account}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400" />
                  )}
                </div>

                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400"
                  title="Owner & Beneficiary Controller"
                >
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Owner:</span>
                  <span className="text-emerald-400 font-medium truncate max-w-[130px]">{vault.owner_account}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
              {vault.bio || "Autonomous Merchant Vault trading graded physical Pokémon slabs."}
            </p>

            {/* Strategy Pill */}
            <div className="mt-3.5 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-[11px] text-neutral-300 border border-neutral-800">
                {vault.strategy || "Balanced"}
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                Cap: ${vault.guardrail_max_spend_per_trade || 350}/trade
              </span>
            </div>

            {/* Bento Metrics Box */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-900">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Cash Treasury</div>
                <div className="text-base font-semibold text-white font-mono mt-0.5">
                  ${Number(vault.usdc_balance || 0).toLocaleString()} <span className="text-[10px] text-neutral-500 font-normal">USDC</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-900">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Net Return</div>
                <div className={`text-base font-semibold font-mono mt-0.5 flex items-center gap-1 ${pnlPositive ? "text-emerald-400" : "text-rose-400"}`}>
                  {pnlPositive ? "+" : ""}{pnl.toFixed(1)}%
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-900">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Slabs Custody</div>
                <div className="text-base font-semibold text-white font-mono mt-0.5">
                  {vault.inventoryCount || 0} <span className="text-[10px] text-neutral-500 font-normal">Slabs</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-900">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Settled Barters</div>
                <div className="text-base font-semibold text-white font-mono mt-0.5">
                  {vault.total_trades || 0} <span className="text-[10px] text-neutral-500 font-normal">Deals</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center gap-2">
        <button
          onClick={() => onChat && onChat(vault)}
          className="flex-1 py-2 px-3 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          <Bot className="w-3.5 h-3.5 text-black" />
          <span>Chat & Rules</span>
        </button>

        <button
          onClick={() => onInspect(vault)}
          className="py-2 px-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
          title="Open Full Inspector"
        >
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span>Inspect</span>
        </button>

        <button
          onClick={() => onTransfer(vault)}
          title="Transfer NFT + Cash + Slabs"
          className="py-2 px-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
