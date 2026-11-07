"use client";

import { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Layers, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react";
import api from "@/lib/api";

export default function BuyCardModal({ card, vaults, isOpen, onClose, onSuccess }) {
  const [targetVaultId, setTargetVaultId] = useState(vaults?.[0]?.id ? String(vaults[0].id) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  if (!isOpen || !card) return null;

  const cardPrice = card.insuredUsd || card.costUsd || 0;
  const selectedVault = vaults.find((v) => String(v.id) === String(targetVaultId)) || vaults[0];
  const hasEnoughBalance = selectedVault ? (selectedVault.usdc_balance >= cardPrice) : false;

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!targetVaultId) {
      setError("Please select a target vault");
      return;
    }
    if (!hasEnoughBalance) {
      setError(`Insufficient USDC in selected vault. Required: $${cardPrice}, Available: $${selectedVault?.usdc_balance || 0}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/market/collector-crypt/buy", {
        card_id: card.id,
        vault_id: parseInt(targetVaultId),
        owner_account: "alierkan.testnet",
      });

      setResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[32px] bg-[#0c0c0e] border border-white/[0.1] p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-900 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Buy Card</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Physical PSA Slab • Brink's Vault Custody</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          /* Success Screen */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-6 rounded-[24px] bg-neutral-950 border border-emerald-500/30 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Card Secured & Added to Vault</span>
              </div>

              <div className="flex items-center gap-3.5 pt-2 border-t border-neutral-900">
                <img
                  src={card.imageUrl}
                  alt=""
                  className="w-12 h-16 object-contain rounded-xl bg-black p-1 border border-neutral-800"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-[240px]">{card.name}</h4>
                  <div className="text-xs text-neutral-400 mt-0.5">{card.grade || "PSA 10"} • ${cardPrice} USDC</div>
                  <div className="text-xs text-emerald-400 font-mono mt-1">
                    Deposited into {result.vault?.sub_account}
                  </div>
                </div>
              </div>

              {/* On-Chain Provenance Card */}
              <div className="p-3.5 rounded-2xl bg-[#0c0c0e] border border-neutral-900 font-mono text-[11px] text-neutral-400 space-y-1 mt-2">
                <div className="text-neutral-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>On-Chain Provenance (NEAR Chain Signatures)</span>
                </div>
                <div>• Custody: <span className="text-neutral-200">{result.vault_custody}</span></div>
                <div className="truncate">• Solana Holding Key: <span className="text-neutral-200">{result.solana_holding_address || "SolVault7x9Q..."}</span></div>
                <div className="truncate">• NEAR Settlement TX: <span className="text-white">{result.tx_hash}</span></div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          /* Purchase Form */
          <form onSubmit={handleBuy} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Selected Card Preview */}
            <div className="p-4 rounded-[24px] bg-neutral-950 border border-neutral-900 flex items-center gap-4">
              <img
                src={card.imageUrl}
                alt=""
                className="w-14 h-20 object-contain rounded-xl bg-black p-1.5 border border-neutral-800"
              />
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-900 text-[10px] font-mono text-neutral-300 mb-1">
                  <span>{card.grade || "PSA 10"}</span>
                  <span className="text-neutral-600">•</span>
                  <span>{card.category || "TCG"}</span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate" title={card.name}>
                  {card.name}
                </h3>
                <div className="text-base font-semibold text-white font-mono mt-1">
                  ${Number(cardPrice).toLocaleString()} <span className="text-xs text-neutral-500 font-normal">USDC</span>
                </div>
              </div>
            </div>

            {/* Target Vault Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Select Destination Vault
                </label>
                {selectedVault && (
                  <span className={`text-xs font-mono font-medium ${hasEnoughBalance ? "text-emerald-400" : "text-rose-400"}`}>
                    Treasury: ${selectedVault.usdc_balance} USDC
                  </span>
                )}
              </div>

              <select
                value={targetVaultId}
                onChange={(e) => setTargetVaultId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white/[0.3] transition font-sans"
              >
                {vaults.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.sub_account}) — Balance: ${v.usdc_balance} USDC
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-500 mt-1">
                Card price will be deducted from this vault's USDC cash reserves.
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 text-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Card Valuation:</span>
                <span className="font-mono text-white">${cardPrice} USDC</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Protocol & Gas Fee:</span>
                <span className="text-emerald-400 font-medium">Free (Zero Gas)</span>
              </div>
              <div className="pt-2 border-t border-neutral-900 flex items-center justify-between font-semibold">
                <span className="text-white">Total Amount:</span>
                <span className="text-white font-mono text-sm">${cardPrice} USDC</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !hasEnoughBalance}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40 shadow-sm"
              >
                <span>{loading ? "Purchasing..." : "Confirm Purchase"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
