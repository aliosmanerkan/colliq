"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Wallet,
  Bot,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "@/lib/api";
import {
  initNearWallet,
  showWalletModal,
  usdToNear,
  executeNearPayment,
  getLiveNearAccountBalance
} from "@/lib/near";

const BASE_CATEGORIES = [
  { id: "ALL", label: "All Slabs", defaultCount: 171386 },
  { id: "Pokemon", label: "Pokémon", defaultCount: 102428 },
  { id: "One Piece", label: "One Piece", defaultCount: 31664 },
  { id: "Baseball", label: "Baseball", defaultCount: 6343 },
  { id: "Dragon Ball", label: "Dragon Ball", defaultCount: 5085 },
  { id: "Basketball", label: "Basketball", defaultCount: 4728 },
  { id: "Football", label: "Football", defaultCount: 3513 },
  { id: "Lorcana", label: "Lorcana", defaultCount: 2384 },
  { id: "Yu-Gi-Oh!", label: "Yu-Gi-Oh!", defaultCount: 465 },
  { id: "Magic The Gathering", label: "Magic", defaultCount: 460 }
];

const GRADING_COMPANIES = [
  { id: "ALL", label: "All Graders" },
  { id: "PSA", label: "PSA" },
  { id: "CGC", label: "CGC" },
  { id: "BGS", label: "BGS" },
  { id: "SGC", label: "SGC" }
];

const SORT_OPTIONS = [
  { id: "listedDateDesc", label: "Recently Listed" },
  { id: "priceDesc", label: "Value: High to Low" },
  { id: "priceAsc", label: "Value: Low to High" },
  { id: "listedPriceAsc", label: "Listing Price: Low to High" },
  { id: "yearAsc", label: "Vintage First (Oldest)" },
  { id: "yearDesc", label: "Modern First (Newest)" }
];

function formatCount(num) {
  if (!num) return "";
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  return String(num);
}

