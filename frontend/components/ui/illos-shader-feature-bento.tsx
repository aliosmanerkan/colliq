"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Key, 
  ArrowRightLeft, 
  Wallet, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  Coins, 
  Lock, 
  ExternalLink,
  Layers,
  Zap,
  Activity
} from "lucide-react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type IllosShaderFeatureBentoProps = {
  eyebrow?: string;
  title?: string;
  className?: string;
};

// =========================================================================
// 1. ILLUSTRATION: COLLECT ACROSS CHAINS (NEAR Chain Signatures & Solana)
// =========================================================================
function ChainSignaturesArt() {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] bg-gradient-to-b from-[#f8faf9] via-white to-[#edf3ef] flex flex-col items-center justify-center p-4 overflow-hidden select-none border-b md:border-b-0 border-neutral-100">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      
      {/* Ambient Glow */}
      <div className="absolute w-64 h-64 bg-[#a8f0be]/25 rounded-full blur-3xl -top-10 -left-10 pointer-events-none" />
      <div className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -bottom-10 -right-10 pointer-events-none" />

      {/* Top Protocol Telemetry Chip */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-neutral-200/80 shadow-sm backdrop-blur-sm">
          <Key className="w-3 h-3 text-[#053b2a]" />
          <span className="font-semibold text-[#053b2a]">NEAR Chain Signatures MPC</span>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-medium">
          <span>Zero Bridges Required</span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative z-10 w-full max-w-lg flex items-center justify-between px-2 sm:px-6 mt-4">
        
        {/* Solana Network Anchor */}
        <div className="flex flex-col items-center gap-2">
          <div className="group relative p-3 rounded-2xl bg-white border border-purple-200/80 shadow-[0_4px_16px_rgba(147,51,234,0.08)] flex flex-col items-center w-28 sm:w-32 transition hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-sm mb-1">
              <span className="font-black text-xs tracking-tighter">SOL</span>
            </div>
            <span className="text-xs font-bold text-neutral-800">Solana Mint</span>
            <span className="text-[10px] font-mono text-purple-600 font-medium">9eHM...r8</span>
            <span className="text-[9px] text-neutral-400 mt-1">Brink's Custody</span>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[9px] font-semibold tracking-wide">
            Physical Origin
          </div>
        </div>

        {/* Cryptographic Transmission Beam */}
        <div className="relative flex-1 flex flex-col items-center px-2">
          {/* Animated Connecting Line */}
          <div className="w-full h-[2px] bg-gradient-to-r from-purple-400 via-[#10b981] to-[#073525] relative overflow-hidden rounded-full">
            <div 
              className="absolute top-0 bottom-0 w-8 bg-white shadow-[0_0_12px_#a8f0be] rounded-full transition-all duration-75"
              style={{ left: `${pulseIndex}%` }}
            />
          </div>

          {/* Floating Center PSA 10 Card Slab */}
          <div className="my-2 p-1.5 rounded-xl bg-white/95 border border-neutral-200/90 shadow-xl backdrop-blur-md flex flex-col items-center animate-[bounce_4s_ease-in-out_infinite] hover:scale-110 transition duration-300 cursor-pointer">
            <div className="relative w-20 sm:w-24 h-28 sm:h-32 rounded-lg bg-[#f0f4f2] border border-neutral-300 p-1 flex flex-col justify-between overflow-hidden">
              {/* PSA Header Label */}
              <div className="w-full bg-red-600 text-white rounded-t px-1 py-0.5 text-center leading-none">
                <span className="text-[7px] font-bold tracking-wider font-mono">PSA 10 GEM MT</span>
              </div>
              {/* Card Image */}
              <div className="flex-1 flex items-center justify-center my-0.5 overflow-hidden rounded bg-white">
                <img 
                  src="https://arweave.net/KwlsVsRoHg-4UMQyieIgkX0qmpKQ723NfDnjfaCJz6g" 
                  alt="PSA 10 Card" 
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Gold Holographic Foil Bar */}
              <div className="w-full h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-b" />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-[#053b2a]">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              <span>RWA PSA 10</span>
            </div>
          </div>
        </div>

        {/* NEAR Protocol Anchor */}
        <div className="flex flex-col items-center gap-2">
          <div className="group relative p-3 rounded-2xl bg-white border border-[#a8f0be] shadow-[0_4px_16px_rgba(7,53,37,0.08)] flex flex-col items-center w-28 sm:w-32 transition hover:scale-105">
            <div className="w-8 h-8 rounded-xl bg-[#073525] flex items-center justify-center text-white shadow-sm mb-1">
              <span className="font-black text-xs tracking-tighter text-[#a8f0be]">NEAR</span>
            </div>
            <span className="text-xs font-bold text-neutral-800">Merchant Vault</span>
            <span className="text-[10px] font-mono text-[#053b2a] font-medium">vault-6.near</span>
            <span className="text-[9px] text-neutral-400 mt-1">Instant Settlement</span>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#053b2a] text-[9px] font-semibold tracking-wide">
            Autonomous Owner
          </div>
        </div>

      </div>

      {/* Bottom Live Cryptographic Footprint */}
      <div className="absolute bottom-3 flex items-center gap-2 text-[10px] font-mono text-neutral-500 bg-white/80 px-3 py-1 rounded-full border border-neutral-200/80 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Derived MPC Key:</span>
        <span className="text-[#053b2a] font-semibold">ed25519:8QfqLV...9Cpb</span>
        <span className="text-neutral-300">•</span>
        <span className="text-emerald-700 font-semibold">Brink's Custody Verified</span>
      </div>
    </div>
  );
}

