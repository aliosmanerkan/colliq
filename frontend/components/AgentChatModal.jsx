"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  SlidersHorizontal, 
  Trash2, 
  ArrowRight, 
  Loader2,
  Plus,
  Coins,
  Lock,
  Layers,
  Terminal,
  MessageSquare
} from "lucide-react";
import api from "@/lib/api";

const QUICK_PROMPTS = [
  { label: "🔍 Find Charizard slabs", prompt: "Scan the market for underpriced Charizard slabs" },
  { label: "💰 Max $250 per card", prompt: "Set max spend limit to $250 USDC per deal" },
  { label: "📊 Portfolio audit", prompt: "Audit our vault balance sheet, treasury, and inventory" },
  { label: "💎 Target PSA 10 only", prompt: "Add rule: Only buy PSA 10 and Pristine condition slabs" }
];

export default function AgentChatModal({ vault, isOpen, onClose, onRulesUpdated }) {
  const [messages, setMessages] = useState([]);
  const [activeRules, setActiveRules] = useState([]);
  const [inputText, setInputText] = useState("");
  const [manualRuleText, setManualRuleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "rules"

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = async () => {
    if (!vault?.id) return;
    setFetching(true);
    try {
      const res = await api.get(`/vaults/${vault.id}/chat`);
      setMessages(res.data?.chatHistory || []);
      setActiveRules(res.data?.activeRules || []);
    } catch (err) {
      console.error("Failed to load agent chat:", err);
    } finally {
      setFetching(false);
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    if (isOpen && vault) {
      fetchChat();
      setMobileTab("chat");
    }
  }, [isOpen, vault]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading || !vault) return;

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await api.post(`/vaults/${vault.id}/chat`, {
        message: text,
        user_account: vault.owner_account || "alierkan.testnet"
      });

      if (res.data?.chatHistory) {
        setMessages(res.data.chatHistory);
      }
      if (res.data?.activeRules) {
        setActiveRules(res.data.activeRules);
      }

      if (onRulesUpdated) onRulesUpdated();
    } catch (err) {
      console.error("Agent communication error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "agent",
          text: `Neural gateway error: ${err.message || "Failed to reach agent brain."}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualRule = async (e) => {
    e.preventDefault();
    const text = manualRuleText.trim();
    if (!text) return;
    setManualRuleText("");
    await handleSendMessage(`Add operating rule: ${text}`);
  };

  const handleDeleteRule = async (ruleToDelete) => {
    if (!vault) return;
    try {
      const res = await api.delete(`/vaults/${vault.id}/rules`, {
        data: { rule: ruleToDelete }
      });
      setActiveRules(res.data?.activeRules || []);
      setMessages((prev) => [
        ...prev,
        {
          id: `rule-del-${Date.now()}`,
          sender: "agent",
          text: `Rule removed: "${ruleToDelete}". Updated trading instructions.`,
          timestamp: new Date().toISOString()
        }
      ]);
      if (onRulesUpdated) onRulesUpdated();
    } catch (err) {
      console.error("Rule deletion error:", err);
    }
  };

  const handleCopySubAccount = (e) => {
    e.stopPropagation();
    if (!vault?.sub_account) return;
    navigator.clipboard.writeText(vault.sub_account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !vault) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Studio Split-View Window */}
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[86vh] rounded-[28px] bg-white border border-neutral-200/80 shadow-2xl flex flex-col overflow-hidden text-neutral-900 font-sans antialiased">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-[#f8faf9] flex items-center justify-between shrink-0 select-none">
          
          {/* Left: Agent Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-2xl bg-[#a8f0be]/30 border border-[#a8f0be] flex items-center justify-center text-[#053b2a] shadow-sm">
              <Bot className="w-5 h-5 text-[#053b2a]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#053b2a] border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-squada uppercase tracking-wide text-[#053b2a]">
                  {vault.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e3fb71]/60 border border-[#d2ec5a]/70 text-[10px] font-mono text-[#4d7c0f] font-semibold">
                  {vault.strategy || "BALANCED_TRADER"}
                </span>
              </div>

              <div 
                onClick={handleCopySubAccount}
                className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-900 cursor-pointer transition select-none mt-0.5"
                title="Click to copy on-chain sub-account"
              >
                <span>{vault.sub_account}</span>
                {copied ? <Check className="w-3 h-3 text-[#053b2a]" /> : <Copy className="w-3 h-3 text-neutral-400" />}
              </div>
            </div>
          </div>

          {/* Right: Mobile Switcher, Treasury & Close */}
          <div className="flex items-center gap-3">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden items-center bg-[#f8faf9] p-1 rounded-full border border-neutral-200 text-xs">
              <button
                onClick={() => setMobileTab("chat")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  mobileTab === "chat" ? "bg-[#073525] text-white font-semibold shadow-sm" : "text-neutral-600"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMobileTab("rules")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                  mobileTab === "rules" ? "bg-[#073525] text-white font-semibold shadow-sm" : "text-neutral-600"
                }`}
              >
                <span>Rules</span>
                <span className="w-4 h-4 rounded-full bg-[#a8f0be]/50 text-[#053b2a] text-[10px] flex items-center justify-center font-mono">
                  {activeRules.length}
                </span>
              </button>
            </div>

            {/* Desktop Treasury Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200/80 text-xs font-mono shadow-sm">
              <span className="text-neutral-500">Treasury:</span>
              <span className="font-semibold text-[#053b2a]">${Number(vault.usdc_balance || 0).toLocaleString()} USDC</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition active:scale-95 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Studio Split-View Body (12 Columns: 7 Chat, 5 Directives) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean Chat Stream (7 Cols / ~58%)           */}
          {/* ======================================================== */}
          <div className={`lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-100 bg-white overflow-hidden ${
            mobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}>
            
            {/* Stream Status Bar */}
            <div className="px-6 py-2.5 bg-[#fbfdfc] border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#053b2a] animate-pulse" />
                <span className="text-neutral-700 font-medium">Autonomous Trading Partner</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                Max Budget: ${vault.guardrail_max_spend_per_trade || 350} per card
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 text-sm font-sans bg-white">
              {fetching ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-neutral-500 gap-2.5 animate-pulse font-mono">
                  <Loader2 className="w-5 h-5 animate-spin text-[#053b2a]" />
                  <span>Connecting to agent memory & active rules...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f8faf9] border border-neutral-200 flex items-center justify-center text-neutral-400 mx-auto shadow-sm">
                    <Bot className="w-6 h-6 text-[#053b2a]" />
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900">How should I trade for you?</h4>
                  <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                    Talk naturally. Tell me which cards or PSA grades to target, set maximum prices, or ask me to scan for undervalued slabs.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === "user";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1 animate-in fade-in duration-150`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? "bg-[#073525] text-white font-medium rounded-tr-sm shadow-sm"
                            : "bg-[#f8faf9] border border-neutral-200/80 text-neutral-800 rounded-tl-sm shadow-sm whitespace-pre-wrap"
                        }`}
                      >
                        {/* Inline Rule Confirmation Badge */}
                        {msg.ruleApplied && (
                          <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#a8f0be]/40 border border-[#a8f0be] text-[#053b2a] text-[10px] font-mono">
                            <ShieldCheck className="w-3 h-3 text-[#053b2a]" />
                            <span>Rule Activated: {msg.ruleApplied}</span>
                          </div>
                        )}

                        <div>{msg.text}</div>
                      </div>

                      <span className="text-[10px] text-neutral-400 px-1 font-mono">
                        {isUser ? "You" : vault.name}
                      </span>
                    </div>
                  );
                })
              )}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 p-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#053b2a]" />
                  <span>{vault.name} is checking market data & updating strategy...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Pills */}
            <div className="px-5 py-2.5 bg-[#fbfdfc] border-t border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider shrink-0">
                Suggested:
              </span>
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={loading}
                  className="shrink-0 px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-700 hover:text-neutral-900 transition active:scale-95 disabled:opacity-40 shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-neutral-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Tell ${vault.name} what to do (e.g. 'Target PSA 10 Pikachu', 'Never pay more than $200')...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  className="w-full pl-4 pr-24 py-3 rounded-full bg-[#f8faf9] border border-neutral-200 focus:border-[#a8f0be] text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none transition shadow-sm"
                />

                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="absolute right-1.5 px-4 py-1.5 rounded-full bg-[#073525] hover:bg-[#0a4531] disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Dedicated Trading Rules & Safety Controls  */}
          {/* ======================================================== */}
          <div className={`lg:col-span-5 flex flex-col bg-[#fbfdfc] p-5 sm:p-6 overflow-y-auto justify-between space-y-5 ${
            mobileTab === "rules" ? "flex" : "hidden lg:flex"
          }`}>
            
            <div className="space-y-5">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#053b2a]" />
                    <span>Trading Rules & Safety</span>
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Rules your agent must strictly follow when buying or bidding
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#a8f0be]/40 border border-[#a8f0be] text-[#053b2a] font-semibold">
                    {activeRules.length} Active
                  </span>
                  {activeRules.length > 0 && (
                    <button
                      onClick={() => handleDeleteRule("ALL")}
                      className="text-[11px] text-neutral-500 hover:text-rose-600 font-mono transition"
                      title="Remove all custom rules"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Financial & Safety Overview Card */}
              <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 space-y-3 text-xs shadow-sm">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-neutral-100">
                  <span>Safety Controls</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Real-time parameters</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 font-medium">Available Cash (USDC)</span>
                      <span className="font-mono font-semibold text-neutral-900">${Number(vault.usdc_balance || 0).toLocaleString()} USDC</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Funds your agent can deploy for trades</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 font-medium">Max Spend per Card</span>
                      <span className="font-mono font-semibold text-[#053b2a]">${vault.guardrail_max_spend_per_trade || 350} USDC</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Agent will never exceed this price for a single card</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 font-medium">Fair Value Floor</span>
                      <span className="font-mono font-semibold text-[#053b2a]">At or below {vault.guardrail_min_oracle_fair_value_pct || 80}%</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Requires at least a {100 - (vault.guardrail_min_oracle_fair_value_pct || 80)}% discount to market appraisal</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 font-medium">Cards Owned</span>
                      <span className="font-mono font-semibold text-neutral-900">{vault.inventoryCount || 0} Slabs</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Physical PSA slabs securely held in vault</p>
                  </div>
                </div>
              </div>

              {/* Quick Add Rule Form */}
              <form onSubmit={handleAddManualRule} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-700 block">
                    Add a Custom Rule
                  </label>
                  <span className="text-[10px] text-neutral-400">or ask in chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Only buy PSA 10 Pikachu, Focus on vintage..."
                    value={manualRuleText}
                    onChange={(e) => setManualRuleText(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#a8f0be] transition font-sans shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!manualRuleText.trim() || loading}
                    className="px-3.5 py-2 rounded-xl bg-[#073525] hover:bg-[#0a4531] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition active:scale-95 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>
              </form>

              {/* Active Rules List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-700">Active Trading Rules</span>
                  <span className="text-[10px] text-[#053b2a] font-mono bg-[#a8f0be]/40 border border-[#a8f0be] px-2 py-0.5 rounded-full font-semibold">{activeRules.length} active</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  Your agent checks every deal against these criteria before making any purchase.
                </p>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 pt-1">
                  {activeRules.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 text-center space-y-1 shadow-sm">
                      <p className="text-xs text-neutral-800 font-medium">No custom rules added yet</p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Your agent is using standard market guidelines. Type in the chat or use the box above to set specific card names, grades, or price ceilings.
                      </p>
                    </div>
                  ) : (
                    activeRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="group p-3 rounded-2xl bg-white hover:bg-[#f8faf9] border border-neutral-200/80 hover:border-[#a8f0be] text-xs text-neutral-800 flex items-start justify-between gap-2.5 transition shadow-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 text-[#053b2a] shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-sans">{rule}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="opacity-50 group-hover:opacity-100 text-neutral-400 hover:text-rose-600 transition shrink-0 p-1 rounded-md hover:bg-neutral-100"
                          title="Remove this rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Security Assurance */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 text-[11px] text-neutral-600 flex items-start gap-2.5 leading-relaxed shadow-sm">
              <Lock className="w-4 h-4 text-[#053b2a] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-900">Protected on NEAR Protocol:</span>{" "}
                Your agent operates under strict sub-account permissions. It cannot transfer cards out or exceed your spending cap without your cryptographic signature.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
