"use client";

import { useState } from "react";
import { X, Send, ShieldAlert, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function TransferVaultModal({ vault, isOpen, onClose, onSuccess }) {
  const [newOwner, setNewOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen || !vault) return null;

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(`/vaults/${vault.id}/transfer`, {
        new_owner: newOwner,
      });

      setResult(res.data?.result);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40">
              <Send className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Transfer "Business-in-a-Box"</h2>
              <p className="text-xs text-slate-400 font-mono">1-Tx Portfolio Sale + Zombie Key Wipe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              <div className="flex items-center gap-2 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                NFT & Vault Transferred Successfully!
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The entire business (USDC + Slabs + Trading Reputation) now belongs to{" "}
                <span className="font-mono text-cyan-300 font-bold">{result.newOwner}</span>.
              </p>
            </div>

            {/* Zombie Key Wipe Proof */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <KeyRound className="w-4 h-4" />
                Audit Proof: Zombie Key Wipe Completed
              </div>
              <div className="text-slate-400 text-[11px]">
                <div>• Sub-account: <span className="text-slate-200">{result.subAccount}</span></div>
                <div className="truncate">• Revoked Old Key: <span className="text-rose-400">{result.previousKeyWiped}</span></div>
                <div className="truncate">• Generated Fresh Key: <span className="text-emerald-400">{result.newAccessKey}</span></div>
                <div className="truncate">• TX: <span className="text-indigo-400">{result.txHash}</span></div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Transferred Assets Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-2">
                Transferred Assets with this NFT:
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs font-bold text-white">${vault.usdc_balance}</div>
                  <div className="text-[9px] text-slate-400">USDC Cash</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs font-bold text-cyan-300">{vault.inventoryCount || 0}</div>
                  <div className="text-[9px] text-slate-400">PSA Slabs</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs font-bold text-emerald-400">+{vault.pnl_percentage}%</div>
                  <div className="text-[9px] text-slate-400">PnL Record</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                Recipient NEAR Account
              </label>
              <input
                type="text"
                required
                placeholder="e.g. buyer_whale.testnet"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>

            {/* Zombie Key Wipe Warning */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300/90 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Automatic Security Patch (Zombie Key Wipe)
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/80">
                Upon transfer, the contract automatically revokes the seller's Function-Call Access Key,
                preventing any rogue agent actions or fund drains after sale.
              </p>
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {loading ? "Wiping Keys & Transferring..." : "Execute Business Sale"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
