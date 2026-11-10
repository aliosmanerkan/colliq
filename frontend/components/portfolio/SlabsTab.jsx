"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Flame, Bot, DollarSign, ArrowRightLeft, Wallet, Check, AlertCircle, X, Calendar, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";

export default function SlabsTab() {
  const { cards, vaults, trades, connectedAccount, loadData, openChat } = useApp();
  const [cardScope, setCardScope] = useState("my"); // "my" | "all"
  const [selectedCardForAssign, setSelectedCardForAssign] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const userVaultIds = useMemo(() => {
    return vaults
      .filter((v) => (v.owner_account || "").toLowerCase() === userAccount)
      .map((v) => v.id);
  }, [vaults, userAccount]);

  const displayedCards = useMemo(() => {
    if (cardScope === "all") return cards;
    return cards.filter((c) => {
      if (c.vault_id && userVaultIds.includes(c.vault_id)) return true;
      if ((c.owner_account || "").toLowerCase() === userAccount) return true;
      return false;
    });
  }, [cards, cardScope, userVaultIds, userAccount]);

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

  const getCardProvenance = (card) => {
    const cardId = card.id || card.card_id;
    for (const trade of (trades || [])) {
      const receivedByA = trade.cards_from_b?.find((c) => c.card_id === cardId || c.id === cardId || c.name === card.name);
      if (receivedByA && trade.vault_a_id === card.vault_id) {
        return { label: `A2A Swap with ${trade.vault_b_name}`, date: trade.createdAt, isSwap: true };
      }
      const receivedByB = trade.cards_from_a?.find((c) => c.card_id === cardId || c.id === cardId || c.name === card.name);
      if (receivedByB && trade.vault_b_id === card.vault_id) {
        return { label: `A2A Swap with ${trade.vault_a_name}`, date: trade.createdAt, isSwap: true };
      }
    }
    return {
      label: card.vault_id ? "Agent Inception" : "Personal Buy",
      date: card.updatedAt || card.createdAt,
      isSwap: false,
    };
  };

  const showNotice = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Assign card to agent
  const handleAssignToAgent = async (cardId, vaultId) => {
    setActionLoading(`assign-${cardId}`);
    try {
      const res = await api.post("/market/assign-to-agent", {
        card_id: cardId,
        target_vault_id: vaultId,
      });
      showNotice(res.data?.message || "Card assigned to agent successfully!");
      setSelectedCardForAssign(null);
      await loadData();
    } catch (err) {
      showNotice(err.message || "Failed to assign card to agent", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Liquidate card for instant USDC cash
  const handleLiquidate = async (card) => {
    const cardId = card.id || card.card_id;
    const payout = card.oracle_fair_value_usdc || 50;
    if (!confirm(`Are you sure you want to liquidate "${card.name}" for $${payout} USDC instant cash?`)) {
      return;
    }

    setActionLoading(`liquidate-${cardId}`);
    try {
      const res = await api.post("/market/liquidate-card", { card_id: cardId });
      showNotice(res.data?.message || `Liquidated for $${payout} USDC!`);
      await loadData();
    } catch (err) {
      showNotice(err.message || "Failed to liquidate card", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Withdraw card from agent to personal custody
  const handleWithdraw = async (card) => {
    const cardId = card.id || card.card_id;
    setActionLoading(`withdraw-${cardId}`);
    try {
      const res = await api.post("/market/withdraw-from-agent", { card_id: cardId });
      showNotice(res.data?.message || "Card withdrawn to personal wallet.");
      await loadData();
    } catch (err) {
      showNotice(err.message || "Failed to withdraw card", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 border ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-neutral-400 hover:text-neutral-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar with Scope Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-neutral-800">
            {cardScope === "my" ? `My Card Collection (${displayedCards.length})` : `All Network Cards (${cards.length})`}
          </div>

          {/* Scope Switcher: My Cards vs All Protocol Cards */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-neutral-200/80 shadow-sm">
            <button
              onClick={() => setCardScope("my")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                cardScope === "my"
                  ? "bg-[#073525] text-white font-semibold shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              My Cards
            </button>
            <button
              onClick={() => setCardScope("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                cardScope === "all"
                  ? "bg-[#073525] text-white font-semibold shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              All Network Cards
            </button>
          </div>
        </div>

        <span className="text-xs font-mono text-[#053b2a] font-semibold">
          Total Valuation: ${displayedCards.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 0), 0).toLocaleString()} USDC
        </span>
      </div>

      {displayedCards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-600 bg-white rounded-[28px] border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-4">
          <p>
            {cardScope === "my" 
              ? `No cards currently held under your account (${userAccount}).` 
              : "No cards in the network yet."}
          </p>
          <Link
            href="/marketplace"
            className="inline-block px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-md"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedCards.map((card) => {
            const cardKey = card.id || card.card_id;
            const isPersonal = !card.vault_id;
            const holdingVault = vaults.find((v) => v.id === card.vault_id);
            const provenance = getCardProvenance(card);

            return (
              <div
                key={cardKey}
                className="group relative rounded-[24px] p-4 bg-white border border-neutral-200/80 hover:border-[#a8f0be] transition-all duration-300 flex flex-col justify-between shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(4,50,36,0.08)] hover:-translate-y-1"
              >
                <div>
                  {/* PSA Grade Header */}
                  <div className="mb-3 px-3 py-1.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-red-600 font-mono">PSA</span>
                    <span className="font-semibold text-neutral-900">{card.grade || "GEM MT 10"}</span>
                    <span className="text-[10px] text-[#053b2a] font-semibold">Brink's Custody</span>
                  </div>

                  {/* Artwork Box */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#f4f6f5] flex items-center justify-center p-3 border border-neutral-200/60 mb-3 group-hover:border-neutral-300 transition">
                    <img
                      src={card.image_url}
                      alt={card.name}
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
                    />

                    {card.rareness_score && (
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 text-[10px] font-semibold text-amber-700 flex items-center gap-1 shadow-sm">
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>Scarcity {card.rareness_score}/100</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Set */}
                  <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 min-h-[36px] group-hover:text-[#053b2a] transition" title={card.name}>
                    {card.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                    <span>{card.category || "TCG"}</span>
                    <span>Cert #{card.psa_cert_number || "Verified"}</span>
                  </div>

                  {/* Holding Status Badge */}
                  <div className="mt-3 p-2.5 rounded-2xl bg-[#f8faf9] border border-neutral-200 text-xs flex items-center justify-between">
                    <span className="text-neutral-500">
                      {isPersonal ? "Custody:" : "Held by Agent:"}
                    </span>
                    <span
                      className={`font-semibold truncate max-w-[130px] font-mono text-xs ${
                        isPersonal ? "text-emerald-700" : "text-[#053b2a]"
                      }`}
                    >
                      {isPersonal ? "Personal Wallet" : holdingVault?.name || card.vault?.name || "Agent"}
                    </span>
                  </div>

                  {/* Oracle Fair Value */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Oracle Fair Value:</span>
                    <span className="text-sm font-semibold text-neutral-900 font-mono">
                      ${Number(card.oracle_fair_value_usdc || 0).toLocaleString()} USDC
                    </span>
                  </div>

                  {/* Prominent Acquisition & Provenance Section */}
                  <div className="mt-3 p-2.5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-sans">
                        <Calendar className="w-3 h-3 text-[#053b2a]" />
                        <span>Acquired:</span>
                      </span>
                      <span className="font-semibold text-neutral-900 text-[11px]">
                        {formatFullDate(provenance.date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60">
                      <span className="text-[10px] text-neutral-500 font-sans">Source:</span>
                      <span
                        className="text-[#053b2a] font-semibold text-[10px] truncate max-w-[140px]"
                        title={provenance.label}
                      >
                        {provenance.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Command Center */}
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                  {isPersonal ? (
                    // Personal card actions: Assign to agent or Liquidate
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedCardForAssign(card)}
                        disabled={actionLoading === `assign-${cardKey}`}
                        className="w-full py-2 px-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-[11px] font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Bot className="w-3 h-3" />
                        <span>Assign Agent</span>
                      </button>

                      <button
                        onClick={() => handleLiquidate(card)}
                        disabled={actionLoading === `liquidate-${cardKey}`}
                        className="w-full py-2 px-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>Liquidate</span>
                      </button>
                    </div>
                  ) : (
                    // Agent-held card actions: Chat & Instruct Agent, Liquidate, or Withdraw
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => holdingVault && openChat(holdingVault)}
                          className="w-full py-2 px-3 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-[11px] font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Chat Agent</span>
                        </button>

                        <button
                          onClick={() => handleLiquidate(card)}
                          disabled={actionLoading === `liquidate-${cardKey}`}
                          className="w-full py-2 px-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span>Liquidate</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleWithdraw(card)}
                        disabled={actionLoading === `withdraw-${cardKey}`}
                        className="w-full py-1.5 text-center text-[10px] text-neutral-500 hover:text-neutral-900 transition underline underline-offset-2 cursor-pointer"
                      >
                        Withdraw card to personal wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign to Agent Modal */}
      {selectedCardForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-neutral-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#053b2a]" />
                <h3 className="font-semibold text-neutral-900 text-sm">Assign Card to AI Agent</h3>
              </div>
              <button
                onClick={() => setSelectedCardForAssign(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200/70">
              <img
                src={selectedCardForAssign.image_url}
                alt={selectedCardForAssign.name}
                className="w-12 h-16 object-contain rounded-lg bg-white p-1 border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-900 truncate">
                  {selectedCardForAssign.name}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Fair Value: ${selectedCardForAssign.oracle_fair_value_usdc} USDC
                </div>
                <div className="text-[10px] text-[#053b2a] font-semibold mt-0.5">
                  PSA {selectedCardForAssign.grade || "10"}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Select an active AI agent. The agent will hold this card in its inventory and automatically barter or trade it on the A2A trading floor according to its strategy.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {vaults.map((vault) => (
                <button
                  key={vault.id}
                  onClick={() => handleAssignToAgent(selectedCardForAssign.id || selectedCardForAssign.card_id, vault.id)}
                  disabled={actionLoading?.startsWith("assign-")}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-[#a8f0be]/20 border border-neutral-200 hover:border-[#a8f0be] text-left transition flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 group-hover:text-[#053b2a]">
                      {vault.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      @{vault.sub_account}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#053b2a] font-mono">
                      ${vault.usdc_balance} USDC
                    </span>
                    <div className="text-[10px] text-neutral-500">
                      {vault.tier}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCardForAssign(null)}
                className="px-5 py-2 rounded-full border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
