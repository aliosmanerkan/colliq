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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-in fade-in duration-150">
      <div 
        className={`relative w-full rounded-2xl bg-[#09090b] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-neutral-100 font-sans transition-all duration-300 ease-in-out ${
          step === 2 
            ? "max-w-5xl h-[88vh] max-h-[780px]" 
            : "max-w-2xl max-h-[700px]"
        }`}
      >
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-800/80 bg-[#0c0c0e] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Create Merchant Vault
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                NEAR Track 10
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Autonomous NFT Account with Dedicated Sub-Account & MPC Access Key
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition border border-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 py-2.5 border-b border-neutral-800/60 bg-[#0c0c0e]/40 flex items-center justify-between text-xs font-medium shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step === 1 ? "bg-white text-black font-semibold" : step > 1 ? "bg-neutral-800 text-neutral-300" : "bg-neutral-900 text-neutral-600"
            }`}>
              {step > 1 ? <Check className="w-3 h-3 text-white" /> : "1"}
            </span>
            <span className={step === 1 ? "text-white" : "text-neutral-500"}>1. Capital & Identity</span>
          </div>

          <span className="text-neutral-700">───</span>

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step === 2 ? "bg-white text-black font-semibold" : step > 2 ? "bg-neutral-800 text-neutral-300" : "bg-neutral-900 text-neutral-600"
            }`}>
              {step > 2 ? <Check className="w-3 h-3 text-white" /> : "2"}
            </span>
            <span className={step === 2 ? "text-white" : "text-neutral-500"}>2. Strategy & Rules (Chat)</span>
          </div>

          <span className="text-neutral-700">───</span>

          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
              step === 3 ? "bg-white text-black font-semibold" : "bg-neutral-900 text-neutral-600"
            }`}>
              3
            </span>
            <span className={step === 3 ? "text-white" : "text-neutral-500"}>3. Review & Deploy</span>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 bg-red-950/40 border-b border-red-900/40 text-xs text-red-300 flex items-center justify-between shrink-0">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* STEP 1: CAPITAL & IDENTITY */}
          {step === 1 && (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-white">Name Your Vault & Allocate Treasury Capital</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Your vault deploys as an independent autonomous sub-account on NEAR Protocol.
                </p>
              </div>

              <div className="space-y-4">
                {/* Vault Name Input */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Vault Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Pallet Town Sniper or Charizard Alpha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition"
                  />
                  
                  {/* Collision-Free Sub-Account Capsule */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] uppercase font-bold text-cyan-400">On-Chain Sub-Account:</span>
                      <span className="text-white font-medium truncate">
                        {getAgentSlug(name)}-{suffixCode}.vaultdeck.testnet
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuffixCode(Math.random().toString(36).substring(2, 6))}
                      className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition shrink-0 ml-2"
                      title="Shuffle unique tag"
                    >
                      🎲 Tag #{suffixCode}
                    </button>
                  </div>
                </div>

                {/* Treasury Deposit Input */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Initial Treasury Capital (USDC Deposit)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-mono">$</span>
                    <input
                      type="number"
                      min="50"
                      step="50"
                      required
                      value={usdcDeposit}
                      onChange={(e) => handleDepositChange(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-neutral-500 transition"
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
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition border ${
                          usdcDeposit === p.val
                            ? "bg-neutral-800 text-white border-neutral-600"
                            : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
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
                    <label className="text-xs font-medium text-neutral-300">
                      Single-Trade Expenditure Cap
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      (Recommended: 35% of treasury)
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-mono">$</span>
                    <input
                      type="number"
                      min="25"
                      value={maxSpend}
                      onChange={(e) => setMaxSpend(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:outline-none focus:border-neutral-500 transition"
                    />
                  </div>
                </div>

                {/* Owner Info Box */}
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs flex items-center justify-between">
                  <span className="text-neutral-500">Connected Manager Account:</span>
                  <span className="font-mono text-neutral-300">{connectedAccount}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STRATEGY & RULES (SPLIT VIEW: CHAT ON LEFT, RULES ON RIGHT) */}
          {step === 2 && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#09090b]">
              
              {/* LEFT COLUMN: Clean Chat With Inception Architect (7 cols / ~58%) */}
              <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-800 bg-[#09090b] overflow-hidden">
                
                {/* Chat Top Sub-Header */}
                <div className="px-5 py-2.5 border-b border-neutral-800/80 bg-[#0c0c0e]/60 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-medium text-white">Inception Architect</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Treasury: ${usdcDeposit} USDC
                  </span>
                </div>

                {/* Spacious Chat Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-3 leading-relaxed whitespace-pre-line text-xs ${
                          m.role === "user"
                            ? "bg-neutral-200 text-neutral-900 font-medium"
                            : "bg-[#111114] border border-neutral-800 text-neutral-200"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {aiThinking && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400 italic py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse" />
                      <span>Analyzing risk and compiling directives...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Unified Bottom Chat Input */}
                <div className="p-3.5 border-t border-neutral-800 bg-[#0c0c0e] shrink-0 space-y-2">
                  {/* Suggestion Chips */}
                  {suggestedChips.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {suggestedChips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={aiThinking}
                          onClick={() => handleSendMessage(chip)}
                          className="shrink-0 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-400 hover:text-white transition disabled:opacity-50"
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
                      className="flex-1 px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || aiThinking}
                      className="px-4 py-2.5 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

              {/* RIGHT COLUMN: Dedicated Compiled Directives & Rules Panel (5 cols / ~42%) */}
              <div className="lg:col-span-5 flex flex-col bg-[#0c0c0e] p-5 overflow-y-auto space-y-4 justify-between">
                <div className="space-y-4">
                  
                  {/* Panel Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                    <div>
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                        Trading Rules & Safety
                      </h4>
                      <p className="text-[11px] text-neutral-400">Rules your agent will follow on-chain</p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {rules.length} Active
                    </span>
                  </div>

                  {/* Vault Identity Mini-Card */}
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Agent Name:</span>
                      <span className="font-semibold text-white">{name || "Unnamed Vault"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Budget / Max per Card:</span>
                      <span className="font-mono text-neutral-200">${usdcDeposit} / ${maxSpend} USDC</span>
                    </div>
                  </div>

                  {/* Directives List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-neutral-300 block">
                        Configured Trading Rules
                      </label>
                      <span className="text-[10px] text-neutral-500">Agent safety rules</span>
                    </div>

                    {rules.length === 0 ? (
                      <div className="p-4 rounded-lg bg-neutral-950/60 border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                        No custom rules added yet. Chat on the left or add below to set specific cards or budget limits.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                        {rules.map((rule, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs"
                          >
                            <div className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                              <span className="text-neutral-200 leading-snug">{rule}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRule(idx)}
                              className="text-neutral-500 hover:text-red-400 transition ml-2 shrink-0"
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
                    <label className="text-[11px] font-medium text-neutral-400 block">
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
                        className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                      />
                      <button
                        type="button"
                        onClick={addManualRule}
                        disabled={!manualRuleInput.trim()}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs font-medium flex items-center gap-1 transition shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                </div>

                <div className="text-[10px] font-mono text-neutral-500 border-t border-neutral-800/60 pt-2">
                  Rules are enforced automatically by your agent's NEAR smart contract.
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: REVIEW & DEPLOY */}
          {step === 3 && (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-white">Review Genesis Contract & Deploy</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Verify your parameters before committing this autonomous trading vault to NEAR Testnet.
                </p>
              </div>

              {/* Genesis Contract Receipt */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-900">
                  Genesis Contract Specification
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Vault Name:</span>
                  <span className="font-semibold text-white">{name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Dedicated Sub-Account:</span>
                  <span className="font-mono text-cyan-400 font-medium">
                    {getAgentSlug(name)}-{suffixCode}.vaultdeck.testnet
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Treasury Capital:</span>
                  <span className="font-mono text-white font-medium">${usdcDeposit} USDC</span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-900">
                  <span className="text-neutral-400">Max Spend per Card:</span>
                  <span className="font-mono text-white font-medium">${maxSpend} USDC</span>
                </div>

                {/* Configured Rules in Receipt */}
                <div className="pt-2">
                  <span className="text-neutral-400 block mb-1.5">
                    Configured Trading Rules ({rules.length}):
                  </span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded bg-neutral-900 border border-neutral-800/80 text-[11px] text-neutral-300"
                      >
                        <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Network Gas & Security Notice */}
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60 text-[11px] text-neutral-500 space-y-1 font-mono">
                <div>• NETWORK: NEAR Protocol Testnet</div>
                <div>• ACCOUNT TYPE: Track 10 NFT-as-Account</div>
                <div>• ACCESS KEY: Autonomous Agent Function-Call Key (Wiped on NFT transfer)</div>
                <div>• ESTIMATED GAS: ~0.01 NEAR</div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 border-t border-neutral-800/80 bg-[#0c0c0e] flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-400 hover:text-white transition"
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
                className="px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <span>Continue to Strategy & Rules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
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
                className="px-6 py-2 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-md"
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
