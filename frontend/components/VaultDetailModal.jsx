"use client";

import { X, Sparkles, Coins, ShieldCheck, Flame, Download } from "lucide-react";
import CardSlab from "./CardSlab";

export default function VaultDetailModal({ vault, isOpen, onClose }) {
  if (!isOpen || !vault) return null;

  const svgUrl = `http://localhost:5001/vaults/${vault.id}/svg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{vault.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {vault.tier}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              NEAR Sub-account: <span className="text-cyan-400">{vault.sub_account}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Dynamic On-Chain SVG Display */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              On-Chain Dynamic SVG (NEP-171 / NEP-177)
            </div>

            <div className="relative w-full aspect-[450/640] max-w-[360px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
              <img
                src={svgUrl}
                alt="Dynamic Vault SVG"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-3 text-[11px] text-slate-500 font-mono text-center">
              Rendered directly on-chain from smart contract state.
            </div>
          </div>

          {/* Right: Portfolio & Enclosed Inventory */}
          <div className="space-y-4">
            {/* Cash & Metrics */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">USDC Balance</div>
                <div className="text-base font-black text-emerald-400 mt-1">
                  ${Number(vault.usdc_balance || 0).toLocaleString()} USDC
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">All-Time PnL</div>
                <div className="text-base font-black text-cyan-400 mt-1">
                  +{(vault.pnl_percentage || 0).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Guardrails Info */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Active On-Chain Guardrails
              </div>
              <div className="text-slate-400 text-[11px]">
                • Max Spend per Deal: <span className="text-white">${vault.guardrail_max_spend_per_trade}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                • Min Fair Value Required: <span className="text-white">{vault.guardrail_min_oracle_fair_value_pct}%</span>
              </div>
              <div className="text-slate-400 text-[11px] truncate">
                • Agent Access Key: <span className="text-indigo-400">{vault.access_key_public}</span>
              </div>
            </div>

            {/* Inventory List */}
            <div>
              <div className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
                <span>Enclosed RWA Slabs ({vault.inventory?.length || 0})</span>
                <span className="text-cyan-400 text-[11px]">
                  Total: ${vault.inventory?.reduce((acc, c) => acc + (c.oracle_fair_value_usdc || 0), 0).toLocaleString()} USDC
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {vault.inventory && vault.inventory.length > 0 ? (
                  vault.inventory.map((card) => (
                    <div
                      key={card.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={card.image_url}
                          alt=""
                          className="w-8 h-10 object-contain rounded bg-black/40 p-0.5 border border-slate-800"
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate max-w-[200px]">
                            {card.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {card.grade} • #{card.psa_cert_number}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-cyan-400">
                          ${card.oracle_fair_value_usdc}
                        </div>
                        <div className="text-[9px] text-emerald-400">PSA 10</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-4 text-center">
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