// =========================================================================
// 2. ILLUSTRATION: NFTS AS ACCOUNTS (NEP-171 Smart Account & Treasury)
// =========================================================================
function NftAccountsArt() {
  return (
    <div className="relative w-full h-[280px] sm:h-[320px] bg-gradient-to-b from-[#f8faf9] via-white to-[#edf3ef] flex flex-col items-center justify-center p-5 overflow-hidden select-none border-b md:border-b-0 border-neutral-100">
      {/* Background Circuit Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      
      {/* Ambient Glow */}
      <div className="absolute w-48 h-48 bg-[#a8f0be]/30 rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top Smart Account Header */}
      <div className="w-full flex items-center justify-between pb-2 text-[11px] font-mono text-neutral-500">
        <span className="inline-flex items-center gap-1 text-[#053b2a] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
          <Layers className="w-3 h-3" />
          <span>NEP-171 SMART VAULT</span>
        </span>
        <span className="text-neutral-400 text-[10px]">ERC-6551 on NEAR</span>
      </div>

      {/* The Evolving NFT Account Card */}
      <div className="relative z-10 w-full max-w-[280px] rounded-2xl bg-white border border-neutral-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
        
        {/* Agent Profile Header */}
        <div className="flex items-center gap-3 pb-2.5 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#073525] to-[#10b981] flex items-center justify-center text-white shadow-sm shrink-0">
            <Bot className="w-5 h-5 text-[#a8f0be]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 truncate">Charizard Sniper</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[10px] font-mono text-neutral-500 truncate">charizard-sniper.near</p>
          </div>
        </div>

        {/* Live Liquid Treasury Display */}
        <div className="p-2.5 rounded-xl bg-[#f8faf9] border border-neutral-200/70 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Liquid Treasury</span>
            <div className="flex items-center gap-1 text-emerald-600 font-mono text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#073525]">$513.00</span>
            <span className="text-xs font-bold font-mono text-neutral-400">USDC</span>
          </div>
        </div>

        {/* Physical Custody Vault Status */}
        <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-0.5">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#053b2a]" />
            <span className="text-[10px] font-medium">3 PSA 10 Slabs Enclosed</span>
          </div>
          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#053b2a]">
            100% Rep
          </span>
        </div>

      </div>

      {/* Micro Status Footnote */}
      <div className="w-full text-center pt-3 text-[10px] text-neutral-400 font-mono">
        Autonomous Contract • Owns Wallet Keys & Assets
      </div>
    </div>
  );
}

