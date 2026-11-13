"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Bot,
  Copy,
  Check,
  Trash2,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Layers,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  DollarSign,
  FileCode,
  Fingerprint
} from "lucide-react";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";

const CLEAN_PROMPTS = [
  { label: "Scan for underpriced slabs", prompt: "Scan the market for underpriced PSA 10 slabs matching our target categories." },
  { label: "Set max spend to $200", prompt: "Set max spend limit to $200 USDC per deal." },
  { label: "Audit balance sheet", prompt: "Audit our vault balance sheet, available treasury, and inventory valuation." },
  { label: "Target Pokémon & One Piece", prompt: "Add rule: Focus on acquiring Pokémon and One Piece PSA 10 grails." }
];

export default function AgentCommandStudioModal({
  vault,
  isOpen,
  onClose,
  initialTab = "directives"
}) {
  const { cards, trades, loadData, connectedAccount } = useApp();
  const [activeTab, setActiveTab] = useState(initialTab); // "directives" | "inventory" | "deals"

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [fetchingChat, setFetchingChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatBottomRef = useRef(null);

  // Directives State
  const [activeRules, setActiveRules] = useState([]);
  const [newRuleText, setNewRuleText] = useState("");
  const [updatingRules, setUpdatingRules] = useState(false);

  // Treasury Management State
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [treasuryLoading, setTreasuryLoading] = useState(false);
  const [treasuryNotice, setTreasuryNotice] = useState(null);

  // Inventory Action State
  const [actionCardId, setActionCardId] = useState(null);
  const [inventoryNotice, setInventoryNotice] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Load chat and rules whenever vault changes or modal opens
  useEffect(() => {
    if (!isOpen || !vault?.id) return;

    setFetchingChat(true);
    setTreasuryNotice(null);
    setInventoryNotice(null);

    api.get(`/vaults/${vault.id}/chat`)
      .then((res) => {
        setMessages(res.data?.chatHistory || []);
        setActiveRules(res.data?.activeRules || []);
      })
      .catch((err) => {
        console.error("Failed to load agent studio chat:", err);
      })
      .finally(() => {
        setFetchingChat(false);
      });
  }, [isOpen, vault?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChat]);

  if (!isOpen || !vault) return null;

  // Filter vault's held cards and trades
  const vaultCards = (cards || []).filter((c) => c.vault_id === vault.id);
  const vaultTrades = (trades || []).filter(
    (t) => t.vault_a_id === vault.id || t.vault_b_id === vault.id
  );

  const handleCopySubAccount = () => {
    navigator.clipboard.writeText(vault.sub_account || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat message submission
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loadingChat) return;

    setInputText("");
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "owner",
      text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoadingChat(true);

    try {
      const res = await api.post(`/vaults/${vault.id}/chat`, { message: text });
      if (Array.isArray(res.data?.chatHistory)) {
        setMessages(res.data.chatHistory);
      } else if (res.data?.reply || res.data?.message) {
        const replyObj = typeof (res.data.reply || res.data.message) === "string"
          ? { id: `msg-${Date.now()}-a`, sender: "agent", text: res.data.reply || res.data.message, timestamp: new Date().toISOString() }
          : (res.data.reply || res.data.message);
        setMessages((prev) => [...prev, replyObj]);
      }
      if (res.data?.activeRules) {
        setActiveRules(res.data.activeRules);
      }
      await loadData();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: "agent",
          text: "I encountered a communication error with our RPC node. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Add rule manually
  const handleAddRule = async () => {
    if (!newRuleText.trim() || updatingRules) return;
    setUpdatingRules(true);

    try {
      const updatedRules = [...activeRules, newRuleText.trim()];
      const res = await api.put(`/vaults/${vault.id}/rules`, { rules: updatedRules });
      setActiveRules(res.data?.rules || updatedRules);
      setNewRuleText("");
      await loadData();
    } catch (err) {
      console.error("Failed to add rule:", err);
    } finally {
      setUpdatingRules(false);
    }
  };

  // Delete rule
  const handleDeleteRule = async (indexToDelete) => {
    if (updatingRules) return;
    setUpdatingRules(true);

    try {
      const updatedRules = activeRules.filter((_, i) => i !== indexToDelete);
      const res = await api.put(`/vaults/${vault.id}/rules`, { rules: updatedRules });
      setActiveRules(res.data?.rules || updatedRules);
      await loadData();
    } catch (err) {
      console.error("Failed to delete rule:", err);
    } finally {
      setUpdatingRules(false);
    }
  };

  // Treasury Deposit
  const handleDepositTreasury = async (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    setTreasuryLoading(true);
    setTreasuryNotice(null);

    try {
      const res = await api.post(`/vaults/${vault.id}/deposit-treasury`, { amount: amt });
      setTreasuryNotice({ type: "success", text: res.data?.message || `Deposited $${amt} USDC!` });
      setDepositAmount("");
      setShowDepositForm(false);
      await loadData();
      // Add system message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-dep-${Date.now()}`,
          sender: "system",
          text: `Treasury deposit confirmed: +$${amt.toLocaleString()} USDC added to active reserves.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setTreasuryNotice({ type: "error", text: err.response?.data?.error || err.message || "Deposit failed" });
    } finally {
      setTreasuryLoading(false);
    }
  };

  // Treasury Withdraw
  const handleWithdrawTreasury = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return;

    setTreasuryLoading(true);
    setTreasuryNotice(null);

    try {
      const res = await api.post(`/vaults/${vault.id}/withdraw-treasury`, {
        amount: amt,
        destination_account: connectedAccount || vault.owner_account
      });
      setTreasuryNotice({ type: "success", text: res.data?.message || `Withdrew $${amt} USDC to personal wallet!` });
      setWithdrawAmount("");
      setShowWithdrawForm(false);
      await loadData();
      // Add system message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-wd-${Date.now()}`,
          sender: "system",
          text: `Treasury withdrawal confirmed: -$${amt.toLocaleString()} USDC withdrawn to owner wallet.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setTreasuryNotice({ type: "error", text: err.response?.data?.error || err.message || "Withdrawal failed" });
    } finally {
      setTreasuryLoading(false);
    }
  };

  // Withdraw Card to Personal Wallet (Instant, Zero Reload!)
  const handleWithdrawCard = async (card) => {
    const cardId = card.id || card.card_id;
    setActionCardId(cardId);
    setInventoryNotice(null);

    try {
      await api.post(`/vaults/${vault.id}/withdraw-card`, {
        card_id: cardId,
        destination_account: connectedAccount || vault.owner_account
      });
      setInventoryNotice({
        type: "success",
        text: `"${card.name}" successfully withdrawn to your personal wallet!`
      });
      await loadData();
    } catch (err) {
      setInventoryNotice({
        type: "error",
        text: err.response?.data?.error || err.message || "Failed to withdraw card."
      });
    } finally {
      setActionCardId(null);
    }
  };

  // Liquidate Card for USDC
  const handleLiquidateCard = async (card) => {
    const cardId = card.id || card.card_id;
    const payout = card.oracle_fair_value_usdc || 50;

    if (!confirm(`Liquidate "${card.name}" for $${payout} USDC instant cash?`)) return;

    setActionCardId(cardId);
    setInventoryNotice(null);

    try {
      await api.post("/market/liquidate-card", { card_id: cardId });
      setInventoryNotice({
        type: "success",
        text: `"${card.name}" liquidated for $${payout} USDC!`
      });
      await loadData();
    } catch (err) {
      setInventoryNotice({
        type: "error",
        text: err.response?.data?.error || err.message || "Liquidation failed."
      });
    } finally {
      setActionCardId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-[28px] bg-white border border-neutral-200 shadow-2xl overflow-hidden text-neutral-900 flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between gap-4 shrink-0 bg-[#fbfdfc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#073525] text-white flex items-center justify-center font-bold text-sm">
              <Bot className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                  {vault.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {vault.tier || "ROOKIE"}
                </span>
                {vault.is_locked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Negotiation Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 mt-0.5 text-xs text-neutral-500 font-mono">
                <button
                  type="button"
                  onClick={handleCopySubAccount}
                  className="hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition"
                  title="Click to copy on-chain account"
                >
                  <span>@{vault.sub_account}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                </button>
                <span className="text-neutral-300">•</span>
                <span>Treasury: <strong className="text-neutral-900">${Number(vault.usdc_balance || 0).toLocaleString()} USDC</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Body: Split Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-neutral-100">
          
          {/* LEFT COLUMN: LIVE AI CO-PILOT CHAT (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col h-[400px] lg:h-auto bg-[#fbfdfc]/60 overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-700">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#073525]" />
                <span>Agent Directives Co-Pilot</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-normal bg-emerald-50 px-2 py-0.5 rounded-full">
                Co-Pilot Online
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth text-xs">
              {fetchingChat && messages.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#073525]" />
                  <span>Connecting to agent memory core...</span>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isOwner = m.sender === "owner" || m.sender === "user";
                  const isSystem = m.sender === "system";

                  if (isSystem) {
                    return (
                      <div key={m.id || idx} className="p-2 rounded-xl bg-neutral-100 border border-neutral-200/80 text-[11px] font-mono text-neutral-700">
                        {m.text}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isOwner ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-2xs ${
                          isOwner
                            ? "bg-[#073525] text-white rounded-br-xs"
                            : "bg-white border border-neutral-200/90 text-neutral-800 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400 mt-1 px-1">
                        {isOwner ? "You" : vault.name}
                      </span>
                    </div>
                  );
                })
              )}
              {loadingChat && (
                <div className="flex items-center gap-2 text-neutral-400 text-xs py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#073525]" />
                  <span>Agent is reasoning on your directive...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Directive Chips (No Emojis) */}
            <div className="p-2.5 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {CLEAN_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p.prompt)}
                  className="px-2.5 py-1 rounded-full bg-[#f8faf9] hover:bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-700 font-medium whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Instruct ${vault.name} (e.g. Set budget limit, search sets)...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-full bg-[#f8faf9] border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#073525] font-sans"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loadingChat}
                className="w-8 h-8 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white flex items-center justify-center transition active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: 3-TAB STUDIO CONTROL PANEL (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col h-[480px] lg:h-auto overflow-hidden bg-white">
            
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-6 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("directives")}
                  className={`py-3.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "directives"
                      ? "border-[#073525] text-[#073525]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Directives & Treasury</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("inventory")}
                  className={`py-3.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "inventory"
                      ? "border-[#073525] text-[#073525]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inventory ({vaultCards.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("deals")}
                  className={`py-3.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "deals"
                      ? "border-[#073525] text-[#073525]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Deal History ({vaultTrades.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("onchain")}
                  className={`py-3.5 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "onchain"
                      ? "border-[#073525] text-[#073525]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>On-Chain NFT</span>
                </button>
              </div>
            </div>

            {/* TAB 1: DIRECTIVES & TREASURY */}
            {activeTab === "directives" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {treasuryNotice && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      treasuryNotice.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border border-rose-200 text-rose-900"
                    }`}
                  >
                    {treasuryNotice.text}
                  </div>
                )}

                {/* Treasury Management Box */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Vault Treasury Reserves
                      </div>
                      <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
                        ${Number(vault.usdc_balance || 0).toLocaleString()} <span className="text-xs font-normal text-neutral-400 font-sans">USDC</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDepositForm(!showDepositForm);
                          setShowWithdrawForm(false);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-1 transition active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <ArrowDownToLine className="w-3 h-3" />
                        <span>Deposit USDC</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowWithdrawForm(!showWithdrawForm);
                          setShowDepositForm(false);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1 transition active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <ArrowUpFromLine className="w-3 h-3" />
                        <span>Withdraw USDC</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Deposit Form */}
                  {showDepositForm && (
                    <form onSubmit={handleDepositTreasury} className="p-3 rounded-xl bg-white border border-neutral-200 space-y-2">
                      <div className="text-xs font-medium text-neutral-700">Deposit USDC from Personal Wallet:</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Amount in USDC (e.g. 250)"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          min="1"
                          step="any"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono focus:outline-none focus:border-[#073525]"
                        />
                        <button
                          type="submit"
                          disabled={treasuryLoading || !depositAmount}
                          className="px-4 py-1.5 rounded-lg bg-[#073525] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                        >
                          {treasuryLoading ? "Depositing..." : "Confirm Deposit"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Inline Withdraw Form */}
                  {showWithdrawForm && (
                    <form onSubmit={handleWithdrawTreasury} className="p-3 rounded-xl bg-white border border-neutral-200 space-y-2">
                      <div className="text-xs font-medium text-neutral-700">Withdraw USDC to Personal Wallet:</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={`Max: $${vault.usdc_balance}`}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          min="1"
                          max={vault.usdc_balance}
                          step="any"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono focus:outline-none focus:border-[#073525]"
                        />
                        <button
                          type="submit"
                          disabled={treasuryLoading || !withdrawAmount}
                          className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                        >
                          {treasuryLoading ? "Withdrawing..." : "Confirm Withdraw"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Strategy & Spending Limits */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    Risk Guardrails & Policy
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#f8faf9] border border-neutral-200/70">
                      <div className="text-[10px] text-neutral-400 uppercase font-sans">Trading Strategy</div>
                      <div className="text-sm font-bold text-neutral-900 mt-0.5">{vault.strategy || "BALANCED_TRADER"}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f8faf9] border border-neutral-200/70">
                      <div className="text-[10px] text-neutral-400 uppercase font-sans">Max Spend Per Deal</div>
                      <div className="text-sm font-bold text-neutral-900 mt-0.5">${vault.guardrail_max_spend_per_trade || 300} USDC</div>
                    </div>
                  </div>
                </div>

                {/* Active Inception Rules */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                      Active Inception Rules ({activeRules.length})
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">Strictly Enforced</span>
                  </div>

                  <div className="space-y-2">
                    {activeRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#f8faf9] border border-neutral-200/80 flex items-center justify-between gap-3 text-xs text-neutral-800"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-neutral-400 font-bold">{idx + 1}.</span>
                          <span className="font-medium">{rule}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(idx)}
                          className="text-neutral-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Remove rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Rule Form */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add directive (e.g. Reject any card with grade < 9.5)..."
                      value={newRuleText}
                      onChange={(e) => setNewRuleText(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#073525]"
                    />
                    <button
                      type="button"
                      onClick={handleAddRule}
                      disabled={!newRuleText.trim() || updatingRules}
                      className="px-3.5 py-2 rounded-xl bg-[#073525] text-white text-xs font-semibold transition active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INVENTORY (CARDS HELD) */}
            {activeTab === "inventory" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {inventoryNotice && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      inventoryNotice.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border border-rose-200 text-rose-900"
                    }`}
                  >
                    {inventoryNotice.text}
                  </div>
                )}

                {vaultCards.length === 0 ? (
                  <div className="py-20 text-center text-xs text-neutral-400 space-y-2">
                    <p className="font-medium text-neutral-700">No slabs currently vaulted by this agent.</p>
                    <p className="text-[11px]">You can snipe cards from Marketplace or deposit existing cards to this vault.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vaultCards.map((card) => {
                      const cardId = card.id || card.card_id;
                      const isActing = actionCardId === cardId;
                      const comp = card.grade?.startsWith("CGC") ? "CGC" : card.grade?.startsWith("BGS") ? "BGS" : "PSA";
                      const cleanGrade = card.grade?.replace(/^(PSA|CGC|BGS)\s*/i, "") || "10";

                      return (
                        <div
                          key={cardId}
                          className="p-3.5 rounded-2xl border border-neutral-200/90 bg-[#fbfdfc] flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-18 rounded-xl bg-white border border-neutral-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                              <img
                                src={card.image_url}
                                alt={card.name}
                                className="w-full h-full object-contain filter drop-shadow-sm"
                              />
                            </div>

                            <div className="truncate flex-1">
                              <div className="flex items-center gap-1.5 mb-1 font-mono text-[10px]">
                                <span className="px-1.5 py-0.5 rounded bg-neutral-100 font-bold text-neutral-800">
                                  {comp} {cleanGrade}
                                </span>
                                <span className="text-neutral-400">#{card.psa_cert_number || "CERT"}</span>
                              </div>

                              <h4 className="text-xs font-semibold text-neutral-900 line-clamp-2" title={card.name}>
                                {card.name}
                              </h4>

                              <div className="text-xs font-mono font-bold text-neutral-900 mt-1">
                                ${Number(card.oracle_fair_value_usdc || 50).toLocaleString()} USDC
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Withdraw & Liquidate (Zero Reload!) */}
                          <div className="pt-2 border-t border-neutral-200/60 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleWithdrawCard(card)}
                              disabled={isActing}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-neutral-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {isActing ? "Withdrawing..." : "Withdraw to Wallet"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleLiquidateCard(card)}
                              disabled={isActing}
                              className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold text-rose-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              Liquidate
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DEAL HISTORY */}
            {activeTab === "deals" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {vaultTrades.length === 0 ? (
                  <div className="py-20 text-center text-xs text-neutral-400 space-y-1">
                    <p className="font-medium text-neutral-700">No settled trades on record yet.</p>
                    <p className="text-[11px]">This agent will execute atomic A2A swaps on the Trading Floor.</p>
                  </div>
                ) : (
                  vaultTrades.map((trade) => {
                    const vB = (trade.vault_b_name || "").toLowerCase();
                    const isMarketSnipe =
                      vB.includes("collector crypt") ||
                      vB.includes("pwcc") ||
                      vB.includes("brink") ||
                      String(trade.trade_id).startsWith("snipe");
                    const cardA = trade.cards_from_a?.[0]?.name || (trade.usdc_from_a ? `$${trade.usdc_from_a} USDC` : "Card");
                    const cardB = trade.cards_from_b?.[0]?.name || "Card";
                    const isInitiator = trade.vault_a_id === vault.id;
                    const rawCounterparty = isInitiator ? trade.vault_b_name : trade.vault_a_name;
                    const counterparty =
                      rawCounterparty?.toLowerCase().includes("collector crypt")
                        ? "PWCC & Brink's Vault"
                        : rawCounterparty;

                    return (
                      <div
                        key={trade.id || trade.trade_id}
                        className="p-4 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-neutral-900 truncate max-w-[240px]">
                            {isMarketSnipe ? `Market Purchase: ${counterparty}` : `Trade with ${counterparty}`}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            isMarketSnipe
                              ? "text-blue-800 bg-blue-50 border-blue-200 font-semibold"
                              : "text-emerald-800 bg-emerald-50 border-emerald-200"
                          }`}>
                            {isMarketSnipe ? "PURCHASED" : (trade.status || "SETTLED")}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200/60 font-mono text-[11px] space-y-1">
                          {isMarketSnipe ? (
                            <>
                              <div className="text-neutral-600 truncate">
                                Paid: <span className="font-medium text-neutral-900">${trade.usdc_from_a} USDC</span>
                              </div>
                              <div className="text-neutral-600 truncate">
                                Acquired Slab: <span className="font-medium text-[#073525]">{cardB}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-neutral-600 truncate">
                                Offered: <span className="font-medium text-neutral-900">{isInitiator ? cardA : cardB}</span>
                              </div>
                              <div className="text-neutral-600 truncate">
                                Received: <span className="font-medium text-neutral-900">{isInitiator ? cardB : cardA}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {trade.tx_hash && (
                          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                            <span>TX: {trade.tx_hash.slice(0, 16)}...</span>
                            <a
                              href={`https://testnet.nearblocks.io/txns/${trade.tx_hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#073525] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>View Explorer</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 4: ON-CHAIN NFT CERTIFICATE */}
            {activeTab === "onchain" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                    Dynamic NEP-171 Bearer Certificate
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Live on-chain SVG vector certificate reflecting real-time AUM, liquid treasury, and Brink's sealed custody state.
                  </p>
                </div>

                {/* High-Res Dynamic SVG Render */}
                <div className="flex justify-center">
                  <div className="relative w-full max-w-[320px] rounded-2xl overflow-hidden shadow-xl border border-[#053b2a]/30 bg-[#021d15]">
                    <img
                      src={`${api.defaults.baseURL || ""}/vaults/${vault.id}/svg`}
                      alt={`${vault.name} On-Chain Certificate`}
                      className="w-full h-auto object-contain block"
                    />
                  </div>
                </div>

                {/* NEP-171 / NEP-177 Dynamic State Metadata Grid */}
                <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 space-y-3 font-mono text-xs">
                  <div className="font-sans font-bold text-xs text-[#053b2a] uppercase tracking-wider flex items-center justify-between">
                    <span>NEP-171 / NEP-177 Dynamic State</span>
                    <span className="text-[10px] text-neutral-500 font-normal">NEAR Protocol Track 10</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200/70">
                      <div className="text-neutral-500 text-[10px]">TOKEN ID</div>
                      <div className="font-bold text-neutral-900 truncate">{vault.vault_id || vault.id}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200/70">
                      <div className="text-neutral-500 text-[10px]">SUB-ACCOUNT</div>
                      <div className="font-bold text-[#053b2a] truncate">{vault.sub_account}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200/70">
                      <div className="text-neutral-500 text-[10px]">SCOPED ED25519 KEY</div>
                      <div className="font-bold text-neutral-800 truncate">{vault.access_key_public || "ed25519:fresh-key"}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200/70">
                      <div className="text-neutral-500 text-[10px]">SOLANA MPC DERIVED VAULT</div>
                      <div className="font-bold text-neutral-800 truncate">SolVault{vault.id * 1337}7x9Q</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200/70 sm:col-span-2 flex items-center justify-between">
                      <div>
                        <div className="text-neutral-500 text-[10px]">MUTEX / LISTING STATUS</div>
                        <div className={`font-bold ${vault.is_listed_for_sale ? "text-amber-600" : (vault.is_locked ? "text-rose-600" : "text-emerald-700")}`}>
                          {vault.is_listed_for_sale
                            ? `LISTED_FOR_SALE ($${vault.sale_price_usdc} USDC)`
                            : (vault.is_locked ? `MUTEX_LOCKED (${vault.lock_reason || "ACTIVE"})` : "ACTIVE (READY_TO_TRADE)")}
                        </div>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${vault.is_listed_for_sale ? "bg-amber-500 animate-pulse" : (vault.is_locked ? "bg-rose-500" : "bg-emerald-500 animate-pulse")}`} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`${api.defaults.baseURL || ""}/vaults/${vault.id}/svg`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <span>Open Raw On-Chain SVG</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
