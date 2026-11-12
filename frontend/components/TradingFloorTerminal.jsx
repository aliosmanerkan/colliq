"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeftRight,
  Shield,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Coins,
  Layers,
} from "lucide-react";
import TradeDetailModal from "@/components/TradeDetailModal";

export default function TradingFloorTerminal({
  trades = [],
  tradeHistory = [],
  onTriggerCycle,
  isTriggering,
  onTriggerSnipe,
  isSniping,
}) {
  const allTrades = useMemo(() => {
    return trades && trades.length > 0 ? trades : tradeHistory || [];
  }, [trades, tradeHistory]);

  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [followLatest, setFollowLatest] = useState(true);
  const [showPrivateReasoning, setShowPrivateReasoning] = useState(true);
  const [tapeFilter, setTapeFilter] = useState("all"); // "all" | "barter" | "snipes" | "vetoed"
  const [modalTrade, setModalTrade] = useState(null);

  // Auto-follow newest trade when followLatest is active
  useEffect(() => {
    if (followLatest && allTrades.length > 0) {
      setSelectedTradeId(allTrades[0]?.id || allTrades[0]?.trade_id);
    }
  }, [allTrades, followLatest]);

  // Derive the active selected trade
  const activeTrade = useMemo(() => {
    if (!allTrades || allTrades.length === 0) return null;
    return (
      allTrades.find((t) => (t.id || t.trade_id) === selectedTradeId) ||
      allTrades[0]
    );
  }, [allTrades, selectedTradeId]);

  // Helpers to inspect trade type
  const isMarketSnipe = (trade) => {
    if (!trade) return false;
    const tid = String(trade.trade_id || "");
    return (
      tid.startsWith("snipe-") ||
      trade.vault_b_name?.includes("Collector Crypt") ||
      (Array.isArray(trade.cards_from_a) &&
        trade.cards_from_a.length === 0 &&
        Array.isArray(trade.cards_from_b) &&
        trade.cards_from_b.length > 0)
    );
  };

  const isAcquisition = (trade) => {
    if (!trade) return false;
    const tid = String(trade.trade_id || "");
    return (
      tid.startsWith("acq-") ||
      trade.negotiation_log?.[0]?.action === "BUSINESS_ACQUISITION"
    );
  };

  // Filtered tape list
  const filteredTrades = useMemo(() => {
    return allTrades.filter((t) => {
      const isSnipe = isMarketSnipe(t);
      const isAcq = isAcquisition(t);
      const isVetoed = t.status === "REJECTED_GUARDRAIL";

      if (tapeFilter === "barter") return !isSnipe && !isAcq;
      if (tapeFilter === "snipes") return isSnipe;
      if (tapeFilter === "vetoed") return isVetoed;
      return true;
    });
  }, [allTrades, tapeFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      return (
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        " • " +
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    } catch {
      return "Recently";
    }
  };

  const getCardGradeBadge = (card) => {
    if (!card) return "PSA 10";
    if (card.grading_company && card.grade) {
      return `${card.grading_company} ${card.grade}`;
    }
    const gradeStr = String(card.grade || "10");
    if (gradeStr.includes("CGC") || gradeStr.includes("BGS") || gradeStr.includes("PSA")) {
      return gradeStr;
    }
    return `PSA ${gradeStr}`;
  };

  // Active Trade derivations
  const activeIsSnipe = isMarketSnipe(activeTrade);
  const activeIsAcq = isAcquisition(activeTrade);
  const activeIsBarter = !activeIsSnipe && !activeIsAcq;

  const cardA = activeTrade?.cards_from_a?.[0] || null;
  const cardB = activeTrade?.cards_from_b?.[0] || null;

  const cardAPrice = Number(
    cardA?.oracle_price || cardA?.oracle_fair_value_usdc || 0
  );
  const cardBPrice = Number(
    cardB?.oracle_price || cardB?.oracle_fair_value_usdc || 0
  );

  const usdcFromA = Number(activeTrade?.usdc_from_a || 0);
  const usdcFromB = Number(activeTrade?.usdc_from_b || 0);

  const leftSideTotal = cardAPrice + usdcFromA;
  const rightSideTotal = cardBPrice + usdcFromB;
  const cashDelta = Math.abs(usdcFromA - usdcFromB);
  const protocolFee = Number(activeTrade?.protocol_fee_usdc || 0);

  // Chronological transcript (Round 1 -> 2 -> 3 -> 4)
  const sortedTranscript = useMemo(() => {
    if (!activeTrade || !Array.isArray(activeTrade.negotiation_log)) return [];
    return [...activeTrade.negotiation_log].sort(
      (a, b) => (Number(a.round) || 0) - (Number(b.round) || 0)
    );
  }, [activeTrade]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN (7 Cols): THE ACTIVE DEAL DESK                */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {!activeTrade ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No trade data available. Run a match or snipe to inspect deals.
            </div>
          ) : (
            <>
              {/* SECTION A: Visual Matchup Stage */}
              <div className="border-b border-slate-200/80">
                {/* 1. Stage Header Bar */}
                <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
                  {/* Left: Deal Type Pill, ID & Follow Latest */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {activeIsSnipe ? (
                      <span className="bg-slate-900 text-white text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wide">
                        AUTONOMOUS MARKET SNIPE
                      </span>
                    ) : activeIsAcq ? (
                      <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wide">
                        BUSINESS ACQUISITION
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wide">
                        A2A ATOMIC BARTER
                      </span>
                    )}

                    <div className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
                      <span>
                        #{String(activeTrade.trade_id || activeTrade.id).slice(0, 14)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(activeTrade.createdAt)}</span>
                    </div>

                    {!followLatest && (
                      <button
                        onClick={() => {
                          setFollowLatest(true);
                          if (allTrades.length > 0) {
                            setSelectedTradeId(allTrades[0]?.id || allTrades[0]?.trade_id);
                          }
                        }}
                        className="text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full cursor-pointer transition flex items-center gap-1"
                        title="Return to tracking newest settled trades"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Follow Latest</span>
                      </button>
                    )}
                  </div>

                  {/* Right: Outcome Status & Block/Tx Proof */}
                  <div className="flex items-center gap-2">
                    {activeTrade.status === "REJECTED_GUARDRAIL" ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>VETOED BY GUARDRAIL</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SETTLED ON NEAR</span>
                      </span>
                    )}

                    {activeTrade.tx_hash &&
                    activeTrade.tx_hash !== "0x_GUARDRAIL_DECLINED" &&
                    !activeTrade.tx_hash.startsWith("0x") ? (
                      <a
                        href={`https://testnet.nearblocks.io/txns/${activeTrade.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-0.5 ml-1"
                      >
                        <span>View Tx</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : activeTrade.near_block ? (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Block #{activeTrade.near_block}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* 2. Side-by-Side Slab Comparison Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-slate-50/40 border-b border-slate-100">
                  {/* Left Desk (md:col-span-5) — Initiator / Buyer */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        {activeIsSnipe ? "ACQUIRING VAULT" : activeIsAcq ? "ACQUIRING OWNER" : "INITIATOR VAULT"}
                      </span>
                      <span className="font-bold text-sm text-slate-900 truncate max-w-[180px]">
                        {activeTrade.vault_a_name}
                      </span>
                    </div>

                    {cardA ? (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center gap-3.5 shadow-2xs">
                        <div className="w-16 h-22 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {cardA.image_url ? (
                            <img
                              src={cardA.image_url}
                              alt={cardA.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Layers className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#053b2a]/10 text-[#053b2a]">
                              {getCardGradeBadge(cardA)}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">
                              {cardA.category || "Pokemon"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                            {cardA.name}
                          </h4>
                          <div className="text-[11px] font-mono text-slate-600 font-semibold">
                            Oracle: ${cardAPrice.toFixed(0)} USDC
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-center min-h-[96px] shadow-2xs space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                          Pure USDC Settlement
                        </span>
                        <div className="text-base font-mono font-bold text-slate-900">
                          ${usdcFromA.toFixed(2)} USDC
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Funded from Vault Treasury
                        </span>
                      </div>
                    )}

                    {/* Cash Sweetener Pill (if cards traded AND cash added) */}
                    {usdcFromA > 0 && cardA && (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>Cash Sweetener:</span>
                        <span>+ ${usdcFromA.toFixed(2)} USDC</span>
                      </div>
                    )}
                  </div>

                  {/* Center Parity Column (md:col-span-1) */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center gap-1 my-2 md:my-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {activeTrade.rounds_count || 1}R
                    </span>
                  </div>

                  {/* Right Desk (md:col-span-5) — Counterparty / Seller */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        {activeIsSnipe
                          ? "EXTERNAL VAULT SOURCE"
                          : activeIsAcq
                          ? "ACQUIRED TARGET VAULT"
                          : "COUNTERPARTY VAULT"}
                      </span>
                      <span className="font-bold text-sm text-slate-900 truncate max-w-[180px]">
                        {activeTrade.vault_b_name}
                      </span>
                    </div>

                    {cardB ? (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center gap-3.5 shadow-2xs">
                        <div className="w-16 h-22 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          {cardB.image_url ? (
                            <img
                              src={cardB.image_url}
                              alt={cardB.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Layers className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#053b2a]/10 text-[#053b2a]">
                              {getCardGradeBadge(cardB)}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">
                              {cardB.category || "Pokemon"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                            {cardB.name}
                          </h4>
                          <div className="text-[11px] font-mono text-slate-600 font-semibold">
                            Oracle: ${cardBPrice.toFixed(0)} USDC
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-center min-h-[96px] shadow-2xs space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                          Pure USDC Settlement
                        </span>
                        <div className="text-base font-mono font-bold text-slate-900">
                          ${usdcFromB.toFixed(2)} USDC
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Counterparty Settlement
                        </span>
                      </div>
                    )}

                    {/* Cash Sweetener Pill */}
                    {usdcFromB > 0 && cardB && (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>Cash Sweetener:</span>
                        <span>+ ${usdcFromB.toFixed(2)} USDC</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Deal Economics Summary Strip */}
                <div className="px-6 py-2.5 bg-white flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Left Total:</span>
                    <strong className="text-slate-800 font-semibold">
                      ${leftSideTotal.toFixed(2)} USDC
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Right Total:</span>
                    <strong className="text-slate-800 font-semibold">
                      ${rightSideTotal.toFixed(2)} USDC
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Cash Delta:</span>
                    <strong className="text-slate-800 font-semibold">
                      ${cashDelta.toFixed(2)} USDC
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Protocol Fee (0.5%):</span>
                    <strong className="text-slate-800 font-semibold">
                      ${protocolFee.toFixed(2)} USDC
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION B: Chronological Negotiation Transcript */}
              <div className="flex-1 flex flex-col">
                {/* Transcript Header */}
                <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Negotiation Transcript (Round 1 to {sortedTranscript.length || 1})
                  </div>

                  <button
                    onClick={() => setShowPrivateReasoning(!showPrivateReasoning)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition cursor-pointer font-medium"
                    title="Toggle dual-layer internal directive telemetry"
                  >
                    {showPrivateReasoning ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hide Owner Reasoning</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Show Owner Reasoning</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Transcript List */}
                <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto">
                  {sortedTranscript.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No recorded transcript for this trade.
                    </div>
                  ) : (
                    sortedTranscript.map((item, idx) => {
                      const roundNum = item.round || idx + 1;
                      const speakerName =
                        item.agent ||
                        (roundNum % 2 === 1
                          ? activeTrade.vault_a_name
                          : activeTrade.vault_b_name) ||
                        "Agent";
                      const isInitiator =
                        speakerName === activeTrade.vault_a_name || roundNum % 2 === 1;
                      const turn = item.turn || {};
                      const decision =
                        turn.decision ||
                        (item.action === "BUSINESS_ACQUISITION" ? "ACQUIRE" : null);
                      const publicArgument =
                        turn.public_argument ||
                        turn.message ||
                        (item.action === "BUSINESS_ACQUISITION"
                          ? `Autonomous business acquisition executed on-chain via Zombie Key Wipe at $${
                              item.salePrice || activeTrade.usdc_from_b
                            } USDC.`
                          : "Terms evaluated.");
                      const privateReasoning =
                        turn.private_reasoning_for_owner || turn.internal_reasoning;

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs transition-all ${
                            isInitiator
                              ? "border-l-4 border-l-slate-900"
                              : "border-l-4 border-l-blue-600"
                          }`}
                        >
                          {/* Top Row of Round Card */}
                          <div className="flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                ROUND 0{roundNum}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {speakerName}
                              </span>
                            </div>

                            {decision && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                  decision === "ACCEPT" || decision === "ACQUIRE"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : decision === "REJECT" || decision === "REJECT_GUARDRAIL"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                {decision === "ACCEPT" ? "CONSENSUS ACCEPT" : decision}
                              </span>
                            )}
                          </div>

                          {/* Public Argument */}
                          <p className="text-xs text-slate-700 leading-relaxed mt-2 font-sans">
                            {publicArgument}
                          </p>

                          {/* Private Owner Telemetry */}
                          {showPrivateReasoning && privateReasoning && (
                            <div className="mt-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-mono text-slate-600 space-y-0.5">
                              <div className="text-[10px] font-bold text-slate-500 tracking-wider">
                                INTERNAL DIRECTIVE CHECK:
                              </div>
                              <div className="leading-snug text-slate-700">
                                {privateReasoning}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (5 Cols): VISUAL DEAL & SNIPE TAPE           */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[760px]">
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Deal & Snipe Tape
              </h3>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                {filteredTrades.length}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600">
              <button
                onClick={() => setTapeFilter("all")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tapeFilter === "all"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTapeFilter("barter")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tapeFilter === "barter"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                Barter
              </button>
              <button
                onClick={() => setTapeFilter("snipes")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tapeFilter === "snipes"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                Snipes
              </button>
              <button
                onClick={() => setTapeFilter("vetoed")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tapeFilter === "vetoed"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                Vetoed
              </button>
            </div>
          </div>

          {/* Tape Rows List */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {filteredTrades.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No trades match this filter.
              </div>
            ) : (
              filteredTrades.map((t) => {
                const isSelected =
                  (t.id || t.trade_id) === (activeTrade?.id || activeTrade?.trade_id);
                const tIsSnipe = isMarketSnipe(t);
                const tIsAcq = isAcquisition(t);
                const tIsDeclined = t.status === "REJECTED_GUARDRAIL";

                const tCardA = t.cards_from_a?.[0] || null;
                const tCardB = t.cards_from_b?.[0] || null;

                const tUsdcA = Number(t.usdc_from_a || 0);
                const tUsdcB = Number(t.usdc_from_b || 0);

                return (
                  <div
                    key={t.id || t.trade_id}
                    onClick={() => {
                      setSelectedTradeId(t.id || t.trade_id);
                      setFollowLatest(false);
                    }}
                    className={`p-3.5 transition cursor-pointer text-left flex items-center gap-3 ${
                      isSelected
                        ? "bg-slate-900/[0.04] border-l-4 border-l-slate-900"
                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Left: Visual Slab Thumbnail(s) */}
                    <div className="shrink-0 flex items-center">
                      {tIsSnipe ? (
                        <div className="w-9 h-12 rounded bg-slate-50 border border-slate-200 object-contain p-0.5 overflow-hidden flex items-center justify-center">
                          {tCardB?.image_url ? (
                            <img
                              src={tCardB.image_url}
                              alt={tCardB.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Layers className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                      ) : tIsAcq ? (
                        <div className="w-9 h-12 rounded bg-purple-50 border border-purple-200 object-contain p-0.5 overflow-hidden flex items-center justify-center">
                          {tCardA?.image_url ? (
                            <img
                              src={tCardA.image_url}
                              alt={tCardA.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Layers className="w-4 h-4 text-purple-300" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center -space-x-2">
                          <div className="w-8 h-11 rounded bg-slate-50 border border-slate-200 object-contain p-0.5 overflow-hidden flex items-center justify-center z-10 shadow-2xs">
                            {tCardA?.image_url ? (
                              <img
                                src={tCardA.image_url}
                                alt={tCardA.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <Layers className="w-3.5 h-3.5 text-slate-300" />
                            )}
                          </div>
                          <div className="w-8 h-11 rounded bg-slate-50 border border-slate-200 object-contain p-0.5 overflow-hidden flex items-center justify-center shadow-2xs">
                            {tCardB?.image_url ? (
                              <img
                                src={tCardB.image_url}
                                alt={tCardB.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <Layers className="w-3.5 h-3.5 text-slate-300" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center: Deal Summary */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {/* Top Line */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                        {tIsSnipe ? (
                          <>
                            <span className="text-[10px] font-mono bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold">
                              SNIPE
                            </span>
                            <span className="truncate">{t.vault_a_name}</span>
                          </>
                        ) : tIsAcq ? (
                          <>
                            <span className="text-[10px] font-mono bg-purple-900 text-white px-1.5 py-0.2 rounded font-semibold">
                              ACQUISITION
                            </span>
                            <span className="truncate">{t.vault_b_name}</span>
                          </>
                        ) : (
                          <span className="truncate">
                            {t.vault_a_name} <span className="text-slate-400 font-normal">⇄</span> {t.vault_b_name}
                          </span>
                        )}
                      </div>

                      {/* Middle Line: Card Names */}
                      <div className="text-[11px] text-slate-600 truncate">
                        {tIsSnipe
                          ? tCardB?.name || "Physical Slab"
                          : tIsAcq
                          ? `Vault Acquired (${t.cards_from_a?.length || 0} slabs)`
                          : `${tCardA?.name || "Slab"} ⇄ ${tCardB?.name || "Slab"}`}
                      </div>

                      {/* Bottom Line: Economics & Rounds */}
                      <div className="font-mono text-[10px] text-slate-500 flex items-center gap-2">
                        {tIsSnipe ? (
                          <span>${tUsdcA.toFixed(0)} USDC Paid</span>
                        ) : tIsAcq ? (
                          <span>${tUsdcB.toFixed(0)} USDC Acquired</span>
                        ) : tUsdcA > 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            +${tUsdcA.toFixed(0)} USDC Sweetener
                          </span>
                        ) : (
                          <span>Direct Slab Swap</span>
                        )}
                        <span>•</span>
                        <span>{t.rounds_count || 1}R</span>
                      </div>
                    </div>

                    {/* Right: Status Indicator */}
                    <div className="shrink-0">
                      {tIsDeclined ? (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          VETOED
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          SETTLED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Full Transcript Inspection Modal */}
      <TradeDetailModal
        trade={modalTrade}
        isOpen={!!modalTrade}
        onClose={() => setModalTrade(null)}
      />
    </>
  );
}