// =========================================================================
// 3. ILLUSTRATION: SECURE AGENT-TO-AGENT TRADING (Live Barter Simulation)
// =========================================================================
function AgentTradingArt() {
  const [dealCycle, setDealCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDealCycle((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] bg-gradient-to-b from-[#f8faf9] via-white to-[#edf3ef] flex flex-col justify-between p-5 overflow-hidden select-none border-b md:border-b-0 border-neutral-100">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      
      {/* Ambient Glow */}
      <div className="absolute w-72 h-72 bg-[#a8f0be]/20 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-neutral-200/80 shadow-sm">
          <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span className="font-semibold text-neutral-900">A2A Barter Swarm Settlement</span>
        </div>
        <span className="hidden sm:inline-block text-[10px] text-neutral-400">Block #276399192 • 0.5% Anti-Wash Fee</span>
      </div>

      {/* Central Barter Flow Stage */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-1 sm:px-4 my-auto">
        
        {/* Agent A: Pallet Town Sniper */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-2xl bg-white border border-[#a8f0be] shadow-[0_4px_16px_rgba(7,53,37,0.06)] flex flex-col items-center w-28 sm:w-36 text-center">
            <div className="w-8 h-8 rounded-full bg-[#073525] text-[#a8f0be] flex items-center justify-center font-bold text-xs shadow-sm mb-1">
              PT
            </div>
            <span className="text-xs font-bold text-neutral-900 truncate w-full">Pallet Town</span>
            <span className="text-[10px] text-neutral-500">Sniper Agent</span>
            
            {/* Outgoing Asset Pill */}
            <div className="mt-2 w-full p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 flex flex-col items-center">
              <span className="text-[9px] font-bold text-[#053b2a] truncate w-full">Pikachu PSA 10</span>
              <span className="text-[9px] font-mono font-bold text-emerald-700">+ $42 USDC</span>
            </div>
          </div>
        </div>

        {/* Central Smart Contract Negotiation Nexus */}
        <div className="flex-1 flex flex-col items-center px-1">
          <div className="p-2.5 rounded-2xl bg-white border border-emerald-300 shadow-md flex flex-col items-center text-center max-w-[200px]">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900">Guardrail Enforced</span>
            <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>Max Spend: $50 ✓</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[8px] font-mono text-neutral-400">
              <ArrowRightLeft className="w-2.5 h-2.5 text-neutral-400" />
              <span>Atomic Swap</span>
            </div>
          </div>
        </div>

        {/* Agent B: collectiq */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-2xl bg-white border border-neutral-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col items-center w-28 sm:w-36 text-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm mb-1">
              CQ
            </div>
            <span className="text-xs font-bold text-neutral-900 truncate w-full">collectiq</span>
            <span className="text-[10px] text-neutral-500">Market Maker</span>
            
            {/* Outgoing Asset Pill */}
            <div className="mt-2 w-full p-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 flex flex-col items-center">
              <span className="text-[9px] font-bold text-indigo-950 truncate w-full">Heimerdinger PSA 10</span>
              <span className="text-[9px] font-mono font-bold text-indigo-700">+ $0 USDC</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Live Agreement Toast */}
      <div className="relative z-10 w-full flex items-center justify-between text-[10px] font-mono bg-white/90 border border-neutral-200/80 px-3 py-1.5 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold">Consensus Reached: 4 Dialogue Turns</span>
        </div>
        <span className="text-neutral-500">Atomic Near Protocol Settlement</span>
      </div>

    </div>
  );
}

// =========================================================================
// MAIN BENTO COMPONENT
// =========================================================================
export function IllosShaderFeatureBento({
  eyebrow = "Built on NEAR",
  title = "Autonomous Infrastructure for Physical RWA Trading",
  className,
}: IllosShaderFeatureBentoProps) {
  const items = [
    {
      title: "Collect Across Chains",
      description: "NEAR Chain Signatures and MPC let collectors access and trade assets on other networks, including Solana.",
      illustrationComponent: <ChainSignaturesArt />
    },
    {
      title: "NFTs as Accounts",
      description: "Each NEP-171 Collector NFT has its own NEAR sub-account, USDC vault, and evolving on-chain identity.",
      illustrationComponent: <NftAccountsArt />
    },
    {
      title: "Secure Agent-to-Agent Trading",
      description: "AI collectors negotiate multi-card and USDC swaps. NEAR smart contracts enforce trading limits and handle settlement.",
      illustrationComponent: <AgentTradingArt />
    }
  ];

  return (
    <section className={cx("w-full bg-white", className)}>
      <div className="mx-auto font-poppins flex max-w-6xl flex-col gap-10 px-6 py-16 sm:py-20">
        
        {/* Header */}
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a8f0be]/40 border border-[#a8f0be] text-xs font-semibold text-[#053b2a] w-fit">
            <Sparkles className="w-3.5 h-3.5 text-[#053b2a]" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="text-3xl font-squada uppercase tracking-wide text-[#053b2a] sm:text-5xl">
            {title}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed font-sans">
            A specialized stack uniting physical Brink's vault custody, NEAR MPC chain signatures, and autonomous AI trading swarms into a single decentralized liquidity network.
          </p>
        </div>

        {/* Bento Grid (Matching the exact Layout) */}
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={item.title}
              className={cx(
                "group flex flex-col overflow-hidden rounded-[28px] border border-neutral-200/80 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-[#a8f0be] transition-all duration-300",
                i === 0 && "md:col-span-2",
                i === 2 && "md:col-span-3 md:flex-row md:items-center",
              )}
            >
              <div
                className={cx(
                  "flex flex-1 items-center border-b border-neutral-100",
                  i === 2 && "md:w-1/2 md:flex-none md:self-stretch md:border-b-0 md:border-r",
                )}
              >
                {item.illustrationComponent}
              </div>

              <div className="flex flex-col gap-2.5 p-7">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#053b2a]" />
                  <h3 className="text-lg font-bold text-neutral-900 font-sans tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 font-sans">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default IllosShaderFeatureBento;
