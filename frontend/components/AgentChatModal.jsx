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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      
      {/* Studio Split-View Window (Apple Inspired Studio Layout) */}
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[86vh] rounded-[32px] bg-[#09090b] border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden text-neutral-200 font-sans antialiased">
        
        {/* Subtle Ambient Studio Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
          
          {/* Left: Agent Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-2xl bg-neutral-900 border border-white/[0.12] flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0c0e]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {vault.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-cyan-300">
                  {vault.strategy || "BALANCED_TRADER"}
                </span>
              </div>

              <div 
                onClick={handleCopySubAccount}
                className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white cursor-pointer transition select-none mt-0.5"
                title="Click to copy on-chain sub-account"
              >
                <span>{vault.sub_account}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-500" />}
              </div>
            </div>
          </div>

          {/* Right: Mobile Switcher, Treasury & Close */}
          <div className="flex items-center gap-3">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden items-center bg-neutral-900 p-1 rounded-full border border-neutral-800 text-xs">
              <button
                onClick={() => setMobileTab("chat")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  mobileTab === "chat" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMobileTab("rules")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                  mobileTab === "rules" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400"
                }`}
              >
                <span>Rules</span>
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-mono">
                  {activeRules.length}
                </span>
              </button>
            </div>

            {/* Desktop Treasury Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-500">Treasury:</span>
              <span className="font-semibold text-emerald-400">${Number(vault.usdc_balance || 0).toLocaleString()} USDC</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Studio Split-View Body (12 Columns: 7 Chat, 5 Directives) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#09090b]">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean Chat Stream (7 Cols / ~58%)           */}
          {/* ======================================================== */}
          <div className={`lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#09090b] overflow-hidden ${
            mobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}>
            
            {/* Stream Status Bar */}
            <div className="px-6 py-2.5 bg-[#0c0c0e]/60 border-b border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-neutral-300 font-medium">Autonomous Trading Partner</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                Max Budget: ${vault.guardrail_max_spend_per_trade || 350} per card
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 text-sm font-sans">
              {fetching ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-neutral-500 gap-2.5 animate-pulse font-mono">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                  <span>Connecting to agent memory & active rules...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mx-auto shadow-inner">
                    <Bot className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">How should I trade for you?</h4>
                  <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
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
                            ? "bg-white text-black font-medium rounded-tr-sm shadow-sm"
                            : "bg-[#141417] border border-white/[0.08] text-neutral-200 rounded-tl-sm shadow-sm whitespace-pre-wrap"
                        }`}
                      >
                        {/* Inline Rule Confirmation Badge */}
                        {msg.ruleApplied && (
                          <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Rule Activated: {msg.ruleApplied}</span>
                          </div>
                        )}

                        <div>{msg.text}</div>
                      </div>

                      <span className="text-[10px] text-neutral-500 px-1 font-mono">
                        {isUser ? "You" : vault.name}
                      </span>
                    </div>
                  );
                })
              )}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 p-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>{vault.name} is checking market data & updating strategy...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Pills */}
            <div className="px-5 py-2.5 bg-[#0c0c0e]/80 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider shrink-0">
                Suggested:
              </span>
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={loading}
                  className="shrink-0 px-3 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white transition active:scale-95 disabled:opacity-40"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-black border-t border-white/[0.08] shrink-0">
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
                  className="w-full pl-4 pr-24 py-3 rounded-full bg-[#121215] border border-white/[0.1] focus:border-white/[0.3] text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition shadow-inner"
                />

                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="absolute right-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
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
          <div className={`lg:col-span-5 flex flex-col bg-[#0c0c0e] p-5 sm:p-6 overflow-y-auto justify-between space-y-5 ${
            mobileTab === "rules" ? "flex" : "hidden lg:flex"
          }`}>
            
            <div className="space-y-5">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Trading Rules & Safety</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Rules your agent must strictly follow when buying or bidding
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold">
                    {activeRules.length} Active
                  </span>
                  {activeRules.length > 0 && (
                    <button
                      onClick={() => handleDeleteRule("ALL")}
                      className="text-[11px] text-neutral-500 hover:text-rose-400 font-mono transition"
                      title="Remove all custom rules"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Financial & Safety Overview Card */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-3 text-xs">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-neutral-900">
                  <span>Safety Controls</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Real-time parameters</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 font-medium">Available Cash (USDC)</span>
                      <span className="font-mono font-semibold text-white">${Number(vault.usdc_balance || 0).toLocaleString()} USDC</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Funds your agent can deploy for trades</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-900">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 font-medium">Max Spend per Card</span>
                      <span className="font-mono font-semibold text-cyan-400">${vault.guardrail_max_spend_per_trade || 350} USDC</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Agent will never exceed this price for a single card</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-900">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 font-medium">Fair Value Floor</span>
                      <span className="font-mono font-semibold text-emerald-400">At or below {vault.guardrail_min_oracle_fair_value_pct || 80}%</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Requires at least a {100 - (vault.guardrail_min_oracle_fair_value_pct || 80)}% discount to market appraisal</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-900">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 font-medium">Cards Owned</span>
                      <span className="font-mono font-semibold text-neutral-300">{vault.inventoryCount || 0} Slabs</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Physical PSA slabs securely held in vault</p>
                  </div>
                </div>
              </div>

              {/* Quick Add Rule Form */}
              <form onSubmit={handleAddManualRule} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300 block">
                    Add a Custom Rule
                  </label>
                  <span className="text-[10px] text-neutral-500">or ask in chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Only buy PSA 10 Pikachu, Focus on vintage..."
                    value={manualRuleText}
                    onChange={(e) => setManualRuleText(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 transition font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!manualRuleText.trim() || loading}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-semibold flex items-center gap-1 transition active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>
              </form>

              {/* Active Rules List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-300">Active Trading Rules</span>
                  <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">{activeRules.length} active</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  Your agent checks every deal against these criteria before making any purchase.
                </p>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 pt-1">
                  {activeRules.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 text-center space-y-1">
                      <p className="text-xs text-neutral-300 font-medium">No custom rules added yet</p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Your agent is using standard market guidelines. Type in the chat or use the box above to set specific card names, grades, or price ceilings.
                      </p>
                    </div>
                  ) : (
                    activeRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="group p-3 rounded-2xl bg-neutral-950 hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 text-xs text-neutral-200 flex items-start justify-between gap-2.5 transition shadow-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-sans">{rule}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="opacity-50 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 transition shrink-0 p-1 rounded-md hover:bg-neutral-800"
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
            <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-white/[0.06] text-[11px] text-neutral-400 flex items-start gap-2.5 leading-relaxed">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Protected on NEAR Protocol:</span>{" "}
                Your agent operates under strict sub-account permissions. It cannot transfer cards out or exceed your spending cap without your cryptographic signature.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
