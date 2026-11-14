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

  // Sell with Agent Modal State
  const [selectedCardForSell, setSelectedCardForSell] = useState(null);
  const [targetVaultIdForSell, setTargetVaultIdForSell] = useState(null);
  const [askingPriceInput, setAskingPriceInput] = useState("");
  const [minReserveInput, setMinReserveInput] = useState("");
  const [allowBarterInput, setAllowBarterInput] = useState(false);
  const [sellDirectiveInput, setSellDirectiveInput] = useState("");
  const [isSellSubmitting, setIsSellSubmitting] = useState(false);

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

  // Open Sell with Agent Modal
  const handleOpenSellModal = (card) => {
    setSelectedCardForSell(card);
    const fairVal = Math.round(Number(card.oracle_fair_value_usdc || 100));
    setAskingPriceInput(card.asking_price_usdc ? String(card.asking_price_usdc) : String(fairVal));
    setMinReserveInput(card.min_reserve_usdc ? String(card.min_reserve_usdc) : String(Math.round(fairVal * 0.95)));
    setAllowBarterInput(card.allow_barter === true);
    setSellDirectiveInput(
      card.sell_directive ||
      "Defend asking price aggressively; only concede down to secret reserve floor if buyer pushes hard."
    );
    if (card.vault_id) {
      setTargetVaultIdForSell(card.vault_id);
    } else if (userVaults.length > 0) {
      setTargetVaultIdForSell(userVaults[0].id);
    } else {
      setTargetVaultIdForSell(null);
    }
  };

  const handleCloseSellModal = () => {
    setSelectedCardForSell(null);
    setTargetVaultIdForSell(null);
    setAskingPriceInput("");
    setMinReserveInput("");
    setAllowBarterInput(false);
    setSellDirectiveInput("");
    setIsSellSubmitting(false);
  };

  // Submit Agent Sale Listing
  const handleSubmitSellListing = async () => {
    if (!selectedCardForSell) return;
    const cardId = selectedCardForSell.id || selectedCardForSell.card_id;
    const asking = parseFloat(askingPriceInput);
    const reserve = parseFloat(minReserveInput);

    if (isNaN(asking) || asking <= 0) {
      showNotice("Please enter a valid asking price in USDC.", "error");
      return;
    }
    if (isNaN(reserve) || reserve <= 0) {
      showNotice("Please enter a valid secret reserve floor in USDC.", "error");
      return;
    }
    if (reserve > asking) {
      showNotice("Secret reserve floor cannot exceed the asking price.", "error");
      return;
    }

    const effectiveVaultId = selectedCardForSell.vault_id || targetVaultIdForSell;
    if (!effectiveVaultId) {
      showNotice("Please select an Agent Vault to manage this listing.", "error");
      return;
    }

    setIsSellSubmitting(true);
    try {
      // If personal card, assign to the vault first
      if (!selectedCardForSell.vault_id || selectedCardForSell.vault_id !== effectiveVaultId) {
        await api.post("/market/assign-to-agent", {
          card_id: cardId,
          target_vault_id: effectiveVaultId,
        });
      }

      // Activate Agent Listing
      await api.post(`/vaults/${effectiveVaultId}/cards/${cardId}/list-sale`, {
        action: "LIST",
        asking_price_usdc: asking,
        min_reserve_usdc: reserve,
        allow_barter: allowBarterInput,
        sell_directive: sellDirectiveInput.trim() || undefined,
      });

      showNotice(`🎉 Agent listing active! Asking $${asking} USDC (Floor: $${reserve} USDC)`);
      handleCloseSellModal();
      await loadData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || "Failed to activate agent listing", "error");
    } finally {
      setIsSellSubmitting(false);
    }
  };

  // Unlist card from agent marketplace sale
  const handleUnlistListing = async () => {
    if (!selectedCardForSell) return;
    const cardId = selectedCardForSell.id || selectedCardForSell.card_id;
    const vaultId = selectedCardForSell.vault_id || targetVaultIdForSell;
    if (!vaultId) return;

    setIsSellSubmitting(true);
    try {
      await api.post(`/vaults/${vaultId}/cards/${cardId}/list-sale`, {
        action: "UNLIST",
      });
      showNotice("Card delisted from agent marketplace sales.");
      handleCloseSellModal();
      await loadData();
    } catch (err) {
      showNotice(err.response?.data?.error || err.message || "Failed to unlist card", "error");
    } finally {
      setIsSellSubmitting(false);
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

                  {/* Listed by Agent Badge */}
                  {card.is_listed_by_agent && (
                    <div className="mt-2 p-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-[10px] space-y-0.5">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Listed: ${Number(card.asking_price_usdc).toLocaleString()} USDC
                        </span>
                        <span className="px-1 py-0.2 bg-emerald-100 rounded text-[9px] font-mono font-medium">
                          {card.allow_barter ? "Swaps OK" : "Cash"}
                        </span>
                      </div>
                      <div className="text-[9px] text-emerald-700/80 font-mono">
                        Floor: ${Number(card.min_reserve_usdc).toLocaleString()} USDC
                      </div>
                    </div>
                  )}
                </div>

                {/* Sleek Action Footer */}
                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center gap-1.5">
                  {isPersonal ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCardForAssign(card)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Bot className="w-3 h-3 text-neutral-500" />
                      <span>Assign</span>
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

                  {card.is_listed_by_agent ? (
                    <button
                      type="button"
                      onClick={() => handleOpenSellModal(card)}
                      disabled={isActing}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                      title="Agent is selling this slab. Click to manage or unlist."
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Selling (${card.asking_price_usdc})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenSellModal(card)}
                      disabled={isActing}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                      title="Instruct AI Agent to sell this slab on the marketplace"
                    >
                      <Bot className="w-3 h-3 text-emerald-700" />
                      <span>Sell with Agent</span>
                    </button>
                  )}
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

      {/* Sell with Agent Modal */}
      {selectedCardForSell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-neutral-200 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {selectedCardForSell.is_listed_by_agent
                      ? "Manage Autonomous Agent Listing"
                      : "Sell Slab with Autonomous Agent"}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Your AI agent negotiates and defends your secret reserve floor on the marketplace.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseSellModal}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slab Preview Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8faf9] border border-neutral-200">
              <img
                src={selectedCardForSell.image_url}
                alt=""
                className="w-14 h-18 object-contain rounded-xl bg-white p-1 border border-neutral-200 shrink-0"
              />
              <div className="truncate flex-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                  {selectedCardForSell.category} • {selectedCardForSell.grade || "PSA 10"}
                </div>
                <h4 className="text-xs font-bold text-neutral-900 truncate" title={selectedCardForSell.name}>
                  {selectedCardForSell.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-[#073525]">
                    Oracle Fair Value: ${Number(selectedCardForSell.oracle_fair_value_usdc || 50).toLocaleString()} USDC
                  </span>
                  {selectedCardForSell.is_listed_by_agent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold font-mono">
                      Active on Marketplace
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Managing Agent Selection (if card is personal or reassigning) */}
            <div>
              <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-1">
                Managing AI Agent:
              </label>
              {selectedCardForSell.vault_id ? (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      {userVaults.find((v) => v.id === selectedCardForSell.vault_id)?.name || "Agent Vault"}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      @{userVaults.find((v) => v.id === selectedCardForSell.vault_id)?.sub_account || "agent.colliq.testnet"}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    Holding Vault
                  </span>
                </div>
              ) : userVaults.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  You need an active AI Agent to manage card sales. Please deploy an agent in the "My AI Agents" tab first.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {userVaults.map((vault) => {
                    const isSelected = targetVaultIdForSell === vault.id;
                    return (
                      <button
                        key={vault.id}
                        type="button"
                        onClick={() => setTargetVaultIdForSell(vault.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500"
                            : "bg-white border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-neutral-900">{vault.name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            @{vault.sub_account} • ${vault.usdc_balance} USDC Treasury
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pricing Directives Form */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Public Asking Price ($ USDC)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">$</span>
                    <input
                      type="number"
                      value={askingPriceInput}
                      onChange={(e) => setAskingPriceInput(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full pl-6 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">Price displayed on marketplace.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1 flex items-center gap-1">
                    <span>Secret Reserve Floor ($)</span>
                    <span className="text-[9px] font-normal text-amber-700 bg-amber-50 px-1 rounded border border-amber-200 font-mono">SECRET</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">$</span>
                    <input
                      type="number"
                      value={minReserveInput}
                      onChange={(e) => setMinReserveInput(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full pl-6 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">Agent NEVER concedes below this floor.</span>
                </div>
              </div>

              {/* Barter Offers Toggle */}
              <div 
                className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between cursor-pointer" 
                onClick={() => setAllowBarterInput(!allowBarterInput)}
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900">Allow Card Swap / Barter Offers</div>
                  <div className="text-[10px] text-neutral-500">
                    {allowBarterInput
                      ? "Agent evaluates physical slab swaps with cash differences."
                      : "Strictly cash-only. Agent automatically rejects card swap offers."}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowBarterInput}
                  onChange={(e) => setAllowBarterInput(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Agent Bargaining Directive */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Custom Bargaining Directives for Agent:
                </label>
                <textarea
                  rows={2}
                  value={sellDirectiveInput}
                  onChange={(e) => setSellDirectiveInput(e.target.value)}
                  placeholder="e.g. Defend the asking price vigorously; only concede down toward secret reserve if buyer pushes hard."
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedCardForSell.is_listed_by_agent && (
                  <button
                    type="button"
                    onClick={handleUnlistListing}
                    disabled={isSellSubmitting}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSellSubmitting ? "Unlisting..." : "Unlist from Marketplace"}
                  </button>
                )}

                {/* Instant Liquidation Alternative */}
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCardForSell;
                    handleCloseSellModal();
                    handleLiquidate(c);
                  }}
                  className="text-[10px] text-neutral-400 hover:text-rose-600 transition underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Instant Liquidation
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseSellModal}
                  className="py-2 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitSellListing}
                  disabled={isSellSubmitting || (!selectedCardForSell.vault_id && !targetVaultIdForSell)}
                  className="py-2 px-5 rounded-xl bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>
                    {isSellSubmitting
                      ? "Activating..."
                      : selectedCardForSell.is_listed_by_agent
                      ? "Update Agent Listing"
                      : "Activate Agent Listing"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