export default function CollectorCryptCatalog({
  vaults = [],
  onCardBridged,
  onOpenMint,
  onTotalSlabsChange
}) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [findTotal, setFindTotal] = useState(171386);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [nextCursor, setNextCursor] = useState(null);

  // Filters
  const [category, setCategory] = useState("ALL");
  const [gradingCompany, setGradingCompany] = useState("ALL");
  const [sortBy, setSortBy] = useState("listedDateDesc");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Category horizontal scroll & drag controls
  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkCategoryScroll = useCallback(() => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    checkCategoryScroll();
    const handleResize = () => checkCategoryScroll();
    window.addEventListener("resize", handleResize);

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkCategoryScroll();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", checkCategoryScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", checkCategoryScroll);
    };
  }, [checkCategoryScroll]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth"
      });
      setTimeout(checkCategoryScroll, 300);
    }
  };

  const handleMouseDown = (e) => {
    if (!categoryScrollRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - categoryScrollRef.current.offsetLeft;
    scrollLeftRef.current = categoryScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !categoryScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoryScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    categoryScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkCategoryScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const router = useRouter();

  // Connected Wallet Account & Live NEAR Balance
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [liveNearBalance, setLiveNearBalance] = useState("0.00");

  // Filter ONLY current user's vaults (excluding collectorcrypt.colliq.testnet)
  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const myVaults = useMemo(() => {
    return (vaults || []).filter(
      (v) =>
        !String(v.sub_account || "").includes("collectorcrypt") &&
        (v.owner_account || "").toLowerCase() === userAccount
    );
  }, [vaults, userAccount]);

  // Slab Inspector & Acquisition Modal
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeImageView, setActiveImageView] = useState("front"); // "front" | "back"
  const [destination, setDestination] = useState("vault"); // "vault" | "personal"
  const [targetVaultId, setTargetVaultId] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState("idle"); // "idle" | "awaiting_wallet" | "confirming" | "success"
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [purchaseError, setPurchaseError] = useState("");

  // Sync default target vault whenever myVaults change
  useEffect(() => {
    if (myVaults.length > 0 && (!targetVaultId || !myVaults.some((v) => String(v.id) === String(targetVaultId)))) {
      setTargetVaultId(String(myVaults[0].id));
    }
  }, [myVaults, targetVaultId]);

  // Search input debounce (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Wallet subscription
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

  // Fetch initial or updated cards when filter change
  const fetchCards = useCallback(async (isLoadMore = false, cursorToUse = null) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get("/market/collector-crypt", {
        params: {
          category,
          gradingCompany,
          sortBy,
          search: debouncedSearch,
          cursor: cursorToUse || undefined,
          limit: 48
        }
      });

      const fetchedCards = res.data?.cards || [];
      const newNextCursor = res.data?.nextCursor || null;
      const total = res.data?.findTotal || res.data?.total || 171386;

      setFindTotal(total);
      if (onTotalSlabsChange) onTotalSlabsChange(total);

      if (res.data?.cardsQtyByCategory) {
        setCategoryCounts(res.data.cardsQtyByCategory);
      }

      setNextCursor(newNextCursor);

      if (isLoadMore) {
        setCards((prev) => [...prev, ...fetchedCards]);
      } else {
        setCards(fetchedCards);
      }
    } catch (err) {
      console.error("Error loading vault inventory:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, gradingCompany, sortBy, debouncedSearch, onTotalSlabsChange]);

  useEffect(() => {
    fetchCards(false, null);
  }, [fetchCards]);

  const handleLoadMore = () => {
    if (!nextCursor || loadingMore) return;
    fetchCards(true, nextCursor);
  };

  // Unified Purchase & Delivery Handler
  const handleConfirmPurchase = async () => {
    if (!selectedCard) return;

    setPurchaseLoading(true);
    setPurchaseError("");

    try {
      const price = Number(selectedCard.costUsd || selectedCard.insuredUsd || 50);
      const nearAmount = usdToNear(price);

      // Destination A: Snipe into AI Agent Vault (settled in USDC via NEP-413 NEAR Intent)
      if (destination === "vault") {
        if (!targetVaultId) {
          throw new Error("Please select an agent vault destination.");
        }
        const selectedVault = myVaults.find((v) => String(v.id) === String(targetVaultId));
        if (selectedVault && Number(selectedVault.usdc_balance) < price) {
          throw new Error(`Insufficient treasury in ${selectedVault.name}. Required: $${price.toFixed(2)} USDC, Available: $${Number(selectedVault.usdc_balance).toFixed(2)} USDC.`);
        }

        const res = await api.post(`/vaults/${targetVaultId}/snipe`, {
          card_id: selectedCard.id,
          card_data: selectedCard
        });

        setPurchaseResult({
          card: selectedCard,
          destinationType: "vault",
          targetVault: selectedVault?.name || res.data?.vault?.name || "Agent Vault",
          near_intent: res.data?.near_intent || null,
          solana_holding_address: res.data?.solana_holding_address || null,
          txHash: res.data?.tx_hash || res.data?.card?.card_id || "near:vault_acq_settled"
        });
        setPurchaseStep("success");
        if (onCardBridged) onCardBridged();
        return;
      }

      // Destination B: Personal Wallet via NEAR Wallet Transaction
      const wallet = await initNearWallet();
      const accId = wallet?.accountId || connectedAccount;
      if (!accId) {
        await showWalletModal();
        setPurchaseLoading(false);
        return;
      }

      setPurchaseStep("awaiting_wallet");
      const paymentRes = await executeNearPayment({
        receiverId: "colliq.testnet",
        amountNear: nearAmount
      });

      setPurchaseStep("confirming");
      const res = await api.post("/market/buy-direct", {
        card_id: selectedCard.id,
        buyer_account: accId,
        payment_method: "NEAR",
        near_amount: nearAmount,
        tx_hash: paymentRes.txHash,
        card_data: selectedCard
      });

      const newBal = await getLiveNearAccountBalance(accId);
      setLiveNearBalance(newBal);

      setPurchaseResult({
        ...res.data,
        card: selectedCard,
        destinationType: "personal",
        nearAmount,
        near_intent: res.data?.near_intent || null,
        solana_holding_address: res.data?.solana_holding_address || null,
        txHash: paymentRes.txHash,
        explorerUrl: `https://testnet.nearblocks.io/txns/${paymentRes.txHash}`
      });
      setPurchaseStep("success");
      if (onCardBridged) onCardBridged();
    } catch (err) {
      console.error("Purchase error:", err);
      setPurchaseError(err.response?.data?.error || err.message || "Purchase could not be completed. Please try again.");
      setPurchaseStep("idle");
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="space-y-4">
        {/* Dynamic Category Chips with Horizontal Scroll Controls */}
        <div className="relative group/chips">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 bg-gradient-to-r from-[#fbfdfc] via-[#fbfdfc]/90 to-transparent">
              <button
                type="button"
                onClick={() => scrollCategories("left")}
                aria-label="Scroll categories left"
                className="w-7 h-7 rounded-full bg-white border border-neutral-200/90 shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Category Chips Scroller */}
          <div
            ref={categoryScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth no-scrollbar scrollbar-none cursor-grab active:cursor-grabbing select-none"
          >
            {BASE_CATEGORIES.map((cat) => {
              const liveCount = cat.id === "ALL" ? findTotal : (categoryCounts[cat.id] || cat.defaultCount);
              const countLabel = formatCount(liveCount);

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (!hasMovedRef.current) {
                      setCategory(cat.id);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    category === cat.id
                      ? "bg-[#073525] text-white shadow-sm font-semibold"
                      : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/90 hover:border-neutral-300"
                  }`}
                >
                  <span>{cat.label}</span>
                  {countLabel && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        category === cat.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {countLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 bg-gradient-to-l from-[#fbfdfc] via-[#fbfdfc]/90 to-transparent">
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                aria-label="Scroll categories right"
                className="w-7 h-7 rounded-full bg-white border border-neutral-200/90 shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search, Grader, and Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Search 170k+ vaulted slabs by card, set, cert #..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#073525] focus:ring-1 focus:ring-[#073525] transition font-sans shadow-sm"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grader Filter & Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Grader Filter */}
            <select
              value={gradingCompany}
              onChange={(e) => setGradingCompany(e.target.value)}
              className="px-3 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-700 focus:outline-none focus:border-[#073525] transition cursor-pointer shadow-sm"
            >
              {GRADING_COMPANIES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#073525] transition cursor-pointer shadow-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CARD GRID (ZERO AI SLOP, HIGH-DENSITY PROFESSIONAL DISPLAY) */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#073525]" />
          <span>Loading verified physical slabs...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="py-24 text-center rounded-[24px] bg-white border border-neutral-200 p-8 space-y-2">
          <p className="text-sm font-semibold text-neutral-900">No matching slabs found</p>
          <p className="text-xs text-neutral-500">Try adjusting your search terms or clearing filters.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {cards.map((card) => {
              const price = card.costUsd || card.insuredUsd || 50;
              const nearPrice = usdToNear(price);

              const comp = card.gradingCompany || (card.grade?.startsWith("CGC") ? "CGC" : card.grade?.startsWith("BGS") ? "BGS" : "PSA");
              const cleanGrade = card.grade?.replace(/^(PSA|CGC|BGS|SGC)\s*/i, "") || "10";
              const compColor = comp === "CGC" ? "text-blue-700 bg-blue-50 border-blue-200" : comp === "BGS" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedCard(card);
                    setActiveImageView("front");
                    setDestination(myVaults.length > 0 ? "vault" : "personal");
                    if (myVaults.length > 0 && (!targetVaultId || !myVaults.some((v) => String(v.id) === String(targetVaultId)))) {
                      setTargetVaultId(String(myVaults[0].id));
                    }
                    setPurchaseResult(null);
                    setPurchaseError("");
                    setPurchaseStep("idle");
                  }}
                  className="group relative rounded-2xl p-3 bg-white border border-neutral-200/80 hover:border-emerald-600 transition-all duration-200 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(7,53,37,0.08)] hover:-translate-y-0.5 cursor-pointer"
                >
                  <div>
                    {/* Upper Canvas (Slab Image Container) */}
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#fbfdfc] flex items-center justify-center p-2 border border-neutral-100 group-hover:border-neutral-200 transition mb-2.5">
                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${compColor}`}>
                          {comp} {cleanGrade}
                        </span>
                      </div>

                      {card.certNumber && (
                        <div className="absolute top-2 right-2 z-10 font-mono text-[9px] text-neutral-400 bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-neutral-200/60">
                          #{card.certNumber}
                        </div>
                      )}

                      <img
                        src={card.thumbnailUrl || card.imageUrl}
                        alt={card.name}
                        loading="lazy"
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Metadata Header */}
                    <div className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mb-1">
                      {card.category || "TCG"} {card.year ? `• ${card.year}` : ""}
                    </div>

                    {/* Card Title */}
                    <h3
                      className="text-xs font-medium text-neutral-900 line-clamp-2 min-h-[32px] group-hover:text-[#073525] transition leading-snug"
                      title={card.name}
                    >
                      {card.name}
                    </h3>
                  </div>

                  {/* Valuation & Quick Action */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-neutral-900 font-mono leading-tight">
                        ${Number(price).toLocaleString()}
                        <span className="text-[10px] font-normal text-neutral-400 ml-1">USDC</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        ~{nearPrice} NEAR
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold text-[#073525]">
                      <span>Acquire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* REAL CURSOR PAGINATION */}
          <div className="pt-12 pb-6 flex flex-col items-center justify-center gap-3">
            <div className="text-xs text-neutral-500 font-mono">
              Showing {cards.length.toLocaleString()} of {Number(findTotal).toLocaleString()} Verified Slabs
            </div>

            {nextCursor && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading Next 48 Slabs...</span>
                  </>
                ) : (
                  <span>Load More Slabs (+48)</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* SLAB INSPECTOR & ACQUISITION MODAL (SPLIT 2-COLUMN) */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl lg:max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-[24px] sm:rounded-[28px] bg-white border border-neutral-200 shadow-2xl flex flex-col overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-neutral-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm sm:text-base font-bold text-neutral-900">Physical Slab Inspector</h3>
              </div>
              <button
                onClick={() => {
                  if (!purchaseLoading) setSelectedCard(null);
                }}
                disabled={purchaseLoading}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              {purchaseResult ? (
                /* Success State */
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#f8faf9] border border-emerald-300 text-emerald-950 text-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Slab Successfully Acquired!</span>
                    </div>

                    <p className="text-neutral-700 leading-relaxed font-sans text-xs">
                      <strong className="text-neutral-900">{selectedCard.name}</strong> has been transferred into{" "}
                      {purchaseResult.destinationType === "vault" ? (
                        <span className="font-semibold text-[#073525]">{purchaseResult.targetVault}</span>
                      ) : (
                        <span className="font-semibold text-[#073525]">your personal wallet ({connectedAccount || "alierkan.testnet"})</span>
                      )}.
                    </p>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-neutral-200 font-mono text-[11px] text-neutral-600 space-y-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span>Certification:</span>
                        <span className="text-neutral-900 font-bold">{selectedCard.grade || "PSA 10"} • #{selectedCard.certNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Solana Custody Mint:</span>
                        <span className="text-neutral-900 font-bold truncate max-w-[220px]">{selectedCard.id}</span>
                      </div>
                      {purchaseResult.near_intent?.intent_id && (
                        <div className="flex items-center justify-between">
                          <span>NEAR Intent ID:</span>
                          <span className="text-emerald-700 font-bold truncate max-w-[220px]">{purchaseResult.near_intent.intent_id}</span>
                        </div>
                      )}
                      {purchaseResult.solana_holding_address && (
                        <div className="flex items-center justify-between">
                          <span>Derived MPC Vault:</span>
                          <span className="text-neutral-900 font-bold truncate max-w-[220px]">{purchaseResult.solana_holding_address}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Transaction Reference:</span>
                        {purchaseResult.txHash && !purchaseResult.txHash.startsWith("0x") && !purchaseResult.txHash.startsWith("near:") ? (
                          <a
                            href={`https://testnet.nearblocks.io/txns/${purchaseResult.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1 font-bold truncate max-w-[220px]"
                          >
                            <span>{purchaseResult.txHash}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-neutral-900 font-bold truncate max-w-[220px]">{purchaseResult.txHash}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCard(null);
                      setPurchaseResult(null);
                      router.push("/portfolio");
                    }}
                    className="w-full py-2.5 sm:py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    Done & View in Portfolio
                  </button>
                </div>
              ) : (
                /* 2-Column Inspector & Purchase Form */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
                  {/* Left Column: Slab Visuals & Flip View */}
                  <div className="flex flex-col items-center justify-start md:sticky md:top-0">
                    <div className="relative w-full max-w-[190px] sm:max-w-[220px] md:max-w-[240px] aspect-[3/4] max-h-[250px] sm:max-h-[280px] md:max-h-[310px] rounded-2xl bg-[#fbfdfc] border border-neutral-200 flex items-center justify-center p-2.5 sm:p-3 shadow-inner">
                      <img
                        src={activeImageView === "back" && selectedCard.backImageUrl ? selectedCard.backImageUrl : selectedCard.imageUrl}
                        alt={selectedCard.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
                      />
                    </div>

                    {/* Flip Slab Toggle */}
                    {selectedCard.backImageUrl && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveImageView("front")}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                            activeImageView === "front"
                              ? "bg-[#073525] text-white"
                              : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          Front View
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageView("back")}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                            activeImageView === "back"
                              ? "bg-[#073525] text-white"
                              : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Back View</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Slab Metadata & Delivery */}
                  <div className="space-y-3 sm:space-y-3.5">
                    {purchaseError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                        {purchaseError}
                      </div>
                    )}

                    {/* Slab Header Info */}
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-[10px] font-mono font-bold text-neutral-800 mb-1.5">
                        <span>{selectedCard.grade || "PSA 10"}</span>
                        <span className="text-neutral-400">•</span>
                        <span>{selectedCard.category || "TCG"}</span>
                        {selectedCard.year && <span>• {selectedCard.year}</span>}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
                        {selectedCard.name}
                      </h4>
                    </div>

                    {/* On-Chain & Custody Metadata Table */}
                    <div className="p-3 rounded-xl bg-[#f8faf9] border border-neutral-200/80 font-mono text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Cert Number:</span>
                        <span className="text-neutral-900 font-semibold">#{selectedCard.certNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Physical Custody:</span>
                        <span className="text-neutral-900 font-semibold truncate max-w-[170px]" title={selectedCard.vaultLocation}>
                          {selectedCard.vault || "PWCC / Brink's"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Solana Mint:</span>
                        <a
                          href={`https://solscan.io/token/${selectedCard.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#073525] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>{selectedCard.id.slice(0, 4)}...{selectedCard.id.slice(-4)}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600 pt-1 border-t border-neutral-200/60">
                        <span>Valuation / Price:</span>
                        <span className="text-xs sm:text-sm font-bold text-neutral-900">
                          ${Number(selectedCard.costUsd || selectedCard.insuredUsd || 50).toLocaleString()} USDC
                        </span>
                      </div>
                    </div>

                    {/* Delivery Target Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                        Deliver Slab To:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDestination("personal")}
                          className={`p-2 rounded-xl border text-xs text-left transition flex items-center gap-2 cursor-pointer ${
                            destination === "personal"
                              ? "border-[#073525] bg-[#f8faf9] ring-1 ring-[#073525]"
                              : "border-neutral-200 hover:border-neutral-300 bg-white"
                          }`}
                        >
                          <Wallet className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                          <div>
                            <div className="font-semibold text-xs text-neutral-900">Personal Wallet</div>
                            <div className="text-[9px] sm:text-[10px] text-neutral-500">Hold on NEAR</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDestination("vault")}
                          className={`p-2 rounded-xl border text-xs text-left transition flex items-center gap-2 cursor-pointer ${
                            destination === "vault"
                              ? "border-[#073525] bg-[#f8faf9] ring-1 ring-[#073525]"
                              : "border-neutral-200 hover:border-neutral-300 bg-white"
                          }`}
                        >
                          <Bot className="w-3.5 h-3.5 text-[#073525] shrink-0" />
                          <div>
                            <div className="font-semibold text-xs text-neutral-900">AI Agent Vault</div>
                            <div className="text-[9px] sm:text-[10px] text-neutral-500">Autonomous Trading</div>
                          </div>
                        </button>
                      </div>

                      {/* Target Vault Dropdown */}
                      {destination === "vault" && (
                        <div className="pt-1 space-y-1.5">
                          {myVaults.length === 0 ? (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                              <span>No active agent vaults found.</span>
                              <button
                                type="button"
                                onClick={onOpenMint}
                                className="font-bold underline hover:text-amber-950 cursor-pointer"
                              >
                                Mint Vault
                              </button>
                            </div>
                          ) : (
                            <>
                              <select
                                value={targetVaultId}
                                onChange={(e) => setTargetVaultId(e.target.value)}
                                className="w-full p-2 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#073525]"
                              >
                                {myVaults.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name} (@{v.sub_account}) • ${Number(v.usdc_balance || 0).toFixed(0)} USDC
                                  </option>
                                ))}
                              </select>

                              {(() => {
                                const sVault = myVaults.find((v) => String(v.id) === String(targetVaultId)) || myVaults[0];
                                const cardCost = Number(selectedCard.costUsd || selectedCard.insuredUsd || 50);
                                if (!sVault) return null;
                                if (Number(sVault.usdc_balance || 0) < cardCost) {
                                  return (
                                    <div className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
                                      Insufficient Treasury: Vault holds ${Number(sVault.usdc_balance || 0).toFixed(2)} USDC (needs ${cardCost.toFixed(2)} USDC).
                                    </div>
                                  );
                                }
                                if (Number(sVault.usdc_balance || 0) < cardCost * 1.34) {
                                  return (
                                    <div className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                      Low Treasury Buffer: Remaining funds will dip below the 25% safety reserve.
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Payment Method Notice (For Personal Wallet) */}
                    {destination === "personal" && (
                      <div className="space-y-1 pt-0.5">
                        <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
                          Payment Currency:
                        </label>
                        <div className="p-2 rounded-xl border border-[#073525] bg-[#f8faf9] text-[#073525] text-xs font-semibold flex items-center justify-between">
                          <span>NEAR Testnet Wallet</span>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {usdToNear(selectedCard.costUsd || selectedCard.insuredUsd || 50)} NEAR
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500">
                          Executed via Meteor Wallet. Physical slab custody mapped to your NEAR account.
                        </p>
                      </div>
                    )}

                    {/* NEAR Intents Cross-Chain Settlement Route Preview Box */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-[10px] space-y-1 text-slate-600">
                      <div className="flex items-center justify-between font-bold text-slate-500 uppercase tracking-wider">
                        <span>INTENT STANDARD</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 font-semibold">
                          NEP-413 Cross-Chain Swap
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">GIVE:</span>
                        <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                          {destination === "vault"
                            ? `$${Number(selectedCard.costUsd || selectedCard.insuredUsd || 50).toFixed(2)} USDC`
                            : `${usdToNear(selectedCard.costUsd || selectedCard.insuredUsd || 50)} NEAR ($${Number(selectedCard.costUsd || selectedCard.insuredUsd || 50).toFixed(2)})`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">SOLVER:</span>
                        <span className="text-slate-800 font-medium">rwa-solver.colliq.testnet</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">RECEIVE:</span>
                        <span className="text-slate-800 font-medium">Solana pNFT #{selectedCard.certNumber} ➔ NEAR</span>
                      </div>
                    </div>

                    {/* Purchase Action Button */}
                    <div className="pt-1">
                      <button
                        onClick={handleConfirmPurchase}
                        disabled={
                          purchaseLoading ||
                          (destination === "vault" &&
                            (myVaults.length === 0 ||
                              Number((myVaults.find((v) => String(v.id) === String(targetVaultId)) || myVaults[0])?.usdc_balance || 0) <
                                Number(selectedCard.costUsd || selectedCard.insuredUsd || 50)))
                        }
                        className="w-full py-2.5 sm:py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {purchaseLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>
                              {purchaseStep === "awaiting_wallet"
                                ? "Confirm in NEAR Wallet..."
                                : "Executing Atomic Settlement..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {destination === "vault"
                                ? `Acquire into ${(myVaults.find((v) => String(v.id) === String(targetVaultId)) || myVaults[0])?.name || "Agent Vault"}`
                                : `Buy Slab with NEAR Wallet`}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
