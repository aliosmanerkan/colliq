"use client";

import { useState, useEffect } from "react";
import { X, Cpu, ShieldCheck, Coins, Wallet, Check } from "lucide-react";
import api from "@/lib/api";
import { initNearWallet } from "@/lib/near";

export default function MintVaultModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    strategy: "Balanced Trader",
    usdc_deposit: "1000",
    guardrail_max_spend: "350",
    bio: "",
  });
  const [connectedAccount, setConnectedAccount] = useState("alierkan.testnet");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      initNearWallet().then((w) => {
        if (w?.accountId) {
          setConnectedAccount(w.accountId);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/vaults/mint", {
        name: formData.name,
        owner_account: connectedAccount || "alierkan.testnet",
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

  const strategies = [
    { id: "Balanced Trader", label: "Balanced Trader", desc: "Equal weighting on PnL & inventory" },
    { id: "Aggressive Flipper", label: "Aggressive Flipper", desc: "High trade frequency, quick profit" },
    { id: "PSA 10 Collector", label: "PSA 10 Collector", desc: "Only buys Gem Mint PSA 10 slabs" },
    { id: "Barter Specialist", label: "Barter Specialist", desc: "Prioritizes pure slab-for-slab barters" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-[32px] bg-[#0c0c0e] border border-white/[0.1] p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between pb-5 border-b border-neutral-900 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Yeni Ticaret Ajanı Mint Et</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Özel bir NEAR Sub-Account (vault-&lt;id&gt;.vaultdeck.testnet) oluşturur</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-900 text-xs">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-500">Connected Owner:</span>
              <span className="font-mono text-white font-medium">{connectedAccount}</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase px-2 py-0.5 rounded-full bg-neutral-900">
              NEAR Testnet
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Vault Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cerulean Vintage Syndicate"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.3] transition font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Trading Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              {strategies.map((strat) => (
                <button
                  type="button"
                  key={strat.id}
                  onClick={() => setFormData({ ...formData, strategy: strat.id })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.strategy === strat.id
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{strat.label}</span>
                    {formData.strategy === strat.id && <Check className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <div className={`text-[10px] mt-1 line-clamp-1 ${formData.strategy === strat.id ? "text-neutral-700" : "text-neutral-500"}`}>
                    {strat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                USDC Treasury
              </label>
              <input
                type="number"
                min="50"
                step="50"
                required
                value={formData.usdc_deposit}
                onChange={(e) => setFormData({ ...formData, usdc_deposit: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-white/[0.3] transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Max Spend / Deal
              </label>
              <input
                type="number"
                min="50"
                required
                value={formData.guardrail_max_spend}
                onChange={(e) => setFormData({ ...formData, guardrail_max_spend: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-white/[0.3] transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Merchant Bio
            </label>
            <textarea
              rows={2}
              placeholder="Tell other autonomous vaults about your goals..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.3] transition font-sans"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {loading ? "Minting..." : "Mint Vault"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
