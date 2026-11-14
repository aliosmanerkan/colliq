"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Bot, 
  Wallet, 
  Check, 
  AlertCircle, 
  X, 
  ArrowRight, 
  ArrowDownToLine, 
  DollarSign, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";

export default function SlabsTab() {
  const { cards, vaults, connectedAccount, loadData, openChat } = useApp();
  const [filterMode, setFilterMode] = useState("all"); // "all" | "personal" | "agents"
  const [selectedCardForAssign, setSelectedCardForAssign] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  const currentAccount = (connectedAccount || "").toLowerCase().trim();
  const activeUserAccounts = useMemo(() => {
    const list = [];
    if (currentAccount) list.push(currentAccount);
    list.push("asklepion.testnet");
    list.push("alierkan.testnet");
    return Array.from(new Set(list));
  }, [currentAccount]);

  const userVaults = useMemo(() => {
    return vaults.filter((v) => activeUserAccounts.includes((v.owner_account || "").toLowerCase()));
  }, [vaults, activeUserAccounts]);

  const userVaultIds = useMemo(() => {
    return userVaults.map((v) => v.id);
  }, [userVaults]);

  const allMyCards = useMemo(() => {
    return cards.filter((c) => {
      if (c.vault_id && userVaultIds.includes(c.vault_id)) return true;
      if (activeUserAccounts.includes((c.owner_account || "").toLowerCase())) return true;
      return false;
    });
  }, [cards, userVaultIds, activeUserAccounts]);

  const personalCards = useMemo(() => {
    return allMyCards.filter((c) => !c.vault_id);
  }, [allMyCards]);

  const agentCards = useMemo(() => {
    return allMyCards.filter((c) => Boolean(c.vault_id));
  }, [allMyCards]);

  const filteredCards = useMemo(() => {
    if (filterMode === "personal") return personalCards;
    if (filterMode === "agents") return agentCards;
    return allMyCards;
  }, [filterMode, allMyCards, personalCards, agentCards]);

  const totalValuation = useMemo(() => {
    return filteredCards.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 50), 0);
  }, [filteredCards]);

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

  // Withdraw card from agent to personal wallet (instant, zero page reload)
  const handleWithdraw = async (card) => {
    const cardId = card.id || card.card_id;
    setActionLoading(`withdraw-${cardId}`);
    try {
      const res = await api.post("/market/withdraw-from-agent", {
        card_id: cardId,
        user_account: userAccount,
      });
      showNotice(res.data?.message || "Card withdrawn to personal wallet.");
      await loadData();
    } catch (err) {
      showNotice(err.message || "Failed to withdraw card", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle protected hold status (protect from autonomous A2A barter)
  const handleToggleHold = async (card) => {
    const cardId = card.id || card.card_id;
    setActionLoading(`hold-${cardId}`);
    try {
      const res = await api.post(`/vaults/cards/${cardId}/toggle-hold`);
      showNotice(res.data?.message || "Hold status updated.");
      await loadData();
    } catch (err) {
      showNotice(err.message || "Failed to update hold status", "error");
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in duration-200 border ${
            notification.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
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
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-neutral-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Bar & Custody Breakdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
        {/* Custody Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100/80 border border-neutral-200/80 w-fit">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              filterMode === "all"
                ? "bg-white text-neutral-900 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            All Slabs ({allMyCards.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("personal")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterMode === "personal"
                ? "bg-white text-neutral-900 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Wallet className="w-3 h-3 text-emerald-600" />
            <span>Personal Wallet ({personalCards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("agents")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterMode === "agents"
                ? "bg-white text-neutral-900 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Bot className="w-3 h-3 text-[#073525]" />
            <span>Held by Agents ({agentCards.length})</span>
          </button>
        </div>

        {/* Valuation Tag */}
        <div className="text-xs font-mono text-neutral-500">
          Valuation: <strong className="text-neutral-900 font-bold">${totalValuation.toLocaleString()} USDC</strong>
        </div>
      </div>

      {/* Slabs Grid */}
      {filteredCards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-500 bg-white rounded-[24px] border border-neutral-200/80 space-y-3">
          <p className="font-medium text-neutral-800">
            {filterMode === "personal"
              ? "No slabs currently in your personal wallet."
              : filterMode === "agents"
              ? "No slabs currently allocated to your AI agents."
              : "No slabs held in your portfolio yet."}
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition shadow-xs"
          >
            <span>Acquire Verified Slabs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredCards.map((card) => {
            const cardKey = card.id || card.card_id;
            const isPersonal = !card.vault_id;
            const holdingVault = userVaults.find((v) => v.id === card.vault_id) || card.vault;
            const isActing = actionLoading === `withdraw-${cardKey}` || actionLoading === `liquidate-${cardKey}`;

            const comp = card.gradingCompany || (card.grade?.startsWith("CGC") ? "CGC" : card.grade?.startsWith("BGS") ? "BGS" : "PSA");
            const cleanGrade = card.grade?.replace(/^(PSA|CGC|BGS|SGC)\s*/i, "") || "10";
            const compColor = comp === "CGC" ? "text-blue-700 bg-blue-50 border-blue-200" : comp === "BGS" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";

            return (
              <div
                key={cardKey}
                className="group relative rounded-2xl p-3 bg-white border border-neutral-200/80 hover:border-emerald-600 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  {/* Slab Canvas */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#fbfdfc] flex items-center justify-center p-2 border border-neutral-100 group-hover:border-neutral-200 transition mb-2.5">
                    {/* Top Left: Grader & Grade */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${compColor}`}>
                        {comp} {cleanGrade}
                      </span>
                    </div>

                    {/* Top Right: Custody Badge & Hold Status */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                      {!isPersonal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleHold(card);
                          }}
                          disabled={actionLoading === `hold-${cardKey}`}
                          title={card.is_hold ? "Protected Hold slab. Not offered in A2A barter. Click to unprotect." : "Click to protect slab from A2A barter."}
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border transition cursor-pointer ${
                            card.is_hold
                              ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs"
                              : "bg-white/90 text-neutral-500 border-neutral-200 hover:text-neutral-900"
                          }`}
                        >
                          {card.is_hold ? "HOLD" : "OPEN"}
                        </button>
                      )}
                      {isPersonal ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Personal
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#073525] text-white">
                          @{holdingVault?.name || "Agent"}
                        </span>
                      )}
                    </div>

                    <img
                      src={card.image_url}
                      alt={card.name}
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mb-1">
                    {card.category || "TCG"} {card.psa_cert_number ? `• #${card.psa_cert_number}` : ""}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xs font-medium text-neutral-900 line-clamp-2 min-h-[32px] group-hover:text-[#073525] transition leading-snug"
                    title={card.name}
                  >
                    {card.name}
                  </h3>

                  {/* Valuation */}
                  <div className="mt-2 text-xs font-mono font-bold text-neutral-900">
                    ${Number(card.oracle_fair_value_usdc || 50).toLocaleString()} <span className="text-[10px] font-normal text-neutral-400 font-sans">USDC</span>
                  </div>
                </div>

                {/* Sleek Action Footer */}
                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center gap-1.5">
                  {isPersonal ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCardForAssign(card)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#073525] hover:bg-[#0a4531] text-white text-[11px] font-semibold transition active:scale-95 shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Bot className="w-3 h-3" />
                      <span>Assign to Agent</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleWithdraw(card)}
                      disabled={isActing}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isActing ? "Withdrawing..." : "Withdraw"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleLiquidate(card)}
                    disabled={isActing}
                    className="py-1.5 px-2 rounded-lg bg-neutral-50 hover:bg-rose-50 border border-neutral-200 text-neutral-600 hover:text-rose-700 text-[11px] font-medium transition cursor-pointer"
                    title="Instant liquidation for USDC"
                  >
                    Liquidate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign to Agent Modal */}
      {selectedCardForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[28px] bg-white border border-neutral-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Assign Slab to Agent Vault</h3>
              <button
                type="button"
                onClick={() => setSelectedCardForAssign(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8faf9] border border-neutral-200">
              <img
                src={selectedCardForAssign.image_url}
                alt=""
                className="w-12 h-16 object-contain rounded-lg bg-white p-1 border border-neutral-200 shrink-0"
              />
              <div className="truncate">
                <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                  {selectedCardForAssign.category} • {selectedCardForAssign.grade || "PSA 10"}
                </div>
                <h4 className="text-xs font-bold text-neutral-900 truncate" title={selectedCardForAssign.name}>
                  {selectedCardForAssign.name}
                </h4>
                <div className="text-xs font-mono font-semibold text-[#073525] mt-0.5">
                  ${selectedCardForAssign.oracle_fair_value_usdc || 50} USDC
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                Select Destination Agent Vault:
              </label>

              {userVaults.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  You have not deployed any AI agents yet. Please deploy an agent first.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {userVaults.map((vault) => (
                    <button
                      key={vault.id}
                      type="button"
                      onClick={() => handleAssignToAgent(selectedCardForAssign.id || selectedCardForAssign.card_id, vault.id)}
                      disabled={actionLoading === `assign-${selectedCardForAssign.id || selectedCardForAssign.card_id}`}
                      className="w-full p-3 rounded-xl border border-neutral-200 hover:border-[#073525] hover:bg-[#f8faf9] transition text-left flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-bold text-neutral-900 group-hover:text-[#073525]">
                          {vault.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          @{vault.sub_account} • ${vault.usdc_balance} USDC
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#073525]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
