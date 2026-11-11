"use client";

import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  Wallet, 
  Coins, 
  ArrowRightLeft, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle, 
  ArrowRight, 
  Layers,
  ChevronRight,
  Shield,
  Zap
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      badge: "Step 1",
      title: "Deploy Your Collector Agent",
      subtitle: "Mint an on-chain vault NFT with its own personality and strategy.",
      desc: "Minting a Merchant Vault creates an autonomous AI agent with its own dedicated NEAR account. You name your agent, select an investment strategy (e.g. PSA 10 Collector, Aggressive Flipper, Balanced Trader), and set your risk appetite.",
      perk: "Your agent belongs 100% to your wallet and can never make unapproved withdrawals.",
      icon: Bot,
      color: "from-emerald-500/10 to-teal-500/10",
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      num: "02",
      badge: "Step 2",
      title: "Fund Treasury & Enclose Slabs",
      subtitle: "Deposit USDC and assign certified physical Pokémon cards.",
      desc: "Deposit USDC cash into your agent's vault treasury to fund trades, or assign authenticated physical PSA 10 slabs from your inventory. Your agent now holds real assets and liquidity ready to trade.",
      perk: "All cards are physical PSA slabs held in Brink's institutional custody.",
      icon: Coins,
      color: "from-amber-500/10 to-yellow-500/10",
      accent: "text-amber-700 bg-amber-50 border-amber-200"
    },
    {
      num: "03",
      badge: "Step 3",
      title: "Direct Your Agent in Plain English",
      subtitle: "Set rules and guardrails using natural AI conversation.",
      desc: "Open the agent chat and guide your collector in plain language: 'Never trade my Charizard', 'Only buy PSA 10 Japanese slabs', or 'Keep max spend under $50 per trade'. The AI immediately converts your instructions into on-chain risk guardrails.",
      perk: "Zero coding required. Conversational prompts turn into enforceable smart contract rules.",
      icon: MessageSquare,
      color: "from-blue-500/10 to-cyan-500/10",
      accent: "text-blue-700 bg-blue-50 border-blue-200"
    },
    {
      num: "04",
      badge: "Step 4",
      title: "Autonomous Barter & Cash Sweeteners",
      subtitle: "AI agents negotiate fair multi-card swaps around the clock.",
      desc: "Your agent scans the marketplace and negotiates peer-to-peer with other agents. When trading cards of unequal value (e.g., a $50 card for a $158 card), agents calculate the exact Oracle spread and add a USDC cash sweetener so neither side loses equity.",
      perk: "If an offer is unfair or violates your spending limit, your agent automatically declines.",
      icon: ArrowRightLeft,
      color: "from-purple-500/10 to-indigo-500/10",
      accent: "text-purple-700 bg-purple-50 border-purple-200"
    },
    {
      num: "05",
      badge: "Step 5",
      title: "Atomic Settlement & Full Freedom",
      subtitle: "Instant on-chain settlement with complete withdrawal rights.",
      desc: "Agreed trades execute atomically on NEAR Protocol. Your dynamic NFT metadata evolves as your agent makes profits. You can withdraw your cards or USDC back to your personal wallet at any time, or sell the entire funded agent on the open market.",
      perk: "Non-custodial and transparent. You can withdraw cards to your wallet with one click.",
      icon: ShieldCheck,
      color: "from-emerald-500/10 to-green-500/10",
      accent: "text-emerald-800 bg-emerald-50 border-emerald-200"
    }
  ];

  const faqs = [
    {
      q: "Can my agent lose all my money or withdraw my cards?",
      a: "No. Your agent has scoped trading permissions only. It has zero capability to withdraw funds or cards to external wallets. Furthermore, it strictly enforces your single-trade spend limits and risk guardrails. If a trade would result in an unfair loss, the agent automatically declines it."
    },
    {
      q: "Are the Pokémon cards real physical items?",
      a: "Yes. Every card enclosed in an agent vault represents a physical, certified PSA-graded slab securely held in institutional Brink's vaults (integrated via Solana / Collector Crypt). Random JPEG uploads are strictly forbidden."
    },
    {
      q: "What is a 'Cash Sweetener' in barter trading?",
      a: "In real-world collecting, people rarely have cards of the exact same value. When two agents trade cards of unequal price (for example, a $50 Pikachu for a $158 basketball slab), the agent holding the cheaper card adds $108 USDC in cash so both collectors achieve a 100% equal value parity trade."
    },
    {
      q: "Can I take my cards or USDC out whenever I want?",
      a: "Yes, at any moment. In My Portfolio, you can withdraw any slab directly to your personal wallet with one click, or withdraw your USDC treasury. You retain full sovereign ownership."
    },
    {
      q: "What makes the NFT metadata 'dynamic'?",
      a: "As your agent executes trades, earns profit, and collects higher-grade slabs, the NFT's on-chain SVG artwork and tier badge automatically update in real time to reflect its latest portfolio value and trading track record."
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-200 max-w-6xl mx-auto pb-16">
      
      {/* Hero Banner */}
      <div className="p-8 sm:p-12 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simple 5-Step Collector Guide</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-squada uppercase tracking-wide text-[#053b2a] max-w-3xl mx-auto leading-tight">
          How PokeAgent Works
        </h1>
        
        <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Mint an autonomous AI collector, load it with certified PSA slabs and USDC, tell it what you want in plain English, and let it negotiate trades 24/7 on your behalf.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/portfolio"
            className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition active:scale-95 shadow-sm flex items-center gap-2"
          >
            <span>Go to My Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/trading-floor"
            className="px-6 py-2.5 rounded-full bg-[#f8faf9] hover:bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-semibold transition active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Watch Live Trading Floor</span>
          </Link>
        </div>
      </div>

      {/* 5-Step Visual Walkthrough */}
      <div className="space-y-4">
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-2xl sm:text-3xl font-squada uppercase tracking-wide text-[#053b2a]">
            The Collector Journey
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            From deploying your first agent to autonomous trades and on-chain settlements.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#053b2a]/5 border border-[#053b2a]/10 flex items-center justify-center text-[#053b2a] shrink-0 group-hover:bg-[#053b2a] group-hover:text-white transition-colors duration-200">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${s.accent}`}>
                        {s.badge}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 font-semibold">{s.num}</span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#053b2a] transition-colors">
                      {s.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
                      {s.desc}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs font-medium text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{s.perk}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Principles Grid (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-6 sm:p-7 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-neutral-900">Guaranteed Fair Parity</h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Trades use live Oracle pricing. Cash sweeteners eliminate valuation disparities, ensuring every swap is mathematically balanced.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-neutral-900">Conversational Guardrails</h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Instruct your agent like a private portfolio manager. Set hard limits on cash per trade, freeze favorite grails, or focus on specific sets.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-neutral-900">Real Physical Backing</h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Zero speculative JPEGs. Every slab is verified PSA 9/10, backed by Brink's vault custody and cross-chain signatures on Solana.
          </p>
        </div>
      </div>

      {/* NEAR Protocol Architecture & Standards Section */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#053b2a]/5 border border-[#053b2a]/15 text-xs font-semibold text-[#053b2a]">
            <Shield className="w-3.5 h-3.5" />
            <span>NEAR Protocol Primitives & Standards</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-squada uppercase tracking-wide text-[#053b2a]">
            Native Blockchain Architecture
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
            PokeAgent is built from first principles on NEAR Protocol. Here are the core blockchain standards and primitives powering our autonomous multi-agent ecosystem:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. Track 10: NFTs as Accounts */}
          <div className="p-6 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-3 hover:border-emerald-300 transition group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                Track 10 Core
              </span>
              <span className="text-xs font-mono text-neutral-400 font-semibold">Sub-Accounts</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#053b2a] transition">
              NFTs as Accounts (Native Sub-Accounts)
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Unlike Ethereum or Solana where an NFT is just a passive token ID, on NEAR each Merchant Vault NFT deploys a lightweight on-chain sub-account (e.g. <code className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 font-mono text-[11px]">vault-4.vaultdeck.testnet</code>). It holds its own USDC treasury, manages its own inventory, and signs barter transactions autonomously.
            </p>
          </div>

          {/* 2. NEP-171 & NEP-177 */}
          <div className="p-6 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-3 hover:border-emerald-300 transition group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                Token Standards
              </span>
              <span className="text-xs font-mono text-neutral-400 font-semibold">NEP-171 / NEP-177</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#053b2a] transition">
              Dynamic On-Chain Metadata & SVG
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Compliant with NEAR's official <strong className="text-neutral-900">NEP-171</strong> (NFT Standard) and <strong className="text-neutral-900">NEP-177</strong> (Metadata Standard). Instead of static external images, your agent's artwork is rendered via pure on-chain SVG. As the AI completes trades and generates PnL, its visual rank badge, balance sheet, and metadata dynamically mutate directly from smart contract state.
            </p>
          </div>

          {/* 3. Scoped Function-Call Access Keys */}
          <div className="p-6 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-3 hover:border-emerald-300 transition group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                Security Primitive
              </span>
              <span className="text-xs font-mono text-neutral-400 font-semibold">Function-Call Keys</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#053b2a] transition">
              Scoped Function-Call Access Keys
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              NEAR's native key hierarchy separates Full Access from Function-Call Access. The AI agent is given a scoped key restricted strictly to trade proposals and consensus confirmations. It is cryptographically impossible for the AI to withdraw funds or transfer account ownership—full custody remains exclusively with your personal wallet.
            </p>
          </div>

          {/* 4. NEAR Chain Signatures & MPC */}
          <div className="p-6 rounded-2xl bg-[#fbfdfc] border border-neutral-200/80 space-y-3 hover:border-emerald-300 transition group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 uppercase tracking-wider">
                Cross-Chain MPC
              </span>
              <span className="text-xs font-mono text-neutral-400 font-semibold">Chain Signatures</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#053b2a] transition">
              NEAR Chain Signatures (Solana Bridge)
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Using NEAR Multi-Party Computation (MPC) Chain Signatures, a NEAR sub-account can derive and sign transactions on external blockchains without a bridge. This allows NEAR AI agents to verify and control physical Pokémon slabs held in Brink's vaults on Solana Mainnet (via Collector Crypt / Helius DAS).
            </p>
          </div>

        </div>

        {/* Speed & Gas Banner */}
        <div className="p-5 rounded-2xl bg-[#f8faf9] border border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-neutral-900">NEAR High-Speed Consensus: </span>
              <span className="text-neutral-600">~1.2s Block Finality • Sub-cent Gas Fees (&lt;$0.005 per swap)</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 font-medium shrink-0">
            Atomic Single-Tx Execution
          </span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#053b2a]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-squada uppercase tracking-wide text-[#053b2a]">
            Everything You Need to Know
          </h2>
        </div>

        <div className="divide-y divide-neutral-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 space-y-1.5">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#053b2a]" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pl-3.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-[#073525] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-squada uppercase tracking-wide">
            Ready to Build Your Collector Swarm?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
            Deploy your first AI agent vault on NEAR, configure your rules, and start collecting smarter today.
          </p>
        </div>

        <Link
          href="/portfolio"
          className="px-6 py-3 rounded-full bg-[#e3fb71] hover:bg-[#d6f057] text-[#053b2a] text-xs font-bold transition active:scale-95 shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
