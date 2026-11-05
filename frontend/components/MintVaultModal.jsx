"use client";

import { useState } from "react";
import { X, Cpu, ShieldCheck, Sparkles, Coins } from "lucide-react";
import api from "@/lib/api";

export default function MintVaultModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    strategy: "BALANCED_TRADER",
    usdc_deposit: "1000",
    guardrail_max_spend: "350",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/vaults/mint", {
        name: formData.name,
        owner_account: "alierkan.testnet",
        usdc_deposit: parseFloat(formData.usdc_deposit),
        strategy: formData.strategy,
        guardrail_max_spend: parseFloat(formData.guardrail_max_spend),
        bio: formData.bio || "Autonomous Merchant Vault trading graded slabs.",
      });

      if (res.data?.status === "MINTED") {
        onSuccess(res.data.vault);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to mint vault");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mint Merchant Vault NFT</h2>
              <p className="text-xs text-slate-400 font-mono">Creates vault-&lt;id&gt;.market.near Sub-account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
              Vault Merchant Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cerulean Vintage Syndicate"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                Trading Strategy (AI Brain)
              </label>
              <select
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="Aggressive Flipper">Aggressive Flipper</option>
                <option value="PSA 10 Collector">PSA 10 Collector</option>
                <option value="Barter Specialist">Barter Specialist</option>
                <option value="Balanced Trader">Balanced Trader</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                USDC Cash Treasury
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={formData.usdc_deposit}
                  onChange={(e) => setFormData({ ...formData, usdc_deposit: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono"
                />
                <Coins className="w-4 h-4 text-emerald-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
              On-Chain Guardrail: Max Spend / Trade
            </label>
            <input
              type="number"
              min="50"
              required
              value={formData.guardrail_max_spend}
              onChange={(e) => setFormData({ ...formData, guardrail_max_spend: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Contract rejects any barter deal where cash transfer exceeds this limit.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
              Merchant Bio
            </label>
            <textarea
              rows={2}
              placeholder="Tell the trading floor about your collector goals..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              NFTs as Accounts Architecture
            </div>
            <div>• Creates dedicated NEAR Sub-account with 0.002 NEAR storage</div>
            <div>• Grants restricted Function-Call Access Key to AI agent</div>
            <div>• Generates On-Chain Dynamic SVG (NEP-171 / NEP-177)</div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {loading ? "Minting Sub-Account..." : "Mint Vault ($0.01 Gas)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
