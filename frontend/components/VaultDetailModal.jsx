"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  ExternalLink,
  Copy,
  Check,
  ShieldCheck, 
  Bot, 
  ArrowUpRight, 
  Loader2,
  Clock,
  ArrowRightLeft,
  Layers,
  Calendar,
  CheckCircle2
} from "lucide-react";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";

export default function VaultDetailModal({ vault, isOpen, onClose, onOpenChat }) {
  const { trades } = useApp();
  const [activeTab, setActiveTab] = useState("cards"); // "cards" | "history"
  const [copied, setCopied] = useState(false);
  const [withdrawingCardId, setWithdrawingCardId] = useState(null);
  const [withdrawMsg, setWithdrawMsg] = useState("");

  if (!isOpen || !vault) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const svgUrl = `${baseUrl}/vaults/${vault.id}/svg`;

  // Filter all trades where this agent was a counterparty
  const agentTrades = (trades || []).filter(
    (t) => t.vault_a_id === vault.id || t.vault_b_id === vault.id
  );

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

  // Find how each card in this agent's inventory was acquired
  const getCardProvenance = (card) => {
    const cardId = card.card_id || card.id;
    for (const trade of agentTrades) {
      if (trade.vault_a_id === vault.id) {
        // Vault A received cards_from_b
        const match = trade.cards_from_b?.find(
          (c) => c.card_id === cardId || c.id === cardId || c.name === card.name
        );
        if (match) {
          return {
            type: "barter",
            counterpart: trade.vault_b_name,
            date: trade.createdAt,
            block: trade.near_block,
            tx_hash: trade.tx_hash,
          };
        }
      } else if (trade.vault_b_id === vault.id) {
        // Vault B received cards_from_a
        const match = trade.cards_from_a?.find(
          (c) => c.card_id === cardId || c.id === cardId || c.name === card.name
        );
        if (match) {
          return {
            type: "barter",
            counterpart: trade.vault_a_name,
            date: trade.createdAt,
            block: trade.near_block,
            tx_hash: trade.tx_hash,
          };
        }
      }
    }

    return {
      type: "initial",
      date: card.updatedAt || card.createdAt || vault.createdAt,
    };
  };

  const handleWithdrawCard = async (cardId) => {
    setWithdrawingCardId(cardId);
    setWithdrawMsg("");
    try {
      await api.post(`/vaults/${vault.id}/withdraw-card`, {
        card_id: cardId,
        destination_account: vault.owner_account,
      });
      setWithdrawMsg(`Card withdrawn directly to ${vault.owner_account}!`);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to withdraw card");
    } finally {
      setWithdrawingCardId(null);
    }
  };

  const handleCopySubAccount = () => {
    navigator.clipboard.writeText(vault.sub_account || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-[28px] bg-white border border-neutral-200/80 p-6 sm:p-8 shadow-2xl my-8 overflow-hidden text-neutral-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-100 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold font-squada uppercase tracking-wide text-[#053b2a]">
                {vault.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e3fb71]/60 text-[#4d7c0f] border border-[#d2ec5a]/70 font-mono">
                {vault.tier}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <div 
                onClick={handleCopySubAccount}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer hover:text-neutral-900 transition select-none"
                title="Agent Autonomous Execution Account"
              >
                <span className="text-[#053b2a] font-semibold text-[11px] uppercase">Agent Wallet:</span>
                <span className="font-mono text-neutral-800">{vault.sub_account}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-[#053b2a]" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
              </div>

              <span className="text-neutral-300">•</span>

              <div className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="font-semibold text-[11px] uppercase">Owner:</span>
                <span className="font-mono text-[#053b2a] font-medium">{vault.owner_account}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8faf9] hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Living On-Chain NFT SVG & Financial KPI */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-xs text-neutral-500 uppercase font-medium flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#053b2a]" />
              <span>Living On-Chain NFT Card</span>
            </div>

            <div className="relative w-full aspect-[450/640] max-w-[290px] rounded-[24px] overflow-hidden border border-neutral-200 shadow-md bg-[#f8faf9] p-1 group">
              <img
                src={svgUrl}
                alt="Dynamic Vault SVG"
                className="w-full h-full object-contain rounded-[20px]"
              />
              <a
                href={svgUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-xs font-mono text-neutral-800 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Raw SVG
              </a>
            </div>

            {/* Quick Financial Overview */}
            <div className="w-full max-w-[290px] grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/80">
                <div className="text-[11px] text-neutral-500 font-medium">USDC Cash</div>
                <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">
                  ${Number(vault.usdc_balance || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/80">
                <div className="text-[11px] text-neutral-500 font-medium">Settled Trades</div>
                <div className="text-base font-bold text-[#053b2a] font-mono mt-0.5">
                  {vault.total_trades || agentTrades.length} Deals
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Tabs (Cards vs Trade History) */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Segmented Control: Cards vs History */}
              <div className="flex items-center gap-1.5 bg-[#f8faf9] p-1 rounded-full border border-neutral-200/80 w-fit">
                <button
                  onClick={() => setActiveTab("cards")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "cards"
                      ? "bg-[#073525] text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cards Owned ({vault.inventory?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "history"
                      ? "bg-[#073525] text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Trade History ({agentTrades.length})</span>
                </button>
              </div>

              {withdrawMsg && (
                <div className="p-2.5 rounded-2xl bg-[#a8f0be]/30 border border-[#a8f0be] text-[#053b2a] text-xs text-center font-medium animate-in fade-in">
                  {withdrawMsg}
                </div>
              )}

              {/* TAB 1: CARDS OWNED WITH ACQUISITION PROVENANCE */}
              {activeTab === "cards" && (
                <div className="space-y-2.5">
                  <div className="text-xs text-neutral-500 uppercase font-medium flex items-center justify-between">
                    <span>Active Enclosed Inventory</span>
                    <span className="text-neutral-900 font-mono font-medium">
                      ${vault.inventory?.reduce((acc, c) => acc + (c.oracle_fair_value_usdc || 0), 0).toLocaleString()} USDC Total
                    </span>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1">
                    {vault.inventory && vault.inventory.length > 0 ? (
                      vault.inventory.map((card) => {
                        const provenance = getCardProvenance(card);
                        return (
                          <div
                            key={card.id || card.card_id}
                            className="p-3.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 hover:bg-white hover:border-[#a8f0be] transition shadow-sm space-y-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 truncate">
                                <img
                                  src={card.image_url}
                                  alt=""
                                  className="w-9 h-12 object-contain rounded-lg bg-white p-0.5 border border-neutral-200 shrink-0"
                                />
                                <div className="truncate">
                                  <div className="text-xs font-semibold text-neutral-900 truncate max-w-[190px]">
                                    {card.name}
                                  </div>
                                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                    {card.grade || "PSA 10 GEM MT"}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="font-mono text-xs font-bold text-neutral-900">
                                  ${card.oracle_fair_value_usdc} USDC
                                </div>
                                <button
                                  onClick={() => handleWithdrawCard(card.card_id || card.id)}
                                  disabled={withdrawingCardId === (card.card_id || card.id)}
                                  className="mt-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-[10px] text-neutral-700 hover:text-neutral-900 flex items-center gap-1 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                                  title="Withdraw to personal wallet"
                                >
                                  {withdrawingCardId === (card.card_id || card.id) ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <ArrowUpRight className="w-2.5 h-2.5 text-[#053b2a]" />
                                  )}
                                  <span>Withdraw</span>
                                </button>
                              </div>
                            </div>

                            {/* Provenance Footnote: How & When the agent acquired this card */}
                            <div className="pt-2.5 border-t border-neutral-200/80 space-y-1.5 font-mono text-xs">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-neutral-500 font-sans flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#053b2a]" />
                                  <span>Acquired Date:</span>
                                </span>
                                <span className="font-semibold text-neutral-900">
                                  {formatFullDate(provenance.date)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-200/50">
                                <span className="text-neutral-500 font-sans">Method:</span>
                                <span className="text-[#053b2a] font-semibold truncate max-w-[200px]">
                                  {provenance.type === "barter" ? (
                                    `🔁 Swapped with ${provenance.counterpart}`
                                  ) : (
                                    "📥 Deposited to Agent"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-neutral-500 py-10 text-center bg-[#f8faf9] rounded-2xl border border-neutral-200">
                        No cards held in this agent portfolio yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DETAILED TRADE & DEAL HISTORY */}
              {activeTab === "history" && (
                <div className="space-y-2.5">
                  <div className="text-xs text-neutral-500 uppercase font-medium flex items-center justify-between">
                    <span>Autonomous Barter History</span>
                    <span className="text-[#053b2a] font-mono font-medium">
                      {agentTrades.length} Completed
                    </span>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1">
                    {agentTrades.length === 0 ? (
                      <div className="text-xs text-neutral-500 py-12 text-center bg-[#f8faf9] rounded-2xl border border-neutral-200 space-y-1">
                        <p className="font-semibold text-neutral-800">No trades settled yet.</p>
                        <p className="text-[11px] text-neutral-400">
                          This agent will barter automatically on the Trading Floor.
                        </p>
                      </div>
                    ) : (
                      agentTrades.map((trade) => {
                        const isVaultA = trade.vault_a_id === vault.id;
                        const counterpartName = isVaultA ? trade.vault_b_name : trade.vault_a_name;
                        const sentCards = isVaultA ? trade.cards_from_a : trade.cards_from_b;
                        const receivedCards = isVaultA ? trade.cards_from_b : trade.cards_from_a;
                        const sentUsdc = isVaultA ? trade.usdc_from_a : trade.usdc_from_b;
                        const receivedUsdc = isVaultA ? trade.usdc_from_b : trade.usdc_from_a;

                        return (
                          <div
                            key={trade.id || trade.trade_id}
                            className="p-3.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 hover:bg-white hover:border-[#a8f0be] transition shadow-sm space-y-2.5"
                          >
                            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-neutral-200/60">
                              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                <ArrowRightLeft className="w-3.5 h-3.5 text-[#053b2a]" />
                                <span>Deal with {counterpartName}</span>
                              </div>
                              <div className="px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-800 font-mono text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                                <Clock className="w-3 h-3 text-[#053b2a]" />
                                <span>{formatFullDate(trade.createdAt)}</span>
                              </div>
                            </div>

                            {/* Sent & Received Breakdown */}
                            <div className="text-xs font-mono space-y-1 bg-white p-2.5 rounded-xl border border-neutral-200/60">
                              <div className="flex items-center justify-between text-neutral-700">
                                <span className="text-neutral-400 text-[10px] uppercase">Gave:</span>
                                <span className="truncate max-w-[200px] text-right font-medium">
                                  {sentCards?.map((c) => c.name).join(", ") || "None"}
                                  {sentUsdc > 0 ? ` + $${sentUsdc} USDC` : ""}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[#053b2a]">
                                <span className="text-neutral-400 text-[10px] uppercase">Received:</span>
                                <span className="truncate max-w-[200px] text-right font-semibold">
                                  {receivedCards?.map((c) => c.name).join(", ") || "None"}
                                  {receivedUsdc > 0 ? ` + $${receivedUsdc} USDC` : ""}
                                </span>
                              </div>
                            </div>

                            {/* Settlement Footnote with Explorer Link */}
                            <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-200/60 font-mono">
                              <span>NEAR Block #{trade.near_block}</span>
                              <a
                                href={`https://testnet.nearblocks.io/txns/${trade.tx_hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#053b2a] hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>{trade.tx_hash?.substring(0, 10)}...</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Trigger Button */}
            <div className="pt-3">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat(vault);
                }}
                className="w-full py-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-white" />
                <span>Chat with Agent & Review Trades</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
