"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Bot,
  ShieldCheck,
  Tag,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  Lock,
  Wallet,
  TrendingUp,
  Layers,
  ArrowRight,
  Loader2,
  X
} from "lucide-react";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";
import TransferVaultModal from "@/components/TransferVaultModal";

export default function FundedAgentVaultsCatalog() {
  const { connectedAccount, loadData, openMint } = useApp();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterListedOnly, setFilterListedOnly] = useState(false);

  // Acquisition Modal State
  const [selectedVaultToBuy, setSelectedVaultToBuy] = useState(null);
  const [buyerAccount, setBuyerAccount] = useState("");
  const [acquiring, setAcquiring] = useState(false);
  const [acquireSuccess, setAcquireSuccess] = useState(null);
  const [acquireError, setAcquireError] = useState("");

  // Manage / List for Sale Modal State
  const [selectedVaultToManage, setSelectedVaultToManage] = useState(null);

  const fetchVaults = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vaults");
      setVaults(res.data?.vaults || []);
    } catch (err) {
      console.error("Failed to load agent vaults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  useEffect(() => {
    if (connectedAccount) {
      setBuyerAccount(connectedAccount);
    }
  }, [connectedAccount]);

  const handleAcquire = async (e) => {
    e.preventDefault();
    if (!selectedVaultToBuy || !buyerAccount.trim()) return;

    setAcquiring(true);
    setAcquireError("");
    setAcquireSuccess(null);

    try {
      const res = await api.post(`/vaults/${selectedVaultToBuy.id}/buy-vault`, {
        buyer_account: buyerAccount.trim(),
        payment_method: "USDC_NEAR",
        tx_hash: `0xacq${Date.now()}`
      });

      setAcquireSuccess(res.data);
      fetchVaults();
      if (loadData) loadData();
    } catch (err) {
      setAcquireError(err.message || "Failed to acquire agent vault");
    } finally {
      setAcquiring(false);
    }
  };

  const filteredVaults = vaults.filter((v) => {
    if (filterListedOnly && !v.is_listed_for_sale) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = v.name?.toLowerCase().includes(q);
    const subMatch = v.sub_account?.toLowerCase().includes(q);
    const ruleMatch = v.custom_rules?.toLowerCase().includes(q);
    return nameMatch || subMatch || ruleMatch;
  });

  const listedCount = vaults.filter((v) => v.is_listed_for_sale).length;

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Agent name, rule, or sub-account..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#a8f0be] transition font-sans shadow-sm"
          />
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterListedOnly(false)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              !filterListedOnly
                ? "bg-[#073525] text-white shadow-sm"
                : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
            }`}
          >
            All Agents ({vaults.length})
          </button>

          <button
            onClick={() => setFilterListedOnly(true)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterListedOnly
                ? "bg-[#073525] text-white shadow-sm"
                : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
            }`}
          >
            <Tag className="w-3 h-3 text-[#a8f0be]" />
            <span>Listed for Sale ({listedCount})</span>
          </button>
        </div>
      </div>

      {/* Grid of Agent Vaults */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#053b2a]" />
          <span>Querying on-chain NEP-171 agent vaults...</span>
        </div>
      ) : filteredVaults.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-neutral-200/80 p-8 space-y-3">
          <Bot className="w-8 h-8 text-neutral-400 mx-auto" />
          <div className="text-sm font-semibold text-neutral-900">No Agent Vaults Match Your Filter</div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {filterListedOnly
              ? "There are currently no agent vaults listed for sale on the marketplace. You can list one from your portfolio."
              : "No agent vaults found matching your search term."}
          </p>
          {openMint && (
            <button
              onClick={openMint}
              className="mt-2 px-4 py-2 rounded-full bg-[#073525] text-white text-xs font-semibold shadow-sm"
            >
              Mint a New Autonomous Agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVaults.map((vault) => {
            const inventory = vault.inventory || [];
            const inventoryValue = vault.inventoryValueUsdc || inventory.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 0), 0);
            const totalNav = Number(vault.usdc_balance || 0) + inventoryValue;
            const isListed = vault.is_listed_for_sale;
            const isOwner = connectedAccount && vault.owner_account === connectedAccount;

            // Parse custom rules
            let rules = [];
            try {
              rules = JSON.parse(vault.custom_rules || "[]");
            } catch (e) {
              rules = [];
            }

            return (
              <div
                key={vault.id}
                className={`rounded-[24px] bg-white border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isListed ? "border-amber-300 ring-1 ring-amber-200" : "border-neutral-200/80"
                }`}
              >
                {/* Header with Avatar & Status */}
                <div className="p-5 border-b border-neutral-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ backgroundColor: vault.avatar_color || "#053b2a" }}
                      >
                        {vault.name?.slice(0, 2).toUpperCase() || "AV"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-neutral-900 truncate font-sans">
                          {vault.name}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 truncate">
                          @{vault.sub_account}
                        </div>
                      </div>
                    </div>

                    {/* Listing Status Badge */}
                    {isListed ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e3fb71] text-[#043224] border border-[#a8f0be] shadow-sm shrink-0">
                        ${vault.sale_price_usdc} USDC
                      </span>
                    ) : vault.is_locked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        LOCKED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Net Asset Value (NAV) Highlight */}
                  <div className="mt-4 p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/70">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Total Net Asset Value (NAV)
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${(vault.pnl_percentage || 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {(vault.pnl_percentage || 0) >= 0 ? "+" : ""}{vault.pnl_percentage || 0}% PnL
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-neutral-900 mt-0.5">
                      ${Math.round(totalNav).toLocaleString()}{" "}
                      <span className="text-xs font-normal text-neutral-400 font-sans">USDC</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Cash: ${Number(vault.usdc_balance || 0).toLocaleString()}</span>
                      <span>•</span>
                      <span>Slabs ({inventory.length}): ${Math.round(inventoryValue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Enclosed Slabs Preview */}
                <div className="px-5 py-3.5 space-y-2 border-b border-neutral-100 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                    <span>Enclosed Graded Slabs</span>
                    <span>{inventory.length} Held</span>
                  </div>

                  {inventory.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-neutral-400 italic">
                      Zero cards enclosed. Ready to snipe with liquid treasury.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {inventory.slice(0, 4).map((card, idx) => (
                        <div
                          key={card.id || idx}
                          className="relative aspect-[3/4.2] rounded-lg overflow-hidden border border-neutral-200/80 bg-neutral-900 group"
                          title={`${card.name} (${card.grade}) • Fair Value: $${card.oracle_fair_value_usdc}`}
                        >
                          <img
                            src={card.image_url}
                            alt={card.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-bold text-white font-mono">
                            {card.grade || "PSA 10"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rules Preview */}
                  {rules.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1">
                      {rules.slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-700 font-medium truncate max-w-[140px]"
                        >
                          {r}
                        </span>
                      ))}
                      {rules.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-neutral-100 text-neutral-500">
                          +{rules.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Acquisition Bar */}
                <div className="p-4 bg-[#fbfdfc] flex items-center justify-between gap-3">
                  {isListed ? (
                    <button
                      onClick={() => {
                        setSelectedVaultToBuy(vault);
                        setAcquireError("");
                        setAcquireSuccess(null);
                      }}
                      className="w-full py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#a8f0be]" />
                      <span>Acquire Agent Vault (${vault.sale_price_usdc} USDC)</span>
                    </button>
                  ) : isOwner ? (
                    <button
                      onClick={() => setSelectedVaultToManage(vault)}
                      className="w-full py-2.5 rounded-full bg-white hover:bg-neutral-50 text-[#053b2a] border border-[#053b2a]/30 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Manage / List on Marketplace</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-xs text-neutral-400 font-medium">
                      Private Vault • Active on Trading Floor
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACQUISITION MODAL (Instant Zombie Key Wipe) */}
      {selectedVaultToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-neutral-200/80 p-6 sm:p-8 shadow-2xl text-neutral-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-squada uppercase tracking-wide text-[#053b2a]">
                  Acquire Business-in-a-Box
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Instant Zombie Key Wipe & Atomic Portfolio Takeover
                </p>
              </div>
              <button
                onClick={() => setSelectedVaultToBuy(null)}
                className="w-8 h-8 rounded-full bg-[#f8faf9] hover:bg-neutral-100 text-neutral-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {acquireSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#053b2a]">
                    <CheckCircle2 className="w-4 h-4 text-[#053b2a]" />
                    <span>Business-in-a-Box Acquired</span>
                  </div>
                  <p className="leading-relaxed">
                    You are now the authorized on-chain owner of{" "}
                    <span className="font-bold text-neutral-900">{selectedVaultToBuy.name}</span>.
                    All enclosed physical slabs, cash treasury, and trading reputation are transferred to you.
                  </p>
                </div>

                {/* Audit Proof Box */}
                <div className="p-4 rounded-2xl bg-neutral-900 text-white font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#a8f0be]">
                    <KeyRound className="w-4 h-4" />
                    <span>Cryptographic Audit Proof: Key Wiped</span>
                  </div>
                  <div className="text-[11px] text-neutral-300 space-y-1">
                    <div>• Sub-Account: <span className="text-[#a8f0be]">{selectedVaultToBuy.sub_account}</span></div>
                    <div className="truncate">• Revoked Previous Key: <span className="text-neutral-500">{acquireSuccess.wipeResult?.previousKeyWiped}</span></div>
                    <div className="truncate">• Generated Fresh Key: <span className="text-[#e3fb71]">{acquireSuccess.wipeResult?.newAccessKey}</span></div>
                    <div>• NEAR Testnet Block: #{acquireSuccess.wipeResult?.nearBlock}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVaultToBuy(null)}
                  className="w-full py-3 rounded-full bg-[#073525] text-white text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAcquire} className="space-y-4">
                {acquireError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {acquireError}
                  </div>
                )}

                {/* Vault Recap */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{selectedVaultToBuy.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e3fb71] text-[#043224] font-mono">
                      ${selectedVaultToBuy.sale_price_usdc} USDC
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    @{selectedVaultToBuy.sub_account} • Liquid Cash: ${selectedVaultToBuy.usdc_balance} USDC • {selectedVaultToBuy.inventory?.length || 0} Physical Slabs
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Your Buyer NEAR Account (.testnet)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. buyer_whale.testnet"
                    value={buyerAccount}
                    onChange={(e) => setBuyerAccount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#f8faf9] border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:border-[#a8f0be] transition font-mono"
                  />
                </div>

                {/* Zombie Key Wipe Explanation */}
                <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 text-xs text-neutral-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                    <ShieldCheck className="w-4 h-4 text-[#053b2a]" />
                    <span>Instant Zombie Key Wipe Guarantee</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-neutral-600">
                    During takeover, the smart contract automatically deletes the seller's Function-Call Access Key and provisions a fresh cryptographic Ed25519 key scoped to your account, preventing any rogue post-sale transactions.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedVaultToBuy(null)}
                    className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={acquiring}
                    className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {acquiring ? "Executing Zombie Key Wipe..." : `Confirm & Acquire ($${selectedVaultToBuy.sale_price_usdc} USDC)`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Transfer / List for Sale Modal */}
      {selectedVaultToManage && (
        <TransferVaultModal
          vault={selectedVaultToManage}
          isOpen={Boolean(selectedVaultToManage)}
          onClose={() => setSelectedVaultToManage(null)}
          onSuccess={() => {
            fetchVaults();
            setSelectedVaultToManage(null);
          }}
        />
      )}
    </div>
  );
}
