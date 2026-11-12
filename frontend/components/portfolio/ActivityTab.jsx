"use client";

import { useState, useMemo } from "react";
import { 
  ArrowRightLeft, 
  Calendar, 
  ExternalLink, 
  MessageSquare, 
  ChevronDown, 
  Bot,
  ShoppingBag,
  Target,
  Layers,
  KeyRound,
  FileCheck2,
  ShieldCheck
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ActivityTab() {
  const { trades, vaults, connectedAccount } = useApp();
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "barter" | "snipes" | "direct"

  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const userVaultIds = useMemo(() => {
    return vaults
      .filter((v) => (v.owner_account || "").toLowerCase() === userAccount)
      .map((v) => v.id);
  }, [vaults, userAccount]);

  // Include direct personal wallet purchases in addition to agent vault trades
  const myTrades = useMemo(() => {
    return trades.filter((t) => 
      userVaultIds.includes(t.vault_a_id) || 
      userVaultIds.includes(t.vault_b_id) ||
      (t.vault_a_name || "").toLowerCase() === userAccount ||
      (t.vault_b_name || "").toLowerCase() === userAccount
    );
  }, [trades, userVaultIds, userAccount]);

  // Deal classification helper
  const getDealType = (trade, account) => {
    const tid = String(trade.trade_id || trade.id || "");
    const vAName = (trade.vault_a_name || "").toLowerCase();
    const vBName = (trade.vault_b_name || "").toLowerCase();

    const isDirectBuy = tid.startsWith("direct-") || (vAName === account && vBName.includes("collector crypt"));
    if (isDirectBuy) return "DIRECT_BUY";

    const isVaultAcq = tid.startsWith("acq-") || trade.negotiation_log?.[0]?.action === "BUSINESS_ACQUISITION";
    if (isVaultAcq) return "VAULT_ACQUISITION";

    const isSnipe = tid.startsWith("snipe-") || vBName.includes("collector crypt") || (!trade.cards_from_a?.length && trade.cards_from_b?.length);
    if (isSnipe) return "AGENT_SNIPE";

    return "A2A_BARTER";
  };

  const filteredTrades = useMemo(() => {
    return myTrades.filter((t) => {
      const type = getDealType(t, userAccount);
      if (filter === "barter") return type === "A2A_BARTER";
      if (filter === "snipes") return type === "AGENT_SNIPE";
      if (filter === "direct") return type === "DIRECT_BUY";
      return true;
    });
  }, [myTrades, filter, userAccount]);

  const formatFullDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Recently";
      const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      return `${day} • ${time}`;
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

  const barterCount = useMemo(() => myTrades.filter(t => getDealType(t, userAccount) === "A2A_BARTER").length, [myTrades, userAccount]);
  const snipesCount = useMemo(() => myTrades.filter(t => getDealType(t, userAccount) === "AGENT_SNIPE").length, [myTrades, userAccount]);
  const directCount = useMemo(() => myTrades.filter(t => getDealType(t, userAccount) === "DIRECT_BUY").length, [myTrades, userAccount]);

  return (
    <div className="space-y-6">
      {/* Header Bar with Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-100">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">
            Trade & Purchase History
          </h3>
          <p className="text-xs text-neutral-500 font-poppins mt-0.5">
            Verified agent card trades, marketplace acquisitions, and direct purchases.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-600">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full transition cursor-pointer ${
              filter === "all"
                ? "bg-white text-neutral-900 font-semibold shadow-2xs"
                : "hover:text-neutral-900"
            }`}
          >
            All ({myTrades.length})
          </button>
          <button
            onClick={() => setFilter("barter")}
            className={`px-3 py-1 rounded-full transition cursor-pointer ${
              filter === "barter"
                ? "bg-white text-neutral-900 font-semibold shadow-2xs"
                : "hover:text-neutral-900"
            }`}
          >
            Card Trades ({barterCount})
          </button>
          <button
            onClick={() => setFilter("snipes")}
            className={`px-3 py-1 rounded-full transition cursor-pointer ${
              filter === "snipes"
                ? "bg-white text-neutral-900 font-semibold shadow-2xs"
                : "hover:text-neutral-900"
            }`}
          >
            Market Purchases ({snipesCount})
          </button>
          <button
            onClick={() => setFilter("direct")}
            className={`px-3 py-1 rounded-full transition cursor-pointer ${
              filter === "direct"
                ? "bg-white text-neutral-900 font-semibold shadow-2xs"
                : "hover:text-neutral-900"
            }`}
          >
            Direct Purchases ({directCount})
          </button>
        </div>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#f8faf9] border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-neutral-800">No transactions found for this filter</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {filter === "all"
              ? "Your agents will autonomously negotiate card trades and market purchases according to your active directives."
              : `No deals currently match the selected "${filter}" category.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade) => {
            const tradeKey = trade.id || trade.trade_id;
            const isExpanded = expandedTradeId === tradeKey;
            const dealType = getDealType(trade, userAccount);
            const isDirectBuy = dealType === "DIRECT_BUY";
            const isAgentSnipe = dealType === "AGENT_SNIPE";
            const isVaultAcq = dealType === "VAULT_ACQUISITION";
            const isA2ABarter = dealType === "A2A_BARTER";

            const cardA = Array.isArray(trade.cards_from_a) && trade.cards_from_a.length > 0 ? trade.cards_from_a[0] : null;
            const cardB = Array.isArray(trade.cards_from_b) && trade.cards_from_b.length > 0 ? trade.cards_from_b[0] : null;

            const logRounds = Array.isArray(trade.negotiation_log) ? trade.negotiation_log : [];
            const finalTurn = logRounds.length > 0 ? logRounds[logRounds.length - 1]?.turn : null;

            return (
              <div
                key={tradeKey}
                className="p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#a8f0be] shadow-sm hover:shadow transition space-y-4"
              >
                {/* 1. Header Bar: Badge, Title & Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${
                      isDirectBuy
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : isAgentSnipe
                        ? "bg-slate-900 border-slate-800 text-white"
                        : isVaultAcq
                        ? "bg-purple-50 border-purple-200 text-purple-900"
                        : "bg-[#a8f0be]/30 border-[#053b2a]/20 text-[#053b2a]"
                    }`}>
                      {isDirectBuy ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : isAgentSnipe ? (
                        <Target className="w-4 h-4" />
                      ) : isVaultAcq ? (
                        <KeyRound className="w-4 h-4" />
                      ) : (
                        <ArrowRightLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Title */}
                        <span className="text-sm font-bold text-neutral-900">
                          {isDirectBuy
                            ? `Purchased to Personal Wallet (${trade.vault_a_name})`
                            : isAgentSnipe
                            ? `${trade.vault_a_name} Acquired Slab from Collector Crypt`
                            : isVaultAcq
                            ? `Business-in-a-Box Vault Transfer (${trade.vault_a_name})`
                            : `${trade.vault_a_name} ⇄ ${trade.vault_b_name}`}
                        </span>

                        {/* Badge */}
                        {isDirectBuy ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase tracking-wide">
                            DIRECT PURCHASE
                          </span>
                        ) : isAgentSnipe ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold uppercase tracking-wide">
                            MARKET PURCHASE
                          </span>
                        ) : isVaultAcq ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200 font-bold uppercase tracking-wide">
                            VAULT PURCHASE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#a8f0be]/30 text-[#053b2a] border border-[#053b2a]/20 font-bold uppercase tracking-wide">
                            AGENT CARD TRADE
                          </span>
                        )}
                      </div>

                      {/* Subtitle */}
                      <div className="text-xs text-neutral-500 font-mono">
                        {isDirectBuy
                          ? "Settled via NEAR Wallet & NEP-413 Intent • Brink's / PWCC Custody"
                          : isAgentSnipe
                          ? "Collector Crypt Market Purchase • Physical PWCC / Brink's Custody"
                          : isVaultAcq
                          ? "Zombie Key Wipe Executed • Full Sub-Account & Inventory Transferred"
                          : `${trade.rounds_count || 4}-Round Agent Negotiation • Verified NEAR Intent`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-2.5 py-1 rounded-full bg-[#f8faf9] border border-neutral-200 text-xs font-mono text-neutral-700 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#053b2a]" />
                      <span>{formatFullDate(trade.createdAt)}</span>
                    </div>
                    {trade.near_block && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-neutral-100 border border-neutral-200 text-neutral-600">
                        Block #{trade.near_block}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Visual Asset Strip (Replacing "Outflow" Text Boxes) */}
                {isDirectBuy || isAgentSnipe ? (
                  /* Unified Acquired Slab Strip */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-[#f8faf9] border border-neutral-200/80">
                    {/* Left: Acquired Slab Thumbnail & Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-16 rounded-lg bg-white border border-neutral-200 object-contain p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                        {cardB?.image_url ? (
                          <img
                            src={cardB.image_url}
                            alt={cardB.name || "Physical Slab"}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-neutral-300" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#053b2a]/10 text-[#053b2a]">
                            {getCardGradeBadge(cardB)}
                          </span>
                          {(cardB?.psa_cert_number || cardB?.cert_number || cardB?.certNumber) && (
                            <span className="text-[10px] font-mono text-neutral-400">
                              #{cardB.psa_cert_number || cardB.cert_number || cardB.certNumber}
                            </span>
                          )}
                          <span className="text-[10px] font-mono uppercase text-neutral-400">
                            {cardB?.category || "Pokemon"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-neutral-900 truncate">
                          {cardB?.name || "Physical Pokémon Slab"}
                        </h4>
                        <div className="text-[11px] font-mono text-neutral-500 font-medium">
                          Oracle Value: ${Number(cardB?.oracle_fair_value_usdc || cardB?.oracle_price || trade.usdc_from_a || 50).toFixed(0)} USDC
                        </div>
                      </div>
                    </div>

                    {/* Right: Settlement Price Paid */}
                    <div className="sm:text-right shrink-0 space-y-0.5 sm:border-l sm:border-neutral-200 sm:pl-4">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block">
                        SETTLEMENT PAID
                      </span>
                      <div className="text-sm font-mono font-bold text-neutral-900">
                        ${Number(trade.usdc_from_a || 0).toFixed(2)} USDC
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium font-mono block">
                        Delivered to {isDirectBuy ? "Personal Wallet" : trade.vault_a_name}
                      </span>
                    </div>
                  </div>
                ) : isA2ABarter ? (
                  /* 2-Column Side-by-Side Swap Strip */
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center p-3.5 rounded-xl bg-[#f8faf9] border border-neutral-200/80">
                    {/* Left: Vault A Side */}
                    <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-11 h-15 rounded-lg bg-white border border-neutral-200 object-contain p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                        {cardA?.image_url ? (
                          <img
                            src={cardA.image_url}
                            alt={cardA.name || "Slab"}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <Layers className="w-4 h-4 text-neutral-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#053b2a]/10 text-[#053b2a]">
                            {getCardGradeBadge(cardA)}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 truncate">
                            {trade.vault_a_name} Sent
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-neutral-900 truncate">
                          {cardA?.name || "Direct Cash Offer"}
                        </h5>
                        <div className="text-[11px] font-mono text-neutral-500">
                          Oracle: ${Number(cardA?.oracle_fair_value_usdc || cardA?.oracle_price || 0).toFixed(0)} USDC
                        </div>
                        {Number(trade.usdc_from_a || 0) > 0 && (
                          <div className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                            + ${Number(trade.usdc_from_a).toFixed(2)} USDC Cash Added
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Center Swap Icon */}
                    <div className="md:col-span-1 flex items-center justify-center my-1 md:my-0">
                      <div className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-2xs">
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Right: Vault B Side */}
                    <div className="md:col-span-5 flex items-center gap-3 min-w-0 sm:border-l sm:border-neutral-200 sm:pl-3 md:border-l-0 md:pl-0">
                      <div className="w-11 h-15 rounded-lg bg-white border border-neutral-200 object-contain p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                        {cardB?.image_url ? (
                          <img
                            src={cardB.image_url}
                            alt={cardB.name || "Slab"}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <Layers className="w-4 h-4 text-neutral-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700">
                            {getCardGradeBadge(cardB)}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 truncate">
                            {trade.vault_b_name} Sent
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-neutral-900 truncate">
                          {cardB?.name || "Counterpart Slab"}
                        </h5>
                        <div className="text-[11px] font-mono text-neutral-500">
                          Oracle: ${Number(cardB?.oracle_fair_value_usdc || cardB?.oracle_price || 0).toFixed(0)} USDC
                        </div>
                        {Number(trade.usdc_from_b || 0) > 0 && (
                          <div className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                            + ${Number(trade.usdc_from_b).toFixed(2)} USDC Cash Added
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Vault Acquisition Strip */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/80">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                          TRANSFERRED VAULT
                        </span>
                        <span className="font-bold text-xs text-neutral-900">
                          {trade.vault_a_name}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-600 font-mono">
                        {trade.cards_from_a?.length || 0} Enclosed Physical Slabs Transferred
                      </div>
                      {Array.isArray(trade.cards_from_a) && trade.cards_from_a.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          {trade.cards_from_a.slice(0, 5).map((c, i) => (
                            <div key={i} className="w-7 h-9 rounded bg-white border border-purple-200 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                              {c.image_url ? (
                                <img src={c.image_url} alt={c.name} className="w-full h-full object-contain" />
                              ) : (
                                <Layers className="w-3 h-3 text-purple-300" />
                              )}
                            </div>
                          ))}
                          {trade.cards_from_a.length > 5 && (
                            <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-bold">
                              +{trade.cards_from_a.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0 space-y-0.5 sm:border-l sm:border-purple-200 sm:pl-4">
                      <span className="text-[10px] font-mono uppercase text-purple-600 font-semibold block">
                        ACQUISITION PRICE
                      </span>
                      <div className="text-sm font-mono font-bold text-neutral-900">
                        ${Number(trade.usdc_from_b || trade.usdc_from_a || 0).toLocaleString()} USDC
                      </div>
                      <span className="text-[11px] text-purple-800 font-medium font-mono block">
                        Acquired by {trade.vault_b_name}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Action Footer & Verified Nearblocks Proof */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedTradeId(isExpanded ? null : tradeKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8faf9] hover:bg-neutral-100 text-[#053b2a] text-xs font-semibold border border-neutral-200 transition active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#053b2a]" />
                      <span>
                        {isExpanded
                          ? "Hide Details"
                          : isA2ABarter
                          ? `View Agent Conversation (${logRounds.length || trade.rounds_count || 4} Steps)`
                          : isVaultAcq
                          ? "View Zombie Key Wipe Proof"
                          : "View Purchase Receipt & Intent"}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <span className="text-neutral-400 text-[11px] hidden sm:inline">
                      Protocol Fee: ${Number(trade.protocol_fee_usdc || 0).toFixed(2)} USDC
                    </span>
                  </div>

                  {/* Transaction Proof: Only link real Near hashes (not simulated 0x) */}
                  {trade.tx_hash && !trade.tx_hash.startsWith("0x") ? (
                    <a
                      href={`https://testnet.nearblocks.io/txns/${trade.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold transition"
                    >
                      <span>Verified NEAR Tx: {trade.tx_hash.slice(0, 12)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : trade.tx_hash ? (
                    <span className="text-neutral-500 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full font-mono text-[11px]">
                      Settlement Ref: {trade.tx_hash.slice(0, 14)}...
                    </span>
                  ) : null}
                </div>

                {/* 4. Expandable Details Drawer */}
                {isExpanded && (
                  <div className="pt-3 border-t border-neutral-100 space-y-3 animate-in fade-in duration-200">
                    <div className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-[#053b2a]" />
                      <span>
                        {isA2ABarter
                          ? "Agent Conversation"
                          : isVaultAcq
                          ? "On-Chain Ownership Transfer & Zombie Key Wipe Audit"
                          : "Verified Purchase Receipt & NEAR Intent"}
                      </span>
                    </div>

                    {isA2ABarter ? (
                      logRounds.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic p-3 bg-[#f8faf9] rounded-xl border border-neutral-200">
                          Negotiation settled in atomic memory.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {logRounds.map((turnItem, idx) => {
                            const rawDialog = turnItem.turn?.public_argument || turnItem.turn?.message || "";
                            const cleanDialog = rawDialog
                              .replace(/\[NEP-413.*?\]/gs, "")
                              .replace(/Intent ID:.*?\n?/g, "")
                              .replace(/^["']|["']$/g, "")
                              .trim();

                            return (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-[#f8faf9] border border-neutral-200/80 text-xs font-mono space-y-1.5"
                              >
                                <div className="flex items-center justify-between pb-1 border-b border-neutral-200/50">
                                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-[#073525] text-white text-[10px] flex items-center justify-center font-bold">
                                      {turnItem.round || idx + 1}
                                    </span>
                                    <span>{turnItem.agent || (idx % 2 === 0 ? trade.vault_a_name : trade.vault_b_name)}</span>
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      turnItem.turn?.decision === "ACCEPT"
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                        : "bg-amber-100 text-amber-800 border-amber-300"
                                    }`}
                                  >
                                    {turnItem.turn?.decision === "ACCEPT" ? "DEAL AGREED" : (turnItem.round === 1 ? "OPENING OFFER" : "COUNTER-OFFER")}
                                  </span>
                                </div>

                                <p className="text-neutral-800 leading-relaxed font-sans text-xs">
                                  &ldquo;{cleanDialog || "Offer presented."}&rdquo;
                                </p>

                                {turnItem.turn?.near_intent && (
                                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[10.5px] font-mono text-emerald-950 space-y-0.5">
                                    <div className="flex items-center justify-between font-bold text-emerald-800 uppercase">
                                      <span>Verified NEP-413 TokenDiff Barter Intent</span>
                                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                                        {turnItem.turn.near_intent.solver_status || "FULFILLED"}
                                      </span>
                                    </div>
                                    <div className="text-emerald-800 truncate">
                                      <strong>Intent ID:</strong> {turnItem.turn.near_intent.intent_id}
                                    </div>
                                  </div>
                                )}

                                {turnItem.turn?.private_reasoning_for_owner && (
                                  <div className="pt-1.5 border-t border-neutral-200/60 text-[11px] text-neutral-600 font-sans italic flex items-start gap-1.5 bg-white p-2.5 rounded-lg border border-neutral-100">
                                    <span className="font-semibold text-neutral-800 not-italic shrink-0">
                                      Note to Owner:
                                    </span>
                                    <span>&ldquo;{turnItem.turn.private_reasoning_for_owner}&rdquo;</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      /* Direct Buy / Snipe / Vault Acquisition Receipt Card */
                      <div className="p-4 rounded-xl bg-[#f8faf9] border border-neutral-200/80 text-xs font-mono space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                          <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Atomic On-Chain Settlement Verification</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            COMPLETED
                          </span>
                        </div>

                        <p className="text-neutral-800 leading-relaxed font-sans text-xs">
                          {(() => {
                            const raw = finalTurn?.public_argument || 
                              (isDirectBuy 
                                ? `Direct user purchase executed. Graded card secured in PWCC/Brink's Oregon vault.`
                                : isVaultAcq
                                ? `Zombie Key Wipe & Atomic Ownership Transfer executed. Sub-account access keys successfully revoked.`
                                : `Autonomous agent acquisition executed according to active directives.`);
                            return raw
                              .replace(/\[NEP-413.*?\]/gs, "")
                              .replace(/Intent ID:.*?\n?/g, "")
                              .replace(/^["']|["']$/g, "")
                              .trim();
                          })()}
                        </p>

                        {finalTurn?.near_intent && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[10.5px] font-mono text-emerald-950 space-y-1">
                            <div className="flex items-center justify-between font-bold text-emerald-800 uppercase">
                              <span>VERIFIED NEP-413 CROSS-CHAIN INTENT</span>
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                                {finalTurn.near_intent.solver_status || "FULFILLED"}
                              </span>
                            </div>
                            <div className="text-emerald-800 truncate">
                              <strong>Intent ID:</strong> {finalTurn.near_intent.intent_id}
                            </div>
                            {finalTurn.near_intent.payload?.destination_mpc_address && (
                              <div className="text-emerald-700 truncate">
                                <strong>MPC Vault:</strong> {finalTurn.near_intent.payload.destination_mpc_address}
                              </div>
                            )}
                          </div>
                        )}

                        {finalTurn?.private_reasoning_for_owner && (
                          <div className="pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-600 font-sans italic flex items-start gap-1.5 bg-white p-2.5 rounded-lg border border-neutral-100">
                            <span className="font-semibold text-neutral-800 not-italic shrink-0">
                              Note to Owner:
                            </span>
                            <span>&ldquo;{finalTurn.private_reasoning_for_owner}&rdquo;</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
