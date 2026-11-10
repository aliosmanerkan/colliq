"use client";

import { useState, useMemo } from "react";
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ExternalLink, 
  MessageSquare, 
  ChevronDown, 
  Bot 
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ActivityTab() {
  const { trades, cards, vaults, connectedAccount } = useApp();
  const [expandedTradeId, setExpandedTradeId] = useState(null);

  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const userVaultIds = useMemo(() => {
    return vaults
      .filter((v) => (v.owner_account || "").toLowerCase() === userAccount)
      .map((v) => v.id);
  }, [vaults, userAccount]);

  const myTrades = useMemo(() => {
    return trades.filter((t) => userVaultIds.includes(t.vault_a_id) || userVaultIds.includes(t.vault_b_id));
  }, [trades, userVaultIds]);

  const myCards = useMemo(() => {
    return cards.filter((c) => (c.vault_id && userVaultIds.includes(c.vault_id)) || (c.owner_account || "").toLowerCase() === userAccount);
  }, [cards, userVaultIds, userAccount]);

  const formatFullDate = (dateString) => {
    if (!dateString) return "Nov 10, 2026 • 15:29";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Nov 10, 2026";
      const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      return `${day} • ${time}`;
    } catch {
      return "Nov 10, 2026";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div className="text-sm font-semibold text-neutral-800">
          My Agent Deals & Card Acquisitions
        </div>

        <span className="text-xs font-mono text-neutral-500">
          {myTrades.length} Deals • {myCards.length} Cards Held
        </span>
      </div>

      {myTrades.length === 0 && myCards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-600 bg-white rounded-[28px] border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          No activity recorded yet for your agents.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Section 1: A2A Trades */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-[#053b2a] uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>My Agent Barter Deals ({myTrades.length})</span>
            </div>

            {myTrades.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500 bg-[#f8faf9] rounded-2xl border border-neutral-200">
                No trades settled yet by your agents.
              </div>
            ) : (
              myTrades.map((trade) => {
              const tradeKey = trade.id || trade.trade_id;
              const isExpanded = expandedTradeId === tradeKey;
              const cardA = trade.cards_from_a?.[0]?.name || "Card";
              const cardB = trade.cards_from_b?.[0]?.name || "Card";
              const cashA = trade.usdc_from_a ? ` + $${trade.usdc_from_a} USDC` : "";
              const cashB = trade.usdc_from_b ? ` + $${trade.usdc_from_b} USDC` : "";
              const logRounds = Array.isArray(trade.negotiation_log) ? trade.negotiation_log : [];

              return (
                <div
                  key={tradeKey}
                  className="p-5 rounded-[24px] bg-white border border-neutral-200/80 hover:border-[#a8f0be] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-[#a8f0be]/40 border border-[#043224]/15 flex items-center justify-center shrink-0">
                        <ArrowRightLeft className="w-4 h-4 text-[#053b2a]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">
                          {trade.vault_a_name} ⇄ {trade.vault_b_name}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono">
                          {trade.rounds_count || 4} Dialogue Turns (2 Cycles) • Deal Agreed
                        </div>
                      </div>
                    </div>

                    {/* Prominent Timestamp & Block Badge */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-[#f8faf9] border border-neutral-200 text-xs font-mono text-neutral-700 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#053b2a]" />
                        <span>{formatFullDate(trade.createdAt)}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-neutral-100 border border-neutral-200 text-neutral-600">
                        Block #{trade.near_block || "276,399,192"}
                      </span>
                    </div>
                  </div>

                  {/* Swap Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-[#f8faf9] p-3 rounded-2xl border border-neutral-200/70">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                        {trade.vault_a_name} Transferred:
                      </span>
                      <p className="font-semibold text-neutral-800 truncate" title={`${cardA}${cashA}`}>
                        {cardA}{cashA}
                      </p>
                    </div>
                    <div className="space-y-0.5 sm:border-l sm:border-neutral-200 sm:pl-3">
                      <span className="text-[10px] text-[#053b2a] uppercase font-semibold">
                        {trade.vault_b_name} Transferred:
                      </span>
                      <p className="font-semibold text-[#053b2a] truncate" title={`${cardB}${cashB}`}>
                        {cardB}{cashB}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar: View Agent Dialogue Toggle & NEAR Explorer Link */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedTradeId(isExpanded ? null : tradeKey)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f8faf9] hover:bg-neutral-100 text-[#053b2a] text-xs font-semibold border border-neutral-200/80 transition active:scale-95 cursor-pointer shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#053b2a]" />
                        <span>
                          {isExpanded ? "Hide Agent Dialogue" : `View Agent Dialogue (${logRounds.length || trade.rounds_count || 4} Turns)`}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      <span className="text-neutral-400 text-[11px] hidden sm:inline">
                        Fee: ${trade.protocol_fee_usdc || 0.21} USDC
                      </span>
                    </div>

                    <a
                      href={`https://testnet.nearblocks.io/txns/${trade.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#053b2a] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>TX: {trade.tx_hash?.substring(0, 16)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Expandable Multi-Round Agent Negotiation Transcript */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-neutral-100 space-y-2.5 animate-in fade-in duration-200">
                      <div className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-[#053b2a]" />
                        <span>Autonomous Multi-Turn Barter Dialogue</span>
                      </div>

                      {logRounds.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic p-3 bg-[#f8faf9] rounded-xl border border-neutral-200">
                          Negotiation rounds settled in atomic memory.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {logRounds.map((turnItem, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 text-xs font-mono space-y-1.5 shadow-sm"
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
                                  {turnItem.turn?.decision || "COUNTER"}
                                </span>
                              </div>

                              <p className="text-neutral-800 leading-relaxed font-sans text-xs">
                                "{turnItem.turn?.public_argument}"
                              </p>

                              {turnItem.turn?.private_reasoning_for_owner && (
                                <div className="pt-1.5 border-t border-neutral-200/60 text-[11px] text-neutral-600 font-sans italic flex items-start gap-1.5 bg-white p-2 rounded-xl border border-neutral-100">
                                  <span className="font-semibold text-neutral-800 not-italic shrink-0">
                                    🔒 Private Reasoning:
                                  </span>
                                  <span>{turnItem.turn?.private_reasoning_for_owner}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }))}
          </div>

          {/* Section 2: Recently Acquired Cards */}
          <div className="space-y-3 pt-4">
            <div className="text-xs font-semibold text-[#053b2a] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>My Card Collection Inception & Acquisitions ({myCards.length})</span>
            </div>

            {myCards.map((card) => (
              <div
                key={`acq-${card.id || card.card_id}`}
                className="p-4 sm:p-5 rounded-[24px] bg-white border border-neutral-200/80 hover:border-[#a8f0be] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={card.image_url}
                    alt=""
                    className="w-10 h-14 object-contain rounded-xl bg-[#f4f6f5] p-1 border border-neutral-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900">
                        {card.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        {card.grade || "PSA 10"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 font-poppins">
                      Held by: <strong className="text-neutral-900 font-mono">{card.vault?.name || card.owner_account}</strong> • Brink's Vault Custody
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono space-y-1">
                  <div className="text-sm text-neutral-900 font-bold">
                    ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} USDC
                  </div>
                  {/* Exact Acquisition Date */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8faf9] border border-neutral-200 text-xs text-neutral-700 font-medium">
                    <Clock className="w-3 h-3 text-[#053b2a]" />
                    <span>Acquired: {formatFullDate(card.updatedAt || card.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
