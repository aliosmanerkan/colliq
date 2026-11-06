"use client";

import { useState } from "react";
import { X, Send, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[32px] bg-[#0c0c0e] border border-white/[0.1] p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between pb-5 border-b border-neutral-900 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Transfer Business-in-a-Box</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Single-Tx Portfolio Sale + Zombie Key Wipe</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-neutral-950 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NFT & Portfolio Transferred</span>
              </div>
              <p className="text-neutral-300 leading-relaxed font-sans">
                The entire business (USDC + Slabs + Trading Reputation) now belongs to{" "}
                <span className="font-mono text-white font-medium">{result.newOwner}</span>.
              </p>
            </div>

            {/* Zombie Key Wipe Proof */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <KeyRound className="w-4 h-4 text-neutral-400" />
                <span>Audit Proof: Zombie Key Wipe Completed</span>
              </div>
              <div className="text-neutral-400 text-xs space-y-1">
                <div>• Sub-Account: <span className="text-white">{result.subAccount}</span></div>
                <div className="truncate">• Revoked Old Key: <span className="text-neutral-400">{result.previousKeyWiped}</span></div>
                <div className="truncate">• Generated Fresh Key: <span className="text-emerald-400">{result.newAccessKey}</span></div>
                <div className="truncate">• NEAR TX: <span className="text-neutral-300">{result.txHash}</span></div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-full bg-white text-black text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Transferred Assets Summary */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900">
              <div className="text-xs uppercase text-neutral-500 mb-2.5 font-medium">
                Portfolio Assets Enclosed in this NFT:
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-3 rounded-2xl bg-[#0c0c0e] border border-neutral-900">
                  <div className="text-xs font-semibold text-white">${vault.usdc_balance}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">USDC Cash</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0c0c0e] border border-neutral-900">
                  <div className="text-xs font-semibold text-white">{vault.inventoryCount || 0}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">PSA Slabs</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0c0c0e] border border-neutral-900">
                  <div className="text-xs font-semibold text-emerald-400">+{vault.pnl_percentage}%</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">PnL Record</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Recipient NEAR Account
              </label>
              <input
                type="text"
                required
                placeholder="e.g. buyer_whale.testnet"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-white/[0.3] transition font-mono"
              />
            </div>

            {/* Zombie Key Wipe Warning */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-900 text-xs text-neutral-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <ShieldAlert className="w-4 h-4 text-neutral-400" />
                <span>Zombie Key Revocation Guarantee</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400">
                Upon transfer, the contract automatically revokes the previous owner's Function-Call Access Key, preventing rogue agent trades after sale.
              </p>
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
                className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? "Transferring..." : "Execute Transfer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
