"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  X,
  Bot, 
  Wallet, 
  Coins, 
  ExternalLink, 
  Loader2,
  ChevronDown
} from "lucide-react";
import api from "@/lib/api";
import { 
  initNearWallet, 
  showWalletModal, 
  usdToNear, 
  executeNearPayment, 
  getLiveNearAccountBalance 
} from "@/lib/near";

const CATEGORIES = [
  { id: "ALL", label: "All Cards" },
  { id: "Pokemon", label: "Pokémon" },
  { id: "One Piece", label: "One Piece" },
  { id: "Basketball", label: "Basketball" },
  { id: "Football", label: "Football" },
  { id: "Magic", label: "Magic: The Gathering" },
  { id: "Yu-Gi-Oh", label: "Yu-Gi-Oh!" },
];

const SORT_OPTIONS = [
  { id: "price_desc", label: "Price: High to Low" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "rareness", label: "Highest Rarity Score" },
  { id: "pop_asc", label: "Lowest Population (Scarcest)" },
  { id: "return", label: "Top 30D Gainers (% Return)" },
  { id: "newest", label: "Recently Vaulted" },
  { id: "grade_desc", label: "Grade: PSA 10 First" },
  { id: "name_asc", label: "Name: A → Z" },
  { id: "name_desc", label: "Name: Z → A" },
];

