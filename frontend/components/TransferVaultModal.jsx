"use client";

import { useState } from "react";
import { X, KeyRound, CheckCircle2, ShieldAlert, Tag, Send, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

export default function TransferVaultModal({ vault, isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState(vault?.is_listed_for_sale ? "marketplace" : "marketplace");
  const [salePrice, setSalePrice] = useState(vault?.sale_price_usdc ? String(vault.sale_price_usdc) : "");
  const [newOwner, setNewOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listingSuccess, setListingSuccess] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen || !vault) return null;

  // Direct Transfer Handler
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

  // Marketplace Listing Handler
  const handleListForSale = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setListingSuccess(null);

    const price = Number(salePrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid sale price in USDC");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post(`/vaults/${vault.id}/list-for-sale`, {
        sale_price_usdc: price,
        owner_account: vault.owner_account
      });

      setListingSuccess(`Vault successfully listed for $${price.toLocaleString()} USDC with Anti-Front-Running lock.`);
      vault.is_listed_for_sale = true;
      vault.sale_price_usdc = price;
      vault.is_locked = true;
      vault.lock_reason = "LISTED_FOR_SALE";
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to list vault for sale");
    } finally {
      setLoading(false);
    }
  };

  // Marketplace Unlist Handler
  const handleUnlist = async () => {
    setLoading(true);
    setError("");
    setListingSuccess(null);

    try {
      await api.post(`/vaults/${vault.id}/unlist-sale`, {
        owner_account: vault.owner_account
      });

      setListingSuccess("Vault unlisted from marketplace. Lock released.");
      vault.is_listed_for_sale = false;
      vault.sale_price_usdc = null;
      vault.is_locked = false;
      vault.lock_reason = null;
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to unlist vault");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-neutral-200/80 p-6 sm:p-8 shadow-2xl overflow-hidden text-neutral-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-squada uppercase tracking-wide text-[#053b2a]">Manage Business-in-a-Box</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Marketplace Liquidity or Direct Wallet Transfer</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8faf9] hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Option Mode Switcher */}
        {!result && (
          <div className="flex rounded-full bg-neutral-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => { setMode("marketplace"); setError(""); setListingSuccess(null); }}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "marketplace" ? "bg-white text-[#053b2a] shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>List on Marketplace (USDC)</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("direct"); setError(""); setListingSuccess(null); }}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "direct" ? "bg-white text-[#053b2a] shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Direct Wallet Transfer</span>
            </button>
          </div>
        )}

        {/* Transferred Assets Summary */}
        <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 mb-4">
          <div className="text-[11px] uppercase text-neutral-500 mb-2 font-semibold tracking-wider">
            Portfolio Assets Enclosed in this Vault:
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200/80 shadow-sm">
              <div className="text-xs font-bold text-neutral-900">${vault.usdc_balance}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">USDC Cash</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200/80 shadow-sm">
              <div className="text-xs font-bold text-neutral-900">{vault.inventoryCount || 0}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">PSA Slabs</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200/80 shadow-sm">
              <div className="text-xs font-bold text-[#053b2a]">+{vault.pnl_percentage}%</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">PnL Record</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4">
            {error}
          </div>
        )}

        {listingSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{listingSuccess}</span>
          </div>
        )}

        {/* Result Screen for Direct Transfer */}
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
              className="w-full py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : mode === "marketplace" ? (
          /* OPTION 1: MARKETPLACE LISTING */
          <div className="space-y-4">
            {vault.is_listed_for_sale ? (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-700" />
                    <span>Currently Listed for Sale</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 font-mono">
                    ${vault.sale_price_usdc} USDC
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Anti-Front-Running Lock is active. The vault is locked to prevent unauthorized cash or card withdrawals while advertised on the public marketplace.
                </p>
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full bg-white hover:bg-neutral-100 text-xs font-medium text-neutral-700 border border-neutral-200 transition cursor-pointer"
                  >
                    Keep Listed
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleUnlist}
                    className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Unlisting..." : "Unlist from Marketplace"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleListForSale} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Listing Price (USDC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      required
                      placeholder="e.g. 1500"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#f8faf9] border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-[#a8f0be] transition font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-sans">
                      USDC
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 text-xs text-neutral-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <ShieldAlert className="w-4 h-4 text-[#053b2a]" />
                    <span>Anti-Front-Running Lock Guarantee</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-600">
                    Upon listing, the vault is locked (`lock_reason: LISTED_FOR_SALE`) so the owner cannot secretly drain treasury or remove cards before a buyer acquires it.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Listing..." : "List Agent for Sale"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* OPTION 2: DIRECT WALLET TRANSFER */
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Recipient NEAR Account (.testnet)
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
                className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
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
