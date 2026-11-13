"use client";

import { useState } from "react";
import {
  Search,
  Bot,
  Sparkles,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Layers,
  Filter,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Lock
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import AgentNegotiationModal from "./AgentNegotiationModal";
import api from "@/lib/api";

export default function AgentManagedListingsCatalog() {
  const { cards, loadData, connectedAccount } = useApp();
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("ALL"); // "ALL" | "CASH_ONLY" | "BARTER_OK"
  const [negotiatingCard, setNegotiatingCard] = useState(null);
  const [buyNowCard, setBuyNowCard] = useState(null);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [buyNowNotice, setBuyNowNotice] = useState(null);

  // Filter listed cards
  const agentListedCards = (cards || []).filter((c) => c.is_listed_by_agent);

  const filteredCards = agentListedCards.filter((card) => {
    const matchesSearch =
      !search.trim() ||
      card.name?.toLowerCase().includes(search.toLowerCase()) ||
      card.category?.toLowerCase().includes(search.toLowerCase()) ||
      card.grade?.toLowerCase().includes(search.toLowerCase()) ||
      card.vault?.name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (tradeFilter === "CASH_ONLY") {
      return card.allow_barter === false;
    }
    if (tradeFilter === "BARTER_OK") {
      return card.allow_barter === true;
    }

    return true;
  });

  const handleBuyNow = async (card) => {
    const asking = Number(card.asking_price_usdc || card.oracle_fair_value_usdc || 100);
    if (!confirm(`Buy "${card.name}" directly for $${asking.toLocaleString()} USDC from ${card.vault?.name || "Merchant Agent"}?`)) {
      return;
    }

    setIsBuyingNow(true);
    setBuyNowNotice(null);

    try {
      const res = await api.post(`/market/cards/${card.id || card.card_id}/settle-agent-sale`, {
        agreed_price_usdc: asking,
        buyer_account: connectedAccount || "buyer.testnet"
      });

      setBuyNowNotice({
        type: "success",
        text: `Successfully acquired "${card.name}" for $${asking.toLocaleString()} USDC!`
      });
      await loadData();
    } catch (err) {
      console.error("Buy now error:", err);
      setBuyNowNotice({
        type: "error",
        text: err.response?.data?.error || err.message || "Failed to settle instant purchase."
      });
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {buyNowNotice && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            buyNowNotice.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{buyNowNotice.text}</span>
          </div>
          <button
            onClick={() => setBuyNowNotice(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Protocol Architecture Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#073525] to-[#041a12] text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#a8f0be] text-[11px] font-semibold border border-emerald-500/30">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Secondary Merchant Floor</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Agent-Managed Slabs with Secret Reserve Haggling
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Every card here is actively listed by an autonomous NEAR Merchant Agent. Each agent has an asking price, a confidential minimum reserve floor set by its owner, and custom bargaining directives. Haggle in real time or buy now at asking.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-emerald-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{agentListedCards.length} Slabs Available</span>
          </div>
          <span className="text-[11px] text-neutral-400">
            NEP-171 Settlement • Instant Custody
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Pokémon, set, grade, or agent vault..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#073525]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setTradeFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              tradeFilter === "ALL"
                ? "bg-[#073525] text-white shadow-xs"
                : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
            }`}
          >
            All Listings ({agentListedCards.length})
          </button>
          <button
            onClick={() => setTradeFilter("CASH_ONLY")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              tradeFilter === "CASH_ONLY"
                ? "bg-[#073525] text-white shadow-xs"
                : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
            }`}
          >
            Cash Only
          </button>
          <button
            onClick={() => setTradeFilter("BARTER_OK")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              tradeFilter === "BARTER_OK"
                ? "bg-[#073525] text-white shadow-xs"
                : "bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200"
            }`}
          >
            Swaps Considered
          </button>
        </div>
      </div>

      {/* Slabs Grid */}
      {filteredCards.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-200 text-neutral-500 mx-auto flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-neutral-800 text-sm">
            {search ? "No matching agent-listed slabs found" : "No slabs currently listed by agents"}
          </h4>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {search
              ? "Try clearing your search query or switching the barter filter."
              : "Vault owners can instruct their agents to list physical slabs for sale with custom asking prices and secret reserve floors."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCards.map((card) => {
            const cardId = card.id || card.card_id;
            const asking = Number(card.asking_price_usdc || card.oracle_fair_value_usdc || 100);
            const oracleVal = Number(card.oracle_fair_value_usdc || asking);
            const vault = card.vault;
            const comp = card.grade?.startsWith("CGC") ? "CGC" : card.grade?.startsWith("BGS") ? "BGS" : "PSA";
            const cleanGrade = card.grade?.replace(/^(PSA|CGC|BGS)\s*/i, "") || "10";

            return (
              <div
                key={cardId}
                className="group rounded-3xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Slab Visual & Badges */}
                <div className="relative p-5 bg-[#fbfdfc] border-b border-neutral-100 flex items-center justify-center min-h-[240px]">
                  {/* Grade Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg bg-white border border-neutral-200 shadow-xs font-bold text-neutral-900">
                      {comp} {cleanGrade}
                    </span>
                    <span className="text-neutral-400">#{card.psa_cert_number || "CERT"}</span>
                  </div>

                  {/* Cash Only / Swaps Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        card.allow_barter
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {card.allow_barter ? "Swaps Allowed" : "Cash Only"}
                    </span>
                  </div>

                  {/* High Quality Slab Image */}
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="max-h-48 w-auto object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Card Info & Selling Agent */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Selling Agent Pill */}
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-50 border border-neutral-100 text-[11px]">
                      <div className="w-5 h-5 rounded-lg bg-[#073525] text-white flex items-center justify-center shrink-0">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="truncate flex-1">
                        <span className="font-semibold text-neutral-900 block truncate">
                          {vault?.name || "Merchant Agent"}
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    </div>

                    <h3 className="font-bold text-sm text-neutral-900 line-clamp-2 leading-snug" title={card.name}>
                      {card.name}
                    </h3>
                  </div>

                  {/* Pricing Overview */}
                  <div className="pt-2 border-t border-neutral-100 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-neutral-400 block tracking-wider">
                        Asking Price
                      </span>
                      <div className="font-mono font-bold text-lg text-neutral-900">
                        ${asking.toLocaleString()} <span className="text-xs font-normal text-neutral-400">USDC</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-neutral-400 block tracking-wider">
                        Oracle Est.
                      </span>
                      <div className="font-mono text-xs text-neutral-500">
                        ${oracleVal.toLocaleString()} USDC
                      </div>
                    </div>
                  </div>

                  {/* Actions: Negotiate with Agent vs Buy Now */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNegotiatingCard(card)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#073525] hover:bg-[#0b4d37] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Negotiate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBuyNow(card)}
                      disabled={isBuyingNow}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Live Negotiation Modal */}
      {negotiatingCard && (
        <AgentNegotiationModal
          card={negotiatingCard}
          isOpen={Boolean(negotiatingCard)}
          onClose={() => setNegotiatingCard(null)}
          onSettled={() => {
            setNegotiatingCard(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
