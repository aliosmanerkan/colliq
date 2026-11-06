"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

export default function VaultDetailModal({ vault, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !vault) return null;

  const svgUrl = `http://localhost:5001/vaults/${vault.id}/svg`;

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
            
            <div 
              onClick={handleCopySubAccount}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 mt-1 cursor-pointer hover:text-white transition select-none"
            >
              <span>Sub-Account:</span>
              <span className="font-mono text-neutral-200">{vault.sub_account}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
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

            {/* Guardrails */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 text-xs space-y-2">
              <div className="text-white font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-300" />
                <span>On-Chain Guardrails</span>
              </div>
              <div className="text-neutral-400 text-xs space-y-1">
                <div>• Max Spend per Deal: <span className="text-white font-medium">${vault.guardrail_max_spend_per_trade} USDC</span></div>
                <div>• Min Fair Value: <span className="text-white font-medium">{vault.guardrail_min_oracle_fair_value_pct}%</span></div>
                <div className="truncate">• Agent Key: <span className="text-neutral-300 font-mono">{vault.access_key_public}</span></div>
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

                      <div className="text-right font-mono">
                        <div className="text-xs font-semibold text-white">
                          ${card.oracle_fair_value_usdc} USDC
                        </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
