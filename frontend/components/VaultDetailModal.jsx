"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Bot,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import api from "@/lib/api";

export default function VaultDetailModal({ vault, isOpen, onClose, onOpenChat }) {
  const [copied, setCopied] = useState(false);
  const [withdrawingCardId, setWithdrawingCardId] = useState(null);
  const [withdrawMsg, setWithdrawMsg] = useState("");

  if (!isOpen || !vault) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const svgUrl = `${baseUrl}/vaults/${vault.id}/svg`;

  const handleWithdrawCard = async (cardId) => {
    setWithdrawingCardId(cardId);
    setWithdrawMsg("");
    try {
      await api.post(`/vaults/${vault.id}/withdraw-card`, {
        card_id: cardId,
        destination_account: vault.owner_account,
      });
      setWithdrawMsg(`Card withdrawn directly to ${vault.owner_account}!`);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to withdraw card");
    } finally {
      setWithdrawingCardId(null);
    }
  };

  const handleCopySubAccount = () => {
    navigator.clipboard.writeText(vault.sub_account || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-[32px] bg-[#0c0c0e] border border-white/[0.1] p-6 sm:p-10 shadow-2xl my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-900 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{vault.name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
                {vault.tier}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <div 
                onClick={handleCopySubAccount}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer hover:text-white transition select-none"
                title="Agent Autonomous Execution Sub-Account (NEAR Track 10)"
              >
                <span className="text-cyan-400 font-semibold text-[11px] uppercase">Sub-Acc:</span>
                <span className="font-mono text-neutral-200">{vault.sub_account}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
              </div>

              <span className="text-neutral-700">•</span>

              <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="text-neutral-500 font-semibold text-[11px] uppercase">Owner:</span>
                <span className="font-mono text-emerald-400 font-medium">{vault.owner_account}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left: Dynamic On-Chain SVG */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-neutral-500 uppercase font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>On-Chain Dynamic SVG (NEP-171 / 177)</span>
            </div>

            <div className="relative w-full aspect-[450/640] max-w-[320px] rounded-[28px] overflow-hidden border border-neutral-800 shadow-2xl bg-black p-1 group">
              <img
                src={svgUrl}
                alt="Dynamic Vault SVG"
                className="w-full h-full object-contain rounded-[24px]"
              />
              <a
                href={svgUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black border border-white/[0.1] text-xs font-mono text-white flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Raw SVG
              </a>
            </div>
          </div>

          {/* Right: Portfolio Details */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900">
                <div className="text-xs text-neutral-500 font-medium">USDC Reserves</div>
                <div className="text-xl font-semibold text-white font-mono mt-1">
                  ${Number(vault.usdc_balance || 0).toLocaleString()} <span className="text-xs text-neutral-500 font-normal">USDC</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900">
                <div className="text-xs text-neutral-500 font-medium">All-Time Return</div>
                <div className="text-xl font-semibold text-emerald-400 font-mono mt-1 flex items-center gap-1">
                  +{(vault.pnl_percentage || 0).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Safety Limits & Rules */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 text-xs space-y-2">
              <div className="text-white font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Safety Controls & Rules</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Enforced by Smart Contract</span>
              </div>
              <div className="text-neutral-400 text-xs space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span>Max Spend per Card:</span>
                  <span className="text-white font-medium font-mono">${vault.guardrail_max_spend_per_trade} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Fair Value Target:</span>
                  <span className="text-emerald-400 font-medium font-mono">≤ {vault.guardrail_min_oracle_fair_value_pct}% of Appraisal</span>
                </div>
                <div className="truncate text-[11px] pt-1 border-t border-neutral-900 text-neutral-500">
                  Agent Key: <span className="text-neutral-400 font-mono">{vault.access_key_public}</span>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <div className="text-xs text-neutral-500 uppercase font-medium mb-2.5 flex items-center justify-between">
                <span>Enclosed Slabs ({vault.inventory?.length || 0})</span>
                <span className="text-white font-mono">
                  ${vault.inventory?.reduce((acc, c) => acc + (c.oracle_fair_value_usdc || 0), 0).toLocaleString()} Value
                </span>
              </div>

              {withdrawMsg && (
                <div className="p-2 mb-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center">
                  {withdrawMsg}
                </div>
              )}

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {vault.inventory && vault.inventory.length > 0 ? (
                  vault.inventory.map((card) => (
                    <div
                      key={card.id}
                      className="p-3 rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <img
                          src={card.image_url}
                          alt=""
                          className="w-8 h-10 object-contain rounded-lg bg-black p-0.5 border border-neutral-800"
                        />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white truncate max-w-[190px]">
                            {card.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {card.grade}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right font-mono text-xs font-semibold text-white">
                          ${card.oracle_fair_value_usdc} USDC
                        </div>
                        <button
                          onClick={() => handleWithdrawCard(card.card_id)}
                          disabled={withdrawingCardId === card.card_id}
                          className="px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 transition active:scale-95 disabled:opacity-50"
                          title={`Withdraw this card from agent sub-account to personal wallet (${vault.owner_account})`}
                        >
                          {withdrawingCardId === card.card_id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                          )}
                          <span>Withdraw</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-neutral-500 py-6 text-center bg-neutral-950 rounded-2xl border border-neutral-900">
                    No slabs held in this vault yet.
                  </div>
                )}
              </div>
            </div>

            {/* Chat Trigger Button */}
            <button
              onClick={() => {
                onClose();
                if (onOpenChat) onOpenChat(vault);
              }}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <Bot className="w-4 h-4 text-white" />
              <span>Chat with Agent & Manage Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
