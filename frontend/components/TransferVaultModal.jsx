"use client";

import { useState } from "react";
import { X, KeyRound, CheckCircle2, ShieldAlert } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-neutral-200/80 p-6 sm:p-8 shadow-2xl overflow-hidden text-neutral-900">
        
        <div className="flex items-center justify-between pb-5 border-b border-neutral-100 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-squada uppercase tracking-wide text-[#053b2a]">Transfer Business-in-a-Box</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Single-Tx Portfolio Sale + Zombie Key Wipe</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8faf9] hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#f8faf9] border border-[#a8f0be] text-[#053b2a] text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#053b2a]" />
                <span>NFT & Portfolio Transferred</span>
              </div>
              <p className="text-neutral-700 leading-relaxed font-sans">
                The entire business (USDC + Slabs + Trading Reputation) now belongs to{" "}
                <span className="font-mono text-neutral-900 font-bold">{result.newOwner}</span>.
              </p>
            </div>

            {/* Zombie Key Wipe Proof */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                <KeyRound className="w-4 h-4 text-[#053b2a]" />
                <span>Audit Proof: Zombie Key Wipe Completed</span>
              </div>
              <div className="text-neutral-600 text-xs space-y-1">
                <div>• Sub-Account: <span className="text-neutral-900 font-semibold">{result.subAccount}</span></div>
                <div className="truncate">• Revoked Old Key: <span className="text-neutral-500">{result.previousKeyWiped}</span></div>
                <div className="truncate">• Generated Fresh Key: <span className="text-[#053b2a] font-bold">{result.newAccessKey}</span></div>
                <div className="truncate">• NEAR TX: <span className="text-neutral-900 font-medium">{result.txHash}</span></div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Transferred Assets Summary */}
            <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200/80">
              <div className="text-xs uppercase text-neutral-500 mb-2.5 font-medium">
                Portfolio Assets Enclosed in this NFT:
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <div className="text-xs font-semibold text-neutral-900">${vault.usdc_balance}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">USDC Cash</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <div className="text-xs font-semibold text-neutral-900">{vault.inventoryCount || 0}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">PSA Slabs</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <div className="text-xs font-semibold text-[#053b2a]">+{vault.pnl_percentage}%</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">PnL Record</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Recipient NEAR Account
              </label>
              <input
                type="text"
                required
                placeholder="e.g. buyer_whale.testnet"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f8faf9] border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-[#a8f0be] transition font-mono"
              />
            </div>

            {/* Zombie Key Wipe Warning */}
            <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 text-xs text-neutral-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <ShieldAlert className="w-4 h-4 text-[#053b2a]" />
                <span>Zombie Key Revocation Guarantee</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-600">
                Upon transfer, the contract automatically revokes the previous owner's Function-Call Access Key, preventing rogue agent trades after sale.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-sm active:scale-95 disabled:opacity-50"
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
