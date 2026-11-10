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
  ShoppingBag,
  Bot,
  Wallet,
  Coins,
  Cpu,
  ExternalLink,
  Loader2
} from "lucide-react";
import api from "@/lib/api";
import { 
  initNearWallet, 
  showWalletModal, 
  usdToNear, 
  executeNearPayment, 
  getLiveNearAccountBalance 
} from "@/lib/near";

export default function CollectorCryptCatalog({ vaults, onCardBridged, onOpenMint }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("price_desc");
  const [visibleCount, setVisibleCount] = useState(48);

  // Connected Wallet Account & Live NEAR Balance
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [liveNearBalance, setLiveNearBalance] = useState("0.00");

  // Modals: Buy with NEAR (Primary On-Chain Flow)
  const [selectedCardForNearBuy, setSelectedCardForNearBuy] = useState(null);
  const [nearBuyLoading, setNearBuyLoading] = useState(false);
  const [nearBuyStep, setNearBuyStep] = useState("idle"); // "idle" | "awaiting_wallet" | "confirming" | "success"
  const [nearBuyResult, setNearBuyResult] = useState(null);
  const [nearBuyError, setNearBuyError] = useState("");

  // Modals: Direct Buy (Sandbox)
  const [selectedCardForDirectBuy, setSelectedCardForDirectBuy] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyResult, setBuyResult] = useState(null);
  const [buyError, setBuyError] = useState("");

  // Modals: Assign to Agent (Snipe)
  const [selectedCardForAgent, setSelectedCardForAgent] = useState(null);
  const [targetVaultId, setTargetVaultId] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [agentError, setAgentError] = useState("");

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

  // 1. BUY WITH NEAR VIA METEOR WALLET (On-Chain Settlement)
  const handleBuyWithNear = async () => {
    if (!selectedCardForNearBuy) return;

    // Check if wallet is connected
    const wallet = await initNearWallet();
    const accId = wallet?.accountId || connectedAccount;
    if (!accId) {
      await showWalletModal();
      return;
    }

    const price = selectedCardForNearBuy.insuredUsd || selectedCardForNearBuy.costUsd || 0;
    const nearAmount = usdToNear(price);

    setNearBuyLoading(true);
    setNearBuyError("");
    setNearBuyStep("awaiting_wallet");

    try {
      // Step A: Trigger Meteor Wallet on NEAR Testnet
      const paymentRes = await executeNearPayment({
        receiverId: "market.testnet",
        amountNear: nearAmount,
      });

      setNearBuyStep("confirming");

      // Step B: Settle the card ownership to buyer's account
      const res = await api.post("/market/buy-direct", {
        card_id: selectedCardForNearBuy.id,
        buyer_account: accId,
        payment_method: "NEAR",
        near_amount: nearAmount,
        tx_hash: paymentRes.txHash,
      });

      // Step C: Refresh live balance
      const newBal = await getLiveNearAccountBalance(accId);
      setLiveNearBalance(newBal);

      setNearBuyResult({
        ...res.data,
        nearAmount,
        txHash: paymentRes.txHash,
        explorerUrl: `https://testnet.nearblocks.io/txns/${paymentRes.txHash}`,
      });
      setNearBuyStep("success");

      if (onCardBridged) onCardBridged();
    } catch (err) {
      console.error("NEAR purchase error:", err);
      setNearBuyError(err.message || "NEAR purchase transaction was rejected or failed");
      setNearBuyStep("idle");
    } finally {
      setNearBuyLoading(false);
    }
  };

  // 2. DIRECT PURCHASE (Sandbox Instant Buy)
  const handleDirectBuy = async () => {
    if (!selectedCardForDirectBuy) return;
    setBuyLoading(true);
    setBuyError("");

    try {
      const res = await api.post("/market/buy-direct", {
        card_id: selectedCardForDirectBuy.id,
        buyer_account: connectedAccount || "alierkan.testnet",
        payment_method: "USDC",
      });

      setBuyResult(res.data);
      if (onCardBridged) onCardBridged();
    } catch (err) {
      setBuyError(err.message || "Failed to complete purchase");
    } finally {
      setBuyLoading(false);
    }
  };

  // 3. ASSIGN TO AGENT (Snipe)
  const handleAgentSnipe = async (e) => {
    e.preventDefault();
    if (!targetVaultId || !selectedCardForAgent) return;
    setAgentLoading(true);
    setAgentError("");

    try {
      const res = await api.post(`/vaults/${targetVaultId}/snipe`, {
        card_id: selectedCardForAgent.id,
      });

      setAgentResult(res.data);
      if (onCardBridged) onCardBridged();
    } catch (err) {
      setAgentError(err.message || "Agent failed to acquire slab");
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Editorial Banner */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#a8f0be]/40 border border-[#043224]/15 text-[#043224]">
              🛍️ Live Card Marketplace
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Brink's & PSA Vaulted Physical Cards (RWA)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-squada uppercase tracking-wide text-[#053b2a]">
            Collector Crypt Pokémon & TCG Marketplace
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-poppins">
            Purchase physical cards directly to your wallet or assign an <strong className="text-[#053b2a] font-semibold">Autonomous Trading Agent</strong> to trade them automatically according to your custom rules.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 shrink-0 text-left md:text-right">
          <div className="text-xs uppercase text-neutral-400 font-medium tracking-wider">Available Inventory</div>
          <div className="text-3xl font-semibold text-neutral-900 mt-1 font-mono">{cards.length}</div>
          <div className="text-xs text-[#053b2a] mt-0.5 font-medium">PSA 10 / GEM-MT Graded Cards</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "Pokemon", "One Piece", "Basketball", "Football"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                category === cat
                  ? "bg-[#073525] text-white font-semibold shadow-sm"
                  : "bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {cat === "ALL" ? "All Cards" : cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search slabs (Pikachu, Charizard...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#073525] transition font-sans shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-full bg-white border border-neutral-200 text-xs text-neutral-700 focus:outline-none focus:border-[#073525] transition font-sans shadow-sm cursor-pointer"
          >
            <option value="price_desc">Highest Price</option>
            <option value="price_asc">Lowest Price</option>
            <option value="rareness">Rarity Score</option>
          </select>
        </div>
      </div>

      {/* Grid of Slabs */}
      {loading ? (
        <div className="py-24 text-center text-xs text-neutral-400 animate-pulse flex flex-col items-center justify-center gap-2">
          <span>Loading Brink's vault inventory...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-500">
          No slabs found matching your filter criteria.
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cards.slice(0, visibleCount).map((card) => {
            const price = card.insuredUsd || card.costUsd || 0;

            return (
              <div
                key={card.id}
                className="group relative rounded-[24px] p-4 bg-white border border-neutral-200/80 hover:border-[#a8f0be] transition-all duration-300 flex flex-col justify-between shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(4,50,36,0.08)] hover:-translate-y-1"
              >
                <div>
                  {/* PSA Header */}
                  <div className="mb-3 px-3 py-1.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-red-600 font-mono">PSA</span>
                    <span className="font-semibold text-neutral-900">{card.grade || "GEM MT 10"}</span>
                    <span className="text-[10px] text-[#053b2a] font-semibold">Brink's Vaulted</span>
                  </div>

                  {/* Artwork Box */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#f4f6f5] flex items-center justify-center p-3 border border-neutral-200/60 mb-3 group-hover:border-neutral-300 transition">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
                    />

                    {card.rareness && (
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 text-[10px] font-semibold text-amber-700 flex items-center gap-1 shadow-sm">
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>Rarity {card.rareness}/100</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Set */}
                  <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 min-h-[36px] group-hover:text-[#053b2a] transition" title={card.name}>
                    {card.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                    <span>{card.category || "TCG"}</span>
                    <span>Pop: {card.population?.atGrade || "N/A"}</span>
                  </div>

                  {/* Pricing Box */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Fair Value:</span>
                      <span className="text-sm font-semibold text-neutral-900 font-mono">${price.toLocaleString()} USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-200/60 font-mono">
                      <span className="text-neutral-500">NEAR Price:</span>
                      <span className="text-[#053b2a] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#053b2a]" />
                        {usdToNear(price)} NEAR
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS: BUY WITH NEAR, ASSIGN TO AGENT & SANDBOX */}
                <div className="mt-4 pt-3.5 border-t border-neutral-100 space-y-2">
                  {/* Action 1: Buy with NEAR (Primary Button) */}
                  <button
                    onClick={() => {
                      setSelectedCardForNearBuy(card);
                      setNearBuyResult(null);
                      setNearBuyError("");
                      setNearBuyStep("idle");
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm group/btn cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded-full bg-white text-[#073525] flex items-center justify-center text-[10px] font-bold font-mono">
                      N
                    </div>
                    <span>Buy with NEAR ({usdToNear(price)} N)</span>
                  </button>

                  {/* Action 2: Assign to Agent */}
                  <button
                    onClick={() => {
                      setSelectedCardForAgent(card);
                      setAgentResult(null);
                      setAgentError("");
                      if (vaults.length > 0) setTargetVaultId(String(vaults[0].id));
                    }}
                    className="w-full py-2 px-3 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 hover:text-neutral-900 text-xs font-medium flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#053b2a]" />
                    <span>Assign to Agent (Snipe)</span>
                  </button>

                  {/* Action 3: Instant Buy with USDC (Sandbox) */}
                  <div className="text-center pt-0.5">
                    <button
                      onClick={() => {
                        setSelectedCardForDirectBuy(card);
                        setBuyResult(null);
                        setBuyError("");
                      }}
                      className="text-[10px] text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                    >
                      Instant Buy with USDC (Sandbox)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length > visibleCount && (
          <div className="pt-10 pb-4 flex flex-col items-center justify-center gap-3">
            <div className="text-xs text-neutral-500 font-mono">
              Showing {Math.min(visibleCount, cards.length)} of {cards.length.toLocaleString()} Physical Cards
            </div>
            <button
              onClick={() => setVisibleCount((prev) => prev + 48)}
              className="px-8 py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
            >
              Load More Cards (+48)
            </button>
          </div>
        )}
      </div>
    )}

      {/* MODAL 0: BUY WITH NEAR (ON-CHAIN METEOR WALLET) */}
      {selectedCardForNearBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl overflow-hidden text-neutral-900">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#a8f0be]/40 border border-[#043224]/15 flex items-center justify-center">
                  <span className="font-mono font-bold text-[#053b2a] text-sm">NEAR</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">Buy Card with NEAR</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Live On-Chain Settlement via Meteor Wallet
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!nearBuyLoading) setSelectedCardForNearBuy(null);
                }}
                disabled={nearBuyLoading}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Switcher */}
            {nearBuyResult ? (
              /* Success State */
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-6 rounded-2xl bg-[#f8faf9] border border-emerald-500/30 text-emerald-800 text-xs space-y-3">
                  <div className="flex items-center gap-2.5 font-semibold text-sm text-[#053b2a]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Transaction Confirmed on NEAR Testnet!</span>
                  </div>

                  <p className="text-neutral-700">
                    You paid <span className="text-neutral-900 font-mono font-semibold">{nearBuyResult.nearAmount} NEAR</span> for{" "}
                    <span className="text-neutral-900 font-semibold">{selectedCardForNearBuy.name}</span>. The physical slab is now assigned to your account.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 font-mono text-[11px] text-neutral-600 space-y-1.5 mt-2">
                    <div className="text-neutral-900 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>On-Chain Provenance Record</span>
                    </div>
                    <div>• Buyer Account: <span className="text-[#053b2a] font-semibold">{connectedAccount}</span></div>
                    <div>• Payment Settled: <span className="text-neutral-900 font-semibold">{nearBuyResult.nearAmount} NEAR</span></div>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100">
                      <span>• Explorer TX:</span>
                      <a
                        href={nearBuyResult.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#053b2a] hover:underline flex items-center gap-1 truncate font-medium"
                      >
                        <span className="truncate">{nearBuyResult.txHash}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCardForNearBuy(null);
                    setNearBuyResult(null);
                  }}
                  className="w-full py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition active:scale-95 shadow-md cursor-pointer"
                >
                  Done & View in Inventory
                </button>
              </div>
            ) : (
              /* Payment Preview & Confirmation */
              <div className="space-y-4">
                {nearBuyError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {nearBuyError}
                  </div>
                )}

                {/* Card Slab Details */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200 flex items-center gap-3.5">
                  <img
                    src={selectedCardForNearBuy.imageUrl}
                    alt=""
                    className="w-16 h-20 object-contain rounded-xl bg-white p-1 border border-neutral-200 shadow-sm"
                  />
                  <div className="truncate flex-1">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-200/70 text-[10px] font-mono text-neutral-800 font-semibold mb-1">
                      <span>{selectedCardForNearBuy.grade || "PSA 10"}</span>
                      <span className="text-neutral-400">•</span>
                      <span>{selectedCardForNearBuy.category || "TCG"}</span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 truncate" title={selectedCardForNearBuy.name}>
                      {selectedCardForNearBuy.name}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1 font-mono">
                      <span className="text-base font-bold text-[#053b2a]">
                        {usdToNear(selectedCardForNearBuy.insuredUsd || selectedCardForNearBuy.costUsd || 0)} NEAR
                      </span>
                      <span className="text-xs text-neutral-500">
                        (${Number(selectedCardForNearBuy.insuredUsd || selectedCardForNearBuy.costUsd || 0).toLocaleString()} USDC)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-neutral-400" />
                      Signer Account:
                    </span>
                    <span className="font-mono text-neutral-900 font-medium">
                      {connectedAccount || "Not Connected"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Live Wallet Balance:</span>
                    <span className="font-mono text-[#053b2a] font-semibold">
                      {liveNearBalance} NEAR
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Protocol Treasury:</span>
                    <span className="font-mono text-neutral-800">market.testnet</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Testnet Exchange Rate:</span>
                    <span className="font-mono text-neutral-500">1 NEAR = $50 USD</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 flex items-center justify-between font-semibold">
                    <span className="text-neutral-900">Amount to Pay:</span>
                    <span className="text-base font-mono text-[#053b2a]">
                      {usdToNear(selectedCardForNearBuy.insuredUsd || selectedCardForNearBuy.costUsd || 0)} NEAR
                    </span>
                  </div>
                </div>

                {/* Status Indicator during wallet prompt */}
                {nearBuyStep === "awaiting_wallet" && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Please approve the transaction in your Meteor Wallet extension...</span>
                  </div>
                )}

                {nearBuyStep === "confirming" && (
                  <div className="p-3 rounded-2xl bg-[#a8f0be]/30 border border-[#043224]/20 text-xs text-[#053b2a] flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-[#053b2a]" />
                    <span>Verifying transaction & minting slab ownership on NEAR...</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCardForNearBuy(null)}
                    disabled={nearBuyLoading}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-xs font-medium text-neutral-700 transition disabled:opacity-40 cursor-pointer"
                  >
                    Cancel
                  </button>

                  {!connectedAccount ? (
                    <button
                      type="button"
                      onClick={showWalletModal}
                      className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Connect Meteor Wallet
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBuyWithNear}
                      disabled={nearBuyLoading}
                      className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      {nearBuyLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Approve & Pay with Meteor</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 1: DIRECT BUY */}
      {selectedCardForDirectBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[28px] bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl overflow-hidden text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#053b2a]" />
                  Instant Purchase
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Card transfers directly to your personal Meteor wallet
                </p>
              </div>
              <button
                onClick={() => setSelectedCardForDirectBuy(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {buyResult ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#f8faf9] border border-emerald-500/30 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-[#053b2a]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Card Successfully Purchased!
                  </div>
                  <p className="text-neutral-700">
                    <span className="text-neutral-900 font-semibold">{selectedCardForDirectBuy.name}</span> has been acquired and added to your wallet account.
                  </p>
                  <div className="p-3 rounded-2xl bg-white border border-neutral-200 font-mono text-[10px] text-neutral-600 space-y-1 mt-2">
                    <div className="text-neutral-900 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Brink's Sealed RWA Custody</span>
                    </div>
                    <div>• PSA Cert: <span className="text-[#053b2a] font-semibold">#{selectedCardForDirectBuy.grade}</span></div>
                    <div className="truncate">• Transaction: <span className="text-neutral-900">{buyResult.tx_hash}</span></div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCardForDirectBuy(null)}
                  className="w-full py-2.5 rounded-full bg-[#073525] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {buyError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {buyError}
                  </div>
                )}

                {/* Card summary */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200 flex items-center gap-3">
                  <img
                    src={selectedCardForDirectBuy.imageUrl}
                    alt=""
                    className="w-14 h-18 object-contain rounded-xl bg-white p-1 border border-neutral-200 shadow-sm"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-neutral-900 truncate">{selectedCardForDirectBuy.name}</div>
                    <div className="text-xs text-neutral-500">{selectedCardForDirectBuy.grade} • PSA Certified</div>
                    <div className="text-base font-bold text-[#053b2a] font-mono mt-1">
                      ${selectedCardForDirectBuy.insuredUsd || selectedCardForDirectBuy.costUsd} USDC
                    </div>
                  </div>
                </div>

                {/* Buyer Account */}
                <div className="p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-neutral-400" />
                    Recipient Account:
                  </span>
                  <span className="font-mono font-semibold text-neutral-900">{connectedAccount}</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCardForDirectBuy(null)}
                    className="px-4 py-2 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-xs font-medium text-neutral-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDirectBuy}
                    disabled={buyLoading}
                    className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {buyLoading ? "Processing..." : "Confirm & Pay"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN TO AGENT (SNIPE) */}
      {selectedCardForAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl overflow-hidden text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#053b2a]" />
                  Assign Agent to Snipe
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Your autonomous agent acquires this slab using its internal sub-account treasury
                </p>
              </div>
              <button
                onClick={() => setSelectedCardForAgent(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {agentResult ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#f8faf9] border border-emerald-500/30 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm text-[#053b2a]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Agent Successfully Sniped Card!
                  </div>
                  <p className="text-neutral-700">
                    <span className="text-neutral-900 font-semibold">{selectedCardForAgent.name}</span> has been acquired and stored in your agent's sub-account vault.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 font-mono text-[10px] text-neutral-600 space-y-1.5 mt-2">
                    <div className="text-neutral-900 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>NEAR Chain Signatures (MPC) Holding Key</span>
                    </div>
                    <div className="truncate">• Solana Holding Key: <span className="text-neutral-900 font-semibold">{agentResult.solana_holding_address || "SolVault7x9Q..."}</span></div>
                    <div>• Custody: <span className="text-neutral-700">{agentResult.vault_custody || "Brink's Vaults"}</span></div>
                    <div className="truncate">• Settlement TX: <span className="text-neutral-500">{agentResult.tx_hash}</span></div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCardForAgent(null)}
                  className="w-full py-2.5 rounded-full bg-[#073525] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAgentSnipe} className="space-y-4">
                {agentError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {agentError}
                  </div>
                )}

                {/* Card preview */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200 flex items-center gap-3">
                  <img
                    src={selectedCardForAgent.imageUrl}
                    alt=""
                    className="w-14 h-18 object-contain rounded-xl bg-white p-1 border border-neutral-200 shadow-sm"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-neutral-900 truncate">{selectedCardForAgent.name}</div>
                    <div className="text-xs text-neutral-500">{selectedCardForAgent.grade} • PSA Certified</div>
                    <div className="text-base font-bold text-[#053b2a] font-mono mt-1">
                      ${selectedCardForAgent.insuredUsd || selectedCardForAgent.costUsd} USDC
                    </div>
                  </div>
                </div>

                {vaults.length > 0 ? (
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Select Hunting Agent / Vault:
                    </label>
                    <select
                      value={targetVaultId}
                      onChange={(e) => setTargetVaultId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-[#073525] font-sans shadow-sm"
                    >
                      {vaults.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.sub_account}) • Treasury: ${v.usdc_balance} USDC
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200 text-xs text-center space-y-2">
                    <p className="text-neutral-600">You do not have any active trading agents yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardForAgent(null);
                        if (onOpenMint) onOpenMint();
                      }}
                      className="px-4 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Mint New Agent
                    </button>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCardForAgent(null)}
                    className="px-4 py-2 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-xs font-medium text-neutral-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  {vaults.length > 0 && (
                    <button
                      type="submit"
                      disabled={agentLoading}
                      className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      {agentLoading ? "Sniping Slab..." : "Confirm Agent Snipe"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
