"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, ArrowLeft, Send, Check, Trash2, Plus } from "lucide-react";
import api from "@/lib/api";
import { initNearWallet } from "@/lib/near";

export default function MintVaultModal({ isOpen, onClose, onSuccess }) {
  // Step 1: Capital & Identity, Step 2: Strategy & Rules (Chat + Rules Split), Step 3: Review & Deploy
  const [step, setStep] = useState(1);
  const [connectedAccount, setConnectedAccount] = useState("alierkan.testnet");
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [error, setError] = useState("");

  // Step 1 State: Identity & Capital
  const [name, setName] = useState("");
  const [suffixCode, setSuffixCode] = useState(() => Math.random().toString(36).substring(2, 6));
  const [usdcDeposit, setUsdcDeposit] = useState("500");
  const [maxSpend, setMaxSpend] = useState("175");

  const getAgentSlug = (n) => {
    const s = String(n || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s.length > 24 ? s.substring(0, 24).replace(/-+$/, "") : (s || "agent");
  };

  // Step 2 State: Conversational Strategy & Directives
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [manualRuleInput, setManualRuleInput] = useState("");
  const [rules, setRules] = useState([
    "Evaluate only PSA 10 & CGC Pristine slabs",
    "Maintain at least $100 USDC cash buffer in treasury",
    "Require minimum 18% Oracle fair value discount"
  ]);
  const [suggestedChips, setSuggestedChips] = useState([
    "Target Pokémon PSA 10 grails",
    "Require minimum 20% Oracle discount",
    "Lock Charizard & Pelé from barter"
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initNearWallet().then((w) => {
        if (w?.accountId) {
          setConnectedAccount(w.accountId);
        }
      });
      setStep(1);
      setError("");

      if (messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Welcome. Let's establish your trading directives and rules together.\n\nWhat card categories (Pokémon, Sports, Anime) should we hunt, and what are your risk constraints? Type your instructions below or choose a suggestion."
          }
        ]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 2) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, aiThinking, step]);

  if (!isOpen) return null;

  const handleDepositChange = (val) => {
    setUsdcDeposit(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setMaxSpend(String(Math.round(num * 0.35)));
    }
  };

  // Step 2 Chat: Send message to Inception Architect
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || aiThinking) return;

    setError("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputValue("");
    setAiThinking(true);

    try {
      const res = await api.post("/vaults/inception-chat", {
        messages: newMessages,
        currentBlueprint: {
          name,
          usdc_deposit: parseFloat(usdcDeposit) || 500,
          guardrail_max_spend: parseFloat(maxSpend) || 175,
          custom_rules: rules
        },
        user_account: connectedAccount || "alierkan.testnet"
      });

      if (res.data) {
        const { reply, suggestedChips: newChips, blueprint } = res.data;

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply }
        ]);

        if (Array.isArray(newChips) && newChips.length > 0) {
          setSuggestedChips(newChips.slice(0, 3));
        }

        if (blueprint && Array.isArray(blueprint.custom_rules) && blueprint.custom_rules.length > 0) {
          setRules((prev) => Array.from(new Set([...prev, ...blueprint.custom_rules])));
        }
      }
    } catch (err) {
      console.error("Inception chat error:", err);
      setError("AI connection timed out. You can continue or proceed to review.");
    } finally {
      setAiThinking(false);
    }
  };

  const removeRule = (idxToRemove) => {
    setRules((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const addManualRule = () => {
    const trimmed = manualRuleInput.trim();
    if (!trimmed) return;
    if (!rules.includes(trimmed)) {
      setRules((prev) => [...prev, trimmed]);
    }
    setManualRuleInput("");
  };

  // Step 3: Final Mint Execution
  const handleDeployVault = async () => {
    if (!name.trim()) {
      setStep(1);
      setError("Please provide a name for your vault.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/vaults/mint", {
        name: name.trim(),
        custom_suffix: suffixCode,
        owner_account: connectedAccount || "alierkan.testnet",
        usdc_deposit: parseFloat(usdcDeposit) || 500,
        strategy: "BALANCED_TRADER",
        guardrail_max_spend: parseFloat(maxSpend) || 175,
        custom_rules: rules,
        bio: `Autonomous Merchant Vault (${rules.length} active directives).`
      });

      if (res.data?.status === "MINTED") {
        onSuccess(res.data.vault);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to deploy merchant vault on NEAR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className={`relative w-full rounded-[28px] bg-white border border-neutral-200/80 shadow-2xl flex flex-col overflow-hidden text-neutral-900 font-sans transition-all duration-300 ease-in-out ${
          step === 2 
            ? "max-w-5xl h-[88vh] max-h-[780px]" 
            : "max-w-2xl max-h-[700px]"
        }`}
      >
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-[#f8faf9] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-squada uppercase tracking-wide text-[#053b2a]">
                Create Merchant Vault
              </span>
              <span className="text-[10px] font-mono text-[#053b2a] bg-[#a8f0be]/40 px-2 py-0.5 rounded-full border border-[#a8f0be]">
                NEAR Track 10
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Autonomous NFT Account with Dedicated Sub-Account & MPC Access Key
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition border border-neutral-200 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 py-2.5 border-b border-neutral-100 bg-[#fbfdfc] flex items-center justify-between text-xs font-medium shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step === 1 ? "bg-[#073525] text-white font-semibold" : step > 1 ? "bg-[#a8f0be] text-[#053b2a] font-bold" : "bg-neutral-100 text-neutral-400"
            }`}>
              {step > 1 ? <Check className="w-3 h-3 text-[#053b2a]" /> : "1"}
            </span>
            <span className={step === 1 ? "text-neutral-900 font-semibold" : "text-neutral-500"}>1. Capital & Identity</span>
          </div>

          <span className="text-neutral-300">───</span>

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step === 2 ? "bg-[#073525] text-white font-semibold" : step > 2 ? "bg-[#a8f0be] text-[#053b2a] font-bold" : "bg-neutral-100 text-neutral-400"
            }`}>
              {step > 2 ? <Check className="w-3 h-3 text-[#053b2a]" /> : "2"}
            </span>
            <span className={step === 2 ? "text-neutral-900 font-semibold" : "text-neutral-500"}>2. Strategy & Rules (Chat)</span>
          </div>

          <span className="text-neutral-300">───</span>

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step === 3 ? "bg-[#073525] text-white font-semibold" : "bg-neutral-100 text-neutral-400"
            }`}>
              3
            </span>
            <span className={step === 3 ? "text-neutral-900 font-semibold" : "text-neutral-500"}>3. Review & Deploy</span>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center justify-between shrink-0">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          
          {/* STEP 1: CAPITAL & IDENTITY */}
          {step === 1 && (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Name Your Vault & Allocate Treasury Capital</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Your vault deploys as an independent autonomous sub-account on NEAR Protocol.
                </p>
              </div>

              <div className="space-y-4">
                {/* Vault Name Input */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Vault Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Pallet Town Sniper or Charizard Alpha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8faf9] border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#a8f0be] transition"
                  />
                  
                  {/* Collision-Free Sub-Account Capsule */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#f8faf9] border border-neutral-200/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] uppercase font-bold text-[#053b2a]">On-Chain Sub-Account:</span>
                      <span className="text-neutral-900 font-semibold truncate">
                        {getAgentSlug(name)}-{suffixCode}.vaultdeck.testnet
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuffixCode(Math.random().toString(36).substring(2, 6))}
                      className="text-[10px] text-neutral-600 hover:text-neutral-900 px-2 py-0.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 transition shrink-0 ml-2 shadow-sm"
                      title="Shuffle unique tag"
                    >
                      🎲 Tag #{suffixCode}
                    </button>
                  </div>
                </div>

                {/* Treasury Deposit Input */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Initial Treasury Capital (USDC Deposit)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-mono">$</span>
                    <input
                      type="number"
                      min="50"
                      step="50"
                      required
                      value={usdcDeposit}
                      onChange={(e) => handleDepositChange(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-[#f8faf9] border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#a8f0be] transition"
                    />
                  </div>

                  {/* Preset Pills */}
                  <div className="flex gap-2 mt-2">
                    {[
                      { label: "$250 (Starter)", val: "250" },
                      { label: "$500 (Standard)", val: "500" },
                      { label: "$1,000 (Whale)", val: "1000" }
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => handleDepositChange(p.val)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition border ${
                          usdcDeposit === p.val
                            ? "bg-[#073525] text-white border-[#073525]"
                            : "bg-[#f8faf9] text-neutral-600 border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Single-Trade Expenditure Cap */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-neutral-700">
                      Single-Trade Expenditure Cap
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      (Recommended: 35% of treasury)
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-mono">$</span>
                    <input
                      type="number"
                      min="25"
                      value={maxSpend}
                      onChange={(e) => setMaxSpend(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-[#f8faf9] border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#a8f0be] transition"
                    />
                  </div>
                </div>

                {/* Owner Info Box */}
                <div className="p-3 rounded-xl bg-[#f8faf9] border border-neutral-200/80 text-xs flex items-center justify-between">
                  <span className="text-neutral-500">Connected Manager Account:</span>
                  <span className="font-mono text-[#053b2a] font-semibold">{connectedAccount}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STRATEGY & RULES (SPLIT VIEW: CHAT ON LEFT, RULES ON RIGHT) */}
          {step === 2 && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">
              
              {/* LEFT COLUMN: Clean Chat With Inception Architect (7 cols / ~58%) */}
              <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-100 bg-white overflow-hidden">
                
                {/* Chat Top Sub-Header */}
                <div className="px-5 py-2.5 border-b border-neutral-100 bg-[#fbfdfc] flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#053b2a]" />
                    <span className="font-semibold text-neutral-900">Inception Architect</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#053b2a] font-semibold">
                    Treasury: ${usdcDeposit} USDC
                  </span>
                </div>

                {/* Spacious Chat Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs bg-white">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line text-xs ${
                          m.role === "user"
                            ? "bg-[#073525] text-white font-medium shadow-sm"
                            : "bg-[#f8faf9] border border-neutral-200/80 text-neutral-800 shadow-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {aiThinking && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500 italic py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#053b2a] animate-pulse" />
                      <span>Analyzing risk and compiling directives...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Unified Bottom Chat Input */}
                <div className="p-3.5 border-t border-neutral-100 bg-[#fbfdfc] shrink-0 space-y-2">
                  {/* Suggestion Chips */}
                  {suggestedChips.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {suggestedChips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={aiThinking}
                          onClick={() => handleSendMessage(chip)}
                          className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-700 hover:text-neutral-900 transition disabled:opacity-50 shadow-sm"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Discuss card target, risk limits, or grail locks..."
                      value={inputValue}
                      disabled={aiThinking}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-full bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#a8f0be] transition shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || aiThinking}
                      className="px-4 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

              {/* RIGHT COLUMN: Dedicated Compiled Directives & Rules Panel (5 cols / ~42%) */}
              <div className="lg:col-span-5 flex flex-col bg-[#fbfdfc] border-l border-neutral-100 p-5 overflow-y-auto space-y-4 justify-between">
                <div className="space-y-4">
                  
                  {/* Panel Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                        Trading Rules & Safety
                      </h4>
                      <p className="text-[11px] text-neutral-500">Rules your agent will follow on-chain</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#a8f0be]/40 border border-[#a8f0be] text-[#053b2a] font-semibold">
                      {rules.length} Active
                    </span>
                  </div>

                  {/* Vault Identity Mini-Card */}
                  <div className="p-3 rounded-xl bg-white border border-neutral-200/80 space-y-1.5 text-xs shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Agent Name:</span>
                      <span className="font-semibold text-neutral-900">{name || "Unnamed Vault"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Budget / Max per Card:</span>
                      <span className="font-mono text-[#053b2a] font-semibold">${usdcDeposit} / ${maxSpend} USDC</span>
                    </div>
                  </div>

                  {/* Directives List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-neutral-700 block">
                        Configured Trading Rules
                      </label>
                      <span className="text-[10px] text-neutral-400">Agent safety rules</span>
                    </div>

                    {rules.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                        No custom rules added yet. Chat on the left or add below to set specific cards or budget limits.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                        {rules.map((rule, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between p-2.5 rounded-xl bg-white border border-neutral-200/80 text-xs shadow-sm hover:border-[#a8f0be] transition"
                          >
                            <div className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[#053b2a] shrink-0 mt-0.5" />
                              <span className="text-neutral-800 leading-snug">{rule}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRule(idx)}
                              className="text-neutral-400 hover:text-rose-600 transition ml-2 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Manual Directive Input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-medium text-neutral-700 block">
                      Add a Custom Rule
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Only buy PSA 10 Pikachu, Focus on vintage..."
                        value={manualRuleInput}
                        onChange={(e) => setManualRuleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addManualRule();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#a8f0be] shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={addManualRule}
                        disabled={!manualRuleInput.trim()}
                        className="px-3 py-1.5 rounded-xl bg-[#073525] hover:bg-[#0a4531] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition shrink-0 shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                </div>

                <div className="text-[10px] font-mono text-neutral-500 border-t border-neutral-200 pt-2">
                  Rules are enforced automatically by your agent's NEAR smart contract.
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: REVIEW & DEPLOY */}
          {step === 3 && (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Review Genesis Contract & Deploy</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Verify your parameters before committing this autonomous trading vault to NEAR Testnet.
                </p>
              </div>

              {/* Genesis Contract Receipt */}
              <div className="p-4 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 space-y-3 text-xs shadow-sm">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-200">
                  Genesis Contract Specification
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Vault Name:</span>
                  <span className="font-semibold text-neutral-900">{name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Dedicated Sub-Account:</span>
                  <span className="font-mono text-[#053b2a] font-semibold">
                    {getAgentSlug(name)}-{suffixCode}.vaultdeck.testnet
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Treasury Capital:</span>
                  <span className="font-mono text-neutral-900 font-semibold">${usdcDeposit} USDC</span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-200">
                  <span className="text-neutral-500">Max Spend per Card:</span>
                  <span className="font-mono text-neutral-900 font-semibold">${maxSpend} USDC</span>
                </div>

                {/* Configured Rules in Receipt */}
                <div className="pt-2">
                  <span className="text-neutral-500 block mb-1.5 font-medium">
                    Configured Trading Rules ({rules.length}):
                  </span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-xl bg-white border border-neutral-200/80 text-[11px] text-neutral-800 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-[#053b2a] shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Network Gas & Security Notice */}
              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1 font-mono shadow-sm">
                <div>• NETWORK: NEAR Protocol Testnet</div>
                <div>• ACCOUNT TYPE: Track 10 NFT-as-Account</div>
                <div>• ACCESS KEY: Autonomous Agent Function-Call Key (Wiped on NFT transfer)</div>
                <div>• ESTIMATED GAS: ~0.01 NEAR</div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-[#f8faf9] flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-medium flex items-center gap-1.5 transition shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-500 hover:text-neutral-900 transition shadow-sm"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {step === 1 && (
              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <span>Continue to Strategy & Rules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <span>Review Genesis Contract</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={loading || !name.trim()}
                onClick={handleDeployVault}
                className="px-6 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                {loading ? (
                  <span>Deploying on NEAR Testnet...</span>
                ) : (
                  <>
                    <span>Deploy Merchant Vault ($0.01 Gas)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