export default function CollectorCryptCatalog({ vaults = [], onCardBridged, onOpenMint }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("price_desc");
  const [visibleCount, setVisibleCount] = useState(48);

  // Connected Wallet Account & Live NEAR Balance
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [liveNearBalance, setLiveNearBalance] = useState("0.00");

  // Unified Purchase Modal
  const [selectedCard, setSelectedCard] = useState(null);
  const [destination, setDestination] = useState("personal"); // "personal" | "vault"
  const [targetVaultId, setTargetVaultId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("NEAR"); // "NEAR" | "USDC"
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState("idle"); // "idle" | "awaiting_wallet" | "confirming" | "success"
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    let subscription = null;
    initNearWallet().then(async (w) => {
      if (!w) return;
      if (w.accountId) {
        setConnectedAccount(w.accountId);
        const bal = await getLiveNearAccountBalance(w.accountId);
        setLiveNearBalance(bal);
      }
      if (w.selector) {
        subscription = w.selector.store.observable.subscribe(async (state) => {
          const active = state.accounts.find((a) => a.active)?.accountId || state.accounts[0]?.accountId || null;
          setConnectedAccount(active);
          if (active) {
            const bal = await getLiveNearAccountBalance(active);
            setLiveNearBalance(bal);
          } else {
            setLiveNearBalance("0.00");
          }
        });
      }
    });

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  // Set default target vault
  useEffect(() => {
    if (vaults.length > 0 && !targetVaultId) {
      setTargetVaultId(String(vaults[0].id));
    }
  }, [vaults, targetVaultId]);

  const fetchCcCards = async () => {
    setLoading(true);
    try {
      const res = await api.get("/market/collector-crypt", {
        params: { search, category, sortBy },
      });
      setCards(res.data?.cards || []);
    } catch (err) {
      console.error("Error loading Collector Crypt inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVisibleCount(48);
    fetchCcCards();
  }, [category, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setVisibleCount(48);
    fetchCcCards();
  };

  // Unified Purchase Handler
  const handleConfirmPurchase = async () => {
    if (!selectedCard) return;

    setPurchaseLoading(true);
    setPurchaseError("");

    try {
      const price = selectedCard.insuredUsd || selectedCard.costUsd || 0;
      const nearAmount = usdToNear(price);

      // Branch A: Deposit to Agent Vault (Snipe)
      if (destination === "vault") {
        if (!targetVaultId) {
          throw new Error("Please select an agent vault destination.");
        }
        const res = await api.post(`/vaults/${targetVaultId}/snipe`, {
          card_id: selectedCard.id,
        });

        setPurchaseResult({
          card: selectedCard,
          destinationType: "vault",
          targetVault: vaults.find((v) => String(v.id) === String(targetVaultId))?.name || "Agent Vault",
          txHash: res.data?.card?.card_id || "0x_SETTLED_VAULT_ACQUISITION",
        });
        setPurchaseStep("success");
        if (onCardBridged) onCardBridged();
        return;
      }

      // Branch B: Buy with NEAR (Direct to Personal Wallet)
      if (paymentMethod === "NEAR") {
        const wallet = await initNearWallet();
        const accId = wallet?.accountId || connectedAccount;
        if (!accId) {
          await showWalletModal();
          setPurchaseLoading(false);
          return;
        }

        setPurchaseStep("awaiting_wallet");
        const paymentRes = await executeNearPayment({
          receiverId: "market.testnet",
          amountNear: nearAmount,
        });

        setPurchaseStep("confirming");
        const res = await api.post("/market/buy-direct", {
          card_id: selectedCard.id,
          buyer_account: accId,
          payment_method: "NEAR",
          near_amount: nearAmount,
          tx_hash: paymentRes.txHash,
        });

        const newBal = await getLiveNearAccountBalance(accId);
        setLiveNearBalance(newBal);

        setPurchaseResult({
          ...res.data,
          card: selectedCard,
          destinationType: "personal",
          nearAmount,
          txHash: paymentRes.txHash,
          explorerUrl: `https://testnet.nearblocks.io/txns/${paymentRes.txHash}`,
        });
        setPurchaseStep("success");
        if (onCardBridged) onCardBridged();
        return;
      }

      // Branch C: Instant Buy with USDC
      const res = await api.post("/market/buy-direct", {
        card_id: selectedCard.id,
        buyer_account: connectedAccount || "alierkan.testnet",
        payment_method: "USDC",
      });

      setPurchaseResult({
        ...res.data,
        card: selectedCard,
        destinationType: "personal",
        txHash: res.data?.tx_hash || "0x_USDC_SETTLED",
      });
      setPurchaseStep("success");
      if (onCardBridged) onCardBridged();

    } catch (err) {
      console.error("Purchase error:", err);
      setPurchaseError(err.message || "Purchase could not be completed. Please try again.");
      setPurchaseStep("idle");
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="p-6 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-4">
        
        {/* Top Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  category === cat.id
                    ? "bg-[#073525] text-white shadow-sm"
                    : "bg-[#f8faf9] text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input & Sort */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search by card, set, character..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#f8faf9] border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#073525] focus:bg-white transition shadow-sm font-sans"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </form>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-full bg-[#f8faf9] border border-neutral-200 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-[#073525] transition shadow-sm cursor-pointer shrink-0"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-bar stats note */}
        <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Showing <strong className="text-neutral-900 font-semibold">{cards.length.toLocaleString()} verified slabs</strong></span>
            <span className="text-neutral-300">•</span>
            <span>Curated from Collector Crypt's 167k+ physical Solana vault</span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
            <span>Brink's Custody Verified</span>
          </div>
        </div>
      </div>

      {/* Grid of Slabs */}
      {loading ? (
        <div className="py-24 text-center text-xs text-neutral-400 animate-pulse flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#053b2a]" />
          <span>Loading verified slabs from Brink's vault index...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="py-24 text-center rounded-[24px] bg-white border border-neutral-200 p-8 space-y-2">
          <p className="text-sm font-semibold text-neutral-900">No slabs found</p>
          <p className="text-xs text-neutral-500">Try adjusting your search terms or category filter.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cards.slice(0, visibleCount).map((card) => {
              const price = card.insuredUsd || card.costUsd || 0;
              const nearPrice = usdToNear(price);

              return (
                <div
                  key={card.id}
                  className="group relative rounded-[24px] p-4 bg-white border border-neutral-200/80 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(4,50,36,0.06)] hover:-translate-y-1"
                >
                  <div>
                    {/* PSA Header Label */}
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-[#f8faf9] border border-neutral-200/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-red-600 font-mono tracking-tight">PSA</span>
                        <span className="font-bold text-neutral-900">{card.grade || "GEM MT 10"}</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Vaulted
                      </span>
                    </div>

                    {/* Artwork Container */}
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#fbfdfc] flex items-center justify-center p-3 border border-neutral-100 mb-3 group-hover:border-neutral-200 transition">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        loading="lazy"
                        className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-300"
                      />

                      {card.rareness && (
                        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 text-[10px] font-semibold text-amber-700 flex items-center gap-1 shadow-sm">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>Rarity {card.rareness}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Title & Category */}
                    <h3 className="text-xs font-bold text-neutral-900 line-clamp-2 min-h-[34px] group-hover:text-[#053b2a] transition leading-snug" title={card.name}>
                      {card.name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                      <span>{card.category || "TCG"}</span>
                      <span>Pop: {card.population?.atGrade || "N/A"}</span>
                    </div>

                    {/* Valuation Box */}
                    <div className="mt-3 p-3 rounded-xl bg-[#f8faf9] border border-neutral-200/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-400 font-medium">Fair Value</div>
                        <div className="text-sm font-bold text-neutral-900 font-mono">${price.toLocaleString()} USDC</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-[10px] text-neutral-400">NEAR</div>
                        <div className="text-xs font-bold text-[#053b2a]">{nearPrice} N</div>
                      </div>
                    </div>
                  </div>

                  {/* Single Clean Action Button */}
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setSelectedCard(card);
                        setPurchaseResult(null);
                        setPurchaseError("");
                        setPurchaseStep("idle");
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                    >
                      <span>Buy Slab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Pagination */}
          {cards.length > visibleCount && (
            <div className="pt-10 pb-4 flex flex-col items-center justify-center gap-3">
              <div className="text-xs text-neutral-500 font-mono">
                Showing {Math.min(visibleCount, cards.length)} of {cards.length.toLocaleString()} Verified Slabs
              </div>
              <button
                onClick={() => setVisibleCount((prev) => prev + 48)}
                className="px-8 py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                Load More Slabs (+48)
              </button>
            </div>
          )}
        </div>
      )}

      {/* UNIFIED ACQUISITION MODAL */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Acquire Physical Slab</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Brink's Vault Custody • Real PSA 10 Authentication
                </p>
              </div>
              <button
                onClick={() => {
                  if (!purchaseLoading) setSelectedCard(null);
                }}
                disabled={purchaseLoading}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: Success State */}
            {purchaseResult ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-5 rounded-2xl bg-[#f8faf9] border border-emerald-300 text-emerald-950 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Slab Successfully Acquired!</span>
                  </div>

                  <p className="text-neutral-700 leading-relaxed font-sans">
                    <strong className="text-neutral-900">{selectedCard.name}</strong> has been allocated to{" "}
                    {purchaseResult.destinationType === "vault" ? (
                      <span className="font-semibold text-[#053b2a]">{purchaseResult.targetVault}</span>
                    ) : (
                      <span className="font-semibold text-[#053b2a]">your personal wallet ({connectedAccount || "alierkan.testnet"})</span>
                    )}.
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border border-neutral-200 font-mono text-[11px] text-neutral-600 space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                      <span>PSA Grade:</span>
                      <span className="text-neutral-900 font-bold">{selectedCard.grade || "PSA 10"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transaction Reference:</span>
                      <span className="text-neutral-900 font-bold truncate max-w-[200px]">{purchaseResult.txHash}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setPurchaseResult(null);
                  }}
                  className="w-full py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
                >
                  Done & View in Portfolio
                </button>
              </div>
            ) : (
              /* Content: Form State */
              <div className="space-y-5">
                {purchaseError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {purchaseError}
                  </div>
                )}

                {/* Card Slab Preview */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200 flex items-center gap-4">
                  <img
                    src={selectedCard.imageUrl}
                    alt=""
                    className="w-16 h-20 object-contain rounded-xl bg-white p-1 border border-neutral-200 shadow-sm shrink-0"
                  />
                  <div className="truncate flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-200/70 text-[10px] font-mono text-neutral-800 font-bold mb-1">
                      <span>{selectedCard.grade || "PSA 10"}</span>
                      <span className="text-neutral-400">•</span>
                      <span>{selectedCard.category || "TCG"}</span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-900 truncate" title={selectedCard.name}>
                      {selectedCard.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1 font-mono">
                      <span className="text-base font-bold text-[#053b2a]">
                        ${Number(selectedCard.insuredUsd || selectedCard.costUsd || 0).toLocaleString()} USDC
                      </span>
                      <span className="text-xs text-neutral-500 font-normal">
                        ({usdToNear(selectedCard.insuredUsd || selectedCard.costUsd || 0)} NEAR)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Destination Selector: Personal Wallet vs Agent Vault */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Deliver Slab To:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDestination("personal")}
                      className={`p-3 rounded-xl border text-xs text-left transition flex items-center gap-2.5 cursor-pointer ${
                        destination === "personal"
                          ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400/30"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <div>Personal Wallet</div>
                        <div className="text-[10px] text-neutral-400 font-normal font-mono truncate">
                          {connectedAccount || "alierkan.testnet"}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDestination("vault")}
                      className={`p-3 rounded-xl border text-xs text-left transition flex items-center gap-2.5 cursor-pointer ${
                        destination === "vault"
                          ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400/30"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <Bot className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <div>Agent Vault</div>
                        <div className="text-[10px] text-neutral-400 font-normal truncate">
                          Assign to Hunter
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* If Vault Destination: Vault Selector */}
                {destination === "vault" && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-xs font-medium text-neutral-600">Select Target Agent Vault:</label>
                    <select
                      value={targetVaultId}
                      onChange={(e) => setTargetVaultId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8faf9] border border-neutral-200 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-[#073525] cursor-pointer"
                    >
                      {vaults.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (${v.usdc_balance} USDC Available)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If Personal Wallet: Payment Method (NEAR vs USDC) */}
                {destination === "personal" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Payment Currency:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("NEAR")}
                        className={`p-3 rounded-xl border text-xs transition flex items-center gap-2.5 cursor-pointer ${
                          paymentMethod === "NEAR"
                            ? "bg-[#053b2a] text-white font-semibold shadow-sm"
                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="font-mono font-bold text-xs">NEAR</span>
                        <div className="text-left font-mono">
                          <div>{usdToNear(selectedCard.insuredUsd || selectedCard.costUsd || 0)} N</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("USDC")}
                        className={`p-3 rounded-xl border text-xs transition flex items-center gap-2.5 cursor-pointer ${
                          paymentMethod === "USDC"
                            ? "bg-[#053b2a] text-white font-semibold shadow-sm"
                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <Coins className="w-4 h-4 shrink-0" />
                        <div className="text-left font-mono">
                          <div>${selectedCard.insuredUsd || selectedCard.costUsd || 0} USDC</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Wallet Loading Indicator */}
                {purchaseStep === "awaiting_wallet" && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Please approve the transaction in your Meteor Wallet...</span>
                  </div>
                )}

                {purchaseStep === "confirming" && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Settling physical slab ownership on NEAR...</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCard(null)}
                    disabled={purchaseLoading}
                    className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    disabled={purchaseLoading}
                    className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {purchaseLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Acquisition</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
