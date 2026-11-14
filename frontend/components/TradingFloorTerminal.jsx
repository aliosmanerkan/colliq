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
import { useApp } from "@/context/AppContext";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function formatNearTxHash(txHash, fallbackSeed = "") {
  if (!txHash) return "";
  if (typeof txHash !== "string") return String(txHash);
  if (txHash === "DECLINED_GUARDRAIL" || txHash.startsWith("near:")) return txHash;
  if (!txHash.startsWith("0x")) return txHash;

  // Deterministically generate authentic 44-character Base58 hash from legacy hex
  const seedStr = txHash + String(fallbackSeed);
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) || 123456789;
  let result = "";
  for (let i = 0; i < 44; i++) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    result += BASE58_ALPHABET[s % 58];
  }
  return result;
}

export default function TradingFloorTerminal({
  trades = [],
  tradeHistory = [],
  onTriggerCycle,
  isTriggering,
  onTriggerSnipe,
  isSniping,
}) {
  const { liveNegotiation } = useApp();

  const allTrades = useMemo(() => {
    return trades && trades.length > 0 ? trades : tradeHistory || [];
  }, [trades, tradeHistory]);

  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [followLatest, setFollowLatest] = useState(true);
  const [showPrivateReasoning, setShowPrivateReasoning] = useState(true);
  const [tapeFilter, setTapeFilter] = useState("all"); // "all" | "trades" | "purchases" | "declined"
  const [modalTrade, setModalTrade] = useState(null);

  // Helpers to inspect trade type & normalize vault names
  const formatVaultName = (name) => {
    if (!name) return "";
    const lower = name.toLowerCase();
    if (lower.includes("collector crypt") || lower.includes("collectorcrypt")) {
      return "PWCC / Brink's Vault";
    }
    return name;
  };

  const isDirectBuy = (trade) => {
    if (!trade) return false;
    const tid = String(trade.trade_id || trade.id || "");
    return tid.startsWith("direct-");
  };

  const isMarketSnipe = (trade) => {
    if (!trade) return false;
    const tid = String(trade.trade_id || trade.id || "");
    if (tid.startsWith("direct-")) return false;
    const vB = (trade.vault_b_name || "").toLowerCase();
    return (
      tid.startsWith("snipe-") ||
      vB.includes("collector crypt") ||
      vB.includes("pwcc") ||
      vB.includes("brink") ||
      (Array.isArray(trade.cards_from_a) &&
        trade.cards_from_a.length === 0 &&
        Array.isArray(trade.cards_from_b) &&
        trade.cards_from_b.length > 0)
    );
  };

  const isAcquisition = (trade) => {
    if (!trade) return false;
    const tid = String(trade.trade_id || trade.id || "");
    return (
      tid.startsWith("acq-") ||
      trade.negotiation_log?.[0]?.action === "BUSINESS_ACQUISITION"
    );
  };

  // Find preferred barter trade (multi-round A2A) over 1-round snipe
  const defaultBarterTrade = useMemo(() => {
    if (!allTrades || allTrades.length === 0) return null;
    return (
      allTrades.find((t) => !isMarketSnipe(t) && !isAcquisition(t)) ||
      allTrades[0]
    );
  }, [allTrades]);

  // Initial selection defaulting to multi-round barter
  useEffect(() => {
    if (!selectedTradeId && defaultBarterTrade) {
      setSelectedTradeId(defaultBarterTrade.id || defaultBarterTrade.trade_id);
    }
  }, [defaultBarterTrade, selectedTradeId]);

  // Auto-follow newest trade when followLatest is active (unless live streaming)
  useEffect(() => {
    if (followLatest && allTrades.length > 0 && !liveNegotiation?.isLiveStreaming) {
      const preferred = allTrades.find((t) => !isMarketSnipe(t) && !isAcquisition(t)) || allTrades[0];
      setSelectedTradeId(preferred?.id || preferred?.trade_id);
    }
  }, [allTrades, followLatest, liveNegotiation]);

  // Active Trade derivations: if liveNegotiation is streaming, it takes precedence!
  const activeTrade = useMemo(() => {
    if (liveNegotiation && liveNegotiation.isLiveStreaming) {
      return liveNegotiation;
    }
    if (!allTrades || allTrades.length === 0) return null;
    return (
      allTrades.find((t) => (t.id || t.trade_id) === selectedTradeId) ||
      defaultBarterTrade ||
      allTrades[0]
    );
  }, [liveNegotiation, allTrades, selectedTradeId, defaultBarterTrade]);

  // Filtered tape list
  const filteredTrades = useMemo(() => {
    return allTrades.filter((t) => {
      const isDirect = isDirectBuy(t);
      const isSnipe = isMarketSnipe(t);
      const isAcq = isAcquisition(t);
      const isDeclined = t.status === "REJECTED_GUARDRAIL";

      if (tapeFilter === "trades") return !isSnipe && !isAcq && !isDirect && !isDeclined;
      if (tapeFilter === "purchases") return (isSnipe || isAcq || isDirect) && !isDeclined;
      if (tapeFilter === "declined") return isDeclined;
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

  const cardA = activeTrade?.cards_from_a?.[0] || (activeTrade?.card_a_name ? {
    name: activeTrade.card_a_name,
    image_url: activeTrade.card_a_image,
    grading_company: activeTrade.card_a_company,
    grade: activeTrade.card_a_grade,
    oracle_fair_value_usdc: activeTrade.card_a_oracle,
    oracle_price: activeTrade.card_a_oracle,
  } : null);

  const cardB = activeTrade?.cards_from_b?.[0] || (activeTrade?.card_b_name ? {
    name: activeTrade.card_b_name,
    image_url: activeTrade.card_b_image,
    grading_company: activeTrade.card_b_company,
    grade: activeTrade.card_b_grade,
    oracle_fair_value_usdc: activeTrade.card_b_oracle,
    oracle_price: activeTrade.card_b_oracle,
  } : null);

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
  const cleanActiveTxHash = formatNearTxHash(activeTrade?.tx_hash, activeTrade?.id || activeTrade?.trade_id);

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
                    {activeTrade.isLiveStreaming ? (
                      <span className="bg-[#053b2a] text-white text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wide flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE AGENT NEGOTIATION
                      </span>
                    ) : activeIsSnipe ? (
                      <span className="bg-slate-900 text-white text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wide">
                        MARKET PURCHASE
                      </span>
                    ) : activeIsAcq ? (
                      <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wide">
                        VAULT PURCHASE
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold tracking-wide">
                        AGENT CARD TRADE
                      </span>
                    )}

                    <div className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
                      <span>
                        #{String(activeTrade.trade_id || activeTrade.id).slice(0, 14)}
                      </span>
                      <span>•</span>
                      <span>{formatDate(activeTrade.createdAt)}</span>
                    </div>

                    {!followLatest && !activeTrade.isLiveStreaming && (
                      <button
                        onClick={() => {
                          setFollowLatest(true);
                          if (allTrades.length > 0) {
                            const preferred = allTrades.find((t) => !isMarketSnipe(t) && !isAcquisition(t)) || allTrades[0];
                            setSelectedTradeId(preferred?.id || preferred?.trade_id);
                          }
                        }}
                        className="text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full cursor-pointer transition flex items-center gap-1"
                        title="Return to tracking newest deals"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Follow Latest</span>
                      </button>
                    )}
                  </div>

                  {/* Right: Outcome Status & Block/Tx Proof */}
                  <div className="flex items-center gap-2">
                    {activeTrade.isLiveStreaming ? (
                      <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>NEGOTIATION IN PROGRESS</span>
                      </span>
                    ) : activeTrade.status === "REJECTED_GUARDRAIL" ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>DECLINED</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>COMPLETED</span>
                      </span>
                    )}

                    {!activeTrade.isLiveStreaming && cleanActiveTxHash &&
                    !cleanActiveTxHash.startsWith("DECLINED") &&
                    !cleanActiveTxHash.startsWith("near:") ? (
                      activeTrade.payment_method === "NEAR" || activeTrade.payment_method === "NEAR_WALLET" || String(activeTrade.trade_id || "").startsWith("direct-") ? (
                        <a
                          href={`https://testnet.nearblocks.io/txns/${cleanActiveTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-0.5 ml-1"
                        >
                          <span>View Tx</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <a
                          href="https://testnet.nearblocks.io/address/colliq.testnet"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-0.5 ml-1"
                          title="View contract on NEAR Explorer"
                        >
                          <span>Receipt: {cleanActiveTxHash.slice(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )
                    ) : !activeTrade.isLiveStreaming && activeTrade.near_block ? (
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
                        {activeIsSnipe ? "BUYER" : activeIsAcq ? "BUYER" : "AGENT 1"}
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
                            Value: ${cardAPrice.toFixed(0)} USDC
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-center min-h-[96px] shadow-2xs space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                          Cash Payment
                        </span>
                        <div className="text-base font-mono font-bold text-slate-900">
                          ${usdcFromA.toFixed(2)} USDC
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Funded from Treasury
                        </span>
                      </div>
                    )}

                    {/* Cash Added Pill (if cards traded AND cash added) */}
                    {usdcFromA > 0 && cardA && (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>Cash Added:</span>
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
                          ? "MARKETPLACE"
                          : activeIsAcq
                          ? "VAULT ACQUIRED"
                          : "AGENT 2"}
                      </span>
                      <span className="font-bold text-sm text-slate-900 truncate max-w-[180px]">
                        {formatVaultName(activeTrade.vault_b_name)}
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
                            Value: ${cardBPrice.toFixed(0)} USDC
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-center min-h-[96px] shadow-2xs space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                          Cash Payment
                        </span>
                        <div className="text-base font-mono font-bold text-slate-900">
                          ${usdcFromB.toFixed(2)} USDC
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Counterparty Treasury
                        </span>
                      </div>
                    )}

                    {/* Cash Added Pill */}
                    {usdcFromB > 0 && cardB && (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>Cash Added:</span>
                        <span>+ ${usdcFromB.toFixed(2)} USDC</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Deal Economics Summary Strip */}
                <div className="px-6 py-2.5 bg-white flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">{activeTrade.vault_a_name || "Agent 1"} Total:</span>
                    <strong className="text-slate-800 font-semibold">
                      ${leftSideTotal.toFixed(2)} USDC
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">{formatVaultName(activeTrade.vault_b_name) || "Agent 2"} Total:</span>
                    <strong className="text-slate-800 font-semibold">
                      ${rightSideTotal.toFixed(2)} USDC
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Cash Included:</span>
                    <strong className="text-slate-800 font-semibold">
                      ${cashDelta.toFixed(2)} USDC
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Platform Fee (0.5%):</span>
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
                    {activeIsSnipe ? "Purchase Summary" : "Agent Conversation"}
                  </div>

                  <button
                    onClick={() => setShowPrivateReasoning(!showPrivateReasoning)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition cursor-pointer font-medium"
                    title="Toggle agent private notes"
                  >
                    {showPrivateReasoning ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hide Agent Notes</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Show Agent Notes</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Transcript List */}
                <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto">
                  {sortedTranscript.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      {activeTrade.isLiveStreaming
                        ? "Connecting to live agent conversation..."
                        : "No recorded dialogue for this trade."}
                    </div>
                  ) : (
                    sortedTranscript.map((item, idx) => {
                      const roundNum = item.round || idx + 1;
                      const speakerName =
                        item.agent ||
                        (roundNum % 2 === 1
                          ? activeTrade.vault_a_name
                          : formatVaultName(activeTrade.vault_b_name)) ||
                        "Agent";
                      const isInitiator =
                        speakerName === activeTrade.vault_a_name || roundNum % 2 === 1;
                      const turn = item.turn || {};
                      const decision =
                        turn.decision ||
                        (item.action === "BUSINESS_ACQUISITION" ? "ACQUIRE" : null);

                      const rawArg =
                        turn.public_argument ||
                        turn.message ||
                        (item.action === "BUSINESS_ACQUISITION"
                          ? `Vault purchase completed on-chain at $${
                              item.salePrice || activeTrade.usdc_from_b
                            } USDC.`
                          : "Offer presented.");

                      const cleanDialogue = rawArg
                        .replace(/\[NEP-413.*?\]/gs, "")
                        .replace(/Intent ID:.*?\n?/g, "")
                        .replace(/^["']|["']$/g, "")
                        .trim();

                      const privateReasoning =
                        turn.private_reasoning_for_owner || turn.internal_reasoning;

                      const decisionBadgeText =
                        decision === "ACCEPT"
                          ? "DEAL AGREED"
                          : decision === "REJECT" || decision === "REJECT_GUARDRAIL"
                          ? "DECLINED"
                          : decision === "ACQUIRE"
                          ? "PURCHASED"
                          : roundNum === 1
                          ? "OPENING OFFER"
                          : "COUNTER-OFFER";

                      const decisionBadgeColor =
                        decision === "ACCEPT" || decision === "ACQUIRE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : decision === "REJECT" || decision === "REJECT_GUARDRAIL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200";

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs transition-all ${
                            isInitiator
                              ? "border-l-4 border-l-[#053b2a]"
                              : "border-l-4 border-l-blue-600"
                          }`}
                        >
                          {/* Top Row of Round Card */}
                          <div className="flex items-center justify-between text-xs gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                Step 0{roundNum}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {speakerName}
                              </span>
                              <span
                                className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                                  isInitiator
                                    ? "bg-[#053b2a]/10 text-[#053b2a]"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {activeIsSnipe
                                  ? isInitiator
                                    ? "BUYER"
                                    : "MARKETPLACE"
                                  : isInitiator
                                  ? "AGENT 1"
                                  : "AGENT 2"}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${decisionBadgeColor}`}
                            >
                              {decisionBadgeText}
                            </span>
                          </div>

                          {/* Public Dialogue */}
                          <p className="text-[13px] text-slate-900 leading-relaxed mt-2.5 font-sans whitespace-pre-line font-medium">
                            {cleanDialogue || "Offer proposed."}
                          </p>

                          {/* Verified NEAR Intent (NEP-413) Cryptographic Proof */}
                          {turn.near_intent && (
                            <div className="mt-2.5 px-3 py-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] font-mono text-emerald-950 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                <span>VERIFIED NEAR INTENT ({turn.near_intent.payload?.standard?.toUpperCase() || "NEP-413"})</span>
                                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                                  {turn.near_intent.solver_status || "FULFILLED"}
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-800 truncate">
                                <strong>Intent ID:</strong> {turn.near_intent.intent_id}
                              </div>
                              {turn.near_intent.payload?.token_diff && (
                                <div className="text-[10px] text-emerald-700 font-mono">
                                  <strong>TokenDiff:</strong> {JSON.stringify(turn.near_intent.payload.token_diff)}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Note to Owner */}
                          {showPrivateReasoning && privateReasoning && (
                            <div className="mt-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-mono text-slate-600 space-y-0.5">
                              <div className="text-[10px] font-bold text-slate-500 tracking-wider">
                                NOTE TO OWNER:
                              </div>
                              <div className="leading-snug text-slate-700 italic">
                                &ldquo;{privateReasoning}&rdquo;
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Live Pulsing Turn Indicator during streaming */}
                  {activeTrade.isLiveStreaming && activeTrade.activeSpeaker && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm flex items-center justify-between gap-3 animate-pulse">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                        <span className="text-xs font-mono font-medium text-slate-200 truncate">
                          <strong className="text-emerald-400 font-bold">{activeTrade.activeSpeaker}</strong> is replying...
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 shrink-0">
                        Live Turn
                      </span>
                    </div>
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
                Recent Activity
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
                onClick={() => setTapeFilter("trades")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tapeFilter === "trades"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                Trades
              </button>
              <button
                onClick={() => setTapeFilter("purchases")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tapeFilter === "purchases"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                Purchases
              </button>
              <button
                onClick={() => setTapeFilter("declined")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tapeFilter === "declined"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "hover:text-slate-900"
                }`}
              >
                Declined
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
                const tIsDirect = isDirectBuy(t);
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
                      {tIsDirect || tIsSnipe ? (
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
                        {tIsDirect ? (
                          <>
                            <span className="text-[10px] font-mono bg-emerald-700 text-white px-1.5 py-0.2 rounded font-semibold">
                              DIRECT BUY
                            </span>
                            <span className="truncate">{t.vault_a_name}</span>
                          </>
                        ) : tIsSnipe ? (
                          <>
                            <span className="text-[10px] font-mono bg-slate-900 text-white px-1.5 py-0.2 rounded font-semibold">
                              PURCHASE
                            </span>
                            <span className="truncate">{t.vault_a_name}</span>
                          </>
                        ) : tIsAcq ? (
                          <>
                            <span className="text-[10px] font-mono bg-purple-900 text-white px-1.5 py-0.2 rounded font-semibold">
                              VAULT PURCHASE
                            </span>
                            <span className="truncate">{formatVaultName(t.vault_b_name)}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.2 rounded font-semibold">
                              TRADE
                            </span>
                            <span className="truncate">
                              {t.vault_a_name} <span className="text-slate-400 font-normal">⇄</span> {formatVaultName(t.vault_b_name)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Middle Line: Card Names */}
                      <div className="text-[11px] text-slate-600 truncate">
                        {tIsDirect || tIsSnipe
                          ? tCardB?.name || "Graded Card"
                          : tIsAcq
                          ? `Vault Acquired (${t.cards_from_a?.length || 0} cards)`
                          : `${tCardA?.name || "Card"} ⇄ ${tCardB?.name || "Card"}`}
                      </div>

                      {/* Dialogue Quote Snippet */}
                      {(() => {
                        const lastLogItem = Array.isArray(t.negotiation_log) && t.negotiation_log.length > 0
                          ? t.negotiation_log[t.negotiation_log.length - 1]
                          : null;
                        const rawArg = lastLogItem?.turn?.public_argument || lastLogItem?.turn?.message || "";
                        const cleanSnippet = rawArg
                          .replace(/\[NEP-413.*?\]/gs, "")
                          .replace(/Intent ID:.*?\n/g, "")
                          .replace(/^["']|["']$/g, "")
                          .trim();
                        if (!cleanSnippet) return null;
                        return (
                          <div className="text-[10.5px] text-slate-500 italic truncate font-sans">
                            &ldquo;{cleanSnippet.slice(0, 80)}{cleanSnippet.length > 80 ? "..." : ""}&rdquo;
                          </div>
                        );
                      })()}

                      {/* Bottom Line: Economics & Rounds */}
                      <div className="font-mono text-[10px] text-slate-500 flex items-center gap-2">
                        {tIsSnipe ? (
                          <span>${tUsdcA.toFixed(0)} USDC Paid</span>
                        ) : tIsAcq ? (
                          <span>${tUsdcB.toFixed(0)} USDC Paid</span>
                        ) : tUsdcA > 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            +${tUsdcA.toFixed(0)} USDC Cash Added
                          </span>
                        ) : (
                          <span>Direct Card Swap</span>
                        )}
                        <span>•</span>
                        <span>{t.rounds_count || 1} {t.rounds_count === 1 ? "Turn" : "Turns"}</span>
                      </div>
                    </div>

                    {/* Right: Status Indicator */}
                    <div className="shrink-0">
                      {tIsDeclined ? (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          DECLINED
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          COMPLETED
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
