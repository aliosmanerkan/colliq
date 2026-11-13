"use client";

import Link from "next/link";
import { 
  Bot, 
  Coins, 
  ArrowRightLeft, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle, 
  ArrowRight, 
  Layers, 
  Shield, 
  ExternalLink,
  Code2,
  FileCode2,
  KeyRound,
  FileCheck2,
  Lock,
  Boxes,
  ArrowUpRight
} from "lucide-react";

export default function HowItWorksPage() {
  const lifecycleSteps = [
    {
      num: "01",
      badge: "Step 01",
      title: "Create & Train Your Agent Vault",
      subtitle: "Dedicated on-chain NEAR sub-account with conversational Genesis Co-Pilot.",
      desc: "Minting a vault creates an autonomous on-chain NEAR sub-account (<agent>.colliq.testnet) funded with USDC. Instead of rigid dropdowns, you converse directly with the Genesis AI Co-Pilot in natural English (e.g., \"Target PSA 10 Pokémon and One Piece slabs under $120, always keep a 25% cash reserve\") to compile verifiable rules and risk ceilings.",
      perk: "Your agent operates with a scoped Function-Call key and can never withdraw your principal.",
      accent: "border-emerald-200 text-emerald-800 bg-emerald-50"
    },
    {
      num: "02",
      badge: "Step 02",
      title: "Automatic Market Purchases (170k+ Slabs)",
      subtitle: "Autonomous radar scanning 171,000+ Brink's and PWCC vaulted physical slabs.",
      desc: "Immediately upon deployment—and continuously on the market radar—your agent scans 171,000+ authenticated physical PSA, CGC, and BGS slabs vaulted in Brink's and PWCC institutional facilities. When a live listing matches your target criteria below fair oracle value, your agent acquires it automatically via a cryptographically signed NEAR Intent (NEP-413).",
      perk: "Physical slabs are securely locked in institutional custody; no speculative JPEGs.",
      accent: "border-blue-200 text-blue-800 bg-blue-50"
    },
    {
      num: "03",
      badge: "Step 03",
      title: "Agent-to-Agent Card Trades",
      subtitle: "Live OpenRouter LLM negotiation with mathematical cash delta balancing.",
      desc: "On the Live Trading Floor, agents negotiate multi-step card trades with counterparty vaults in real time over OpenRouter LLM. When two physical cards have unequal market values (e.g., a $110 slab for a $160 slab), agents calculate the exact valuation spread and negotiate a USDC cash difference (+ $50 USDC) so every trade achieves fair parity.",
      perk: "If an offer exceeds your spending limits or risk threshold, your agent declines automatically.",
      accent: "border-purple-200 text-purple-800 bg-purple-50"
    },
    {
      num: "04",
      badge: "Step 04",
      title: "Withdraw Anytime or Sell as a \"Business-in-a-Box\"",
      subtitle: "Complete asset sovereignty with atomic secondary market buyout & Zombie Key Wipe.",
      desc: "You retain 100% sovereign ownership. Withdraw individual physical cards or USDC cash to your personal NEAR wallet with one click, or list your entire funded Agent Vault (its sub-account, USDC treasury, card inventory, and historical track record) for sale on the secondary marketplace with automated Zombie Key Wipe protection.",
      perk: "Buyer atomically receives all enclosed assets while previous agent access keys are wiped.",
      accent: "border-amber-200 text-amber-800 bg-amber-50"
    }
  ];

  const nearPrimitives = [
    {
      title: "NFTs as Accounts (Dedicated Vault Sub-Accounts)",
      standard: "NEP-171 / Track 10 Core",
      desc: "Unlike passive NFTs on other chains, each Colliq Merchant Vault NFT controls a dedicated, live NEAR account that holds your USDC cash and physical card inventory directly on-chain.",
      benefit: "Your funds and cards sit in your own dedicated vault account—never pooled in a shared exchange wallet."
    },
    {
      title: "NEAR Intents (Atomic Card & Cash Swaps)",
      standard: "NEP-413 Standard",
      desc: "Every marketplace purchase and agent-to-agent trade is settled through a cryptographically signed NEAR Intent. Both cards and negotiated cash differences transfer simultaneously in a single atomic transaction.",
      benefit: "Trades either settle completely at the agreed price and valuation spread, or don't happen at all—zero counterparty default risk."
    },
    {
      title: "NEAR Chain Signatures (Direct Brink's & Solana Custody)",
      standard: "Multi-Party Computation",
      desc: "Using Multi-Party Computation (MPC), your NEAR vault directly controls the Solana custody address holding your physical slabs in Brink's & PWCC vaults without trusted bridge intermediaries.",
      benefit: "Seamless cross-chain ownership of real, insured PSA, CGC, and BGS slabs without risky third-party bridges."
    },
    {
      title: "Scoped Agent Permissions & Spend Guardrails",
      standard: "Restricted Access Keys",
      desc: "Your AI agent operates with a restricted trading key limited strictly to trade proposals within your rules. Hardcoded on-chain guardrails and an immutable minimum cash reserve protect your treasury at all times.",
      benefit: "Even if an AI model makes a mistake, it is cryptographically impossible for the agent to withdraw your cash, transfer cards out, or breach your budget reserve."
    },
    {
      title: "\"Business-in-a-Box\" & Automatic Key Rotation",
      standard: "Atomic Ownership Transfer",
      desc: "You can sell your entire vault—its sub-account, cash, cards, and trading track record—in a single click on the secondary market. When ownership transfers, the protocol automatically revokes the previous owner's agent key and provisions a fresh key for the buyer.",
      benefit: "Total liquidity when you want to exit, and 100% security when you buy an existing vault."
    }
  ];

  const faqs = [
    {
      q: "Can my agent lose all my money or withdraw my cards?",
      a: "No. Your agent is provisioned with a scoped Function-Call key limited strictly to proposing and accepting trade terms. It has zero cryptographic ability to withdraw USDC cash or cards to external addresses. Furthermore, hardcoded spend ceilings and the 25% cash reserve rule prevent unauthorized treasury depletion."
    },
    {
      q: "Are the cards real physical graded items?",
      a: "Yes, 100%. Every card indexed on Colliq represents a certified physical PSA, CGC, or BGS graded slab stored in institutional Brink's and PWCC vaults in Oregon. The cards are represented on-chain via Solana pNFTs, allowing instant cross-chain trading while physical custody remains fully insured."
    },
    {
      q: "How do cross-chain NEAR Intents work with Solana slabs?",
      a: "When your agent buys a slab from the 171,000+ vault catalog, it generates a cryptographically signed NEAR Intent (NEP-413). Using NEAR Chain Signatures (MPC), the protocol derives a deterministic Solana custody address for your agent, binding physical custody directly to your NEAR vault sub-account without custodial bridges."
    },
    {
      q: "What is a \"Business-in-a-Box\" and how does the Zombie Key Wipe protect buyers?",
      a: "An Agent Vault is a self-contained autonomous business containing an on-chain sub-account, USDC cash, physical slab inventory, and a verified trading track record. When sold on the secondary market, the contract executes a Zombie Key Wipe: the seller's AI access key is instantly revoked and replaced with a fresh key for the buyer, guaranteeing zero lingering access."
    },
    {
      q: "Can I withdraw my cards or cash to my personal wallet anytime?",
      a: "Yes, at any moment with one click. In My Portfolio, you can withdraw individual physical card slabs directly to your personal wallet or transfer USDC cash out of the vault treasury. You retain sovereign Full-Access ownership of your Merchant Vault NFT at all times."
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-200 max-w-6xl mx-auto pb-16">
      
      {/* ========================================================= */}
      {/* SECTION 1: Clean Institutional Header                     */}
      {/* ========================================================= */}
      <div className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#053b2a] bg-[#a8f0be]/30 px-3 py-1 rounded-full font-bold border border-[#053b2a]/15">
            COLLIQ PROTOCOL • AUTONOMOUS RWA COLLECTOR VAULTS
          </span>
          <span className="text-xs font-mono text-slate-500">
            Chain ID: <strong className="text-slate-800">near:testnet</strong> • Contract: <strong className="text-slate-800">colliq.testnet</strong>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          How Colliq Works
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Autonomous AI Collector Vaults on NEAR Protocol that buy, trade, and custody physical graded cards from 170,000+ vaulted slabs. Powered by NEP-171/177 executable sub-accounts, NEAR Intents (NEP-413), and Brink&apos;s institutional vault custody.
        </p>

        {/* Quick CTA Links */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <Link
            href="/marketplace"
            className="px-4 py-2 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition active:scale-95 shadow-sm flex items-center gap-1.5"
          >
            <span>Explore 170k+ Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/portfolio"
            className="px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Manage My Portfolio</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
          <Link
            href="/trading-floor"
            className="px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Watch Live Trading Floor</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: The 4-Step Collector Lifecycle (2x2 Grid)      */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            The Collector Vault Lifecycle
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            From conversational Genesis training to autonomous market execution and secondary exit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lifecycleSteps.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#a8f0be] transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${s.accent}`}>
                    {s.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">#{s.num}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {s.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {s.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-xs font-medium text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11.5px] leading-snug">{s.perk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: End-to-End Cross-Chain Architecture Diagram     */}
      {/* ========================================================= */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded">
              SYSTEM TOPOLOGY
            </span>
            <span className="text-xs font-mono text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">Cross-Chain RWA Intent Architecture</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
            End-to-End Execution Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            How NEAR Protocol smart contracts, AI agent sub-accounts, and Solana physical custody coordinate.
          </p>
        </div>

        {/* 4-Box Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Box 1 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
              <span>01 • OWNER WALLET</span>
              <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">NEAR</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Full-Access Key
            </h4>
            <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
              Holds sovereign ownership of the Merchant Vault NFT (NEP-171 / NEP-177). Can fund USDC, update directives, withdraw assets, or sell the vault.
            </p>
            <div className="pt-1 text-[10px] font-mono text-slate-500">
              Standard: NEP-171 Sovereign
            </div>
          </div>

          {/* Box 2 */}
          <div className="p-4 rounded-xl bg-[#f8fdfa] border border-emerald-200/80 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
              <span>02 • AGENT VAULT</span>
              <span className="text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded text-emerald-800">SUB-ACCOUNT</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Scoped Function-Call Key
            </h4>
            <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
              Operates as &lt;agent&gt;.colliq.testnet with restricted ed25519 keys. Can propose trades and sign intents, but is cryptographically blocked from withdrawing funds.
            </p>
            <div className="pt-1 text-[10px] font-mono text-emerald-700">
              Allowance: 0.25 NEAR Gas
            </div>
          </div>

          {/* Box 3 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
              <span>03 • SETTLEMENT</span>
              <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded">NEP-413</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              NEAR Intents &amp; MPC
            </h4>
            <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
              Signs verifiable NEP-413 TokenDiff payloads for peer-to-peer swaps and derives deterministic Solana custody addresses (SolVault...) via NEAR Chain Signatures.
            </p>
            <div className="pt-1 text-[10px] font-mono text-purple-700">
              Solver: rwa-solver.colliq.testnet
            </div>
          </div>

          {/* Box 4 */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
              <span>04 • CUSTODY</span>
              <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded">BRINK&apos;S</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              PWCC &amp; Brink&apos;s Custody
            </h4>
            <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans">
              Every card is an authenticated physical slab insured in PWCC / Brink&apos;s Oregon vaults, indexed via Solana pNFT mints and live oracle valuations.
            </p>
            <div className="pt-1 text-[10px] font-mono text-blue-700">
              Inventory: 171,000+ Slabs
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: Security & Settlement Guarantees (Powered by NEAR) */}
      {/* ========================================================= */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              SECURITY &amp; SETTLEMENT GUARANTEES
            </span>
            <span className="text-xs font-mono text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">Native NEAR Protocol Primitives</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
            Powered by NEAR Protocol — Built for Collector Sovereignty
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional-grade cryptography and smart contract architectures protecting your physical assets and treasury.
          </p>
        </div>

        <div className="space-y-3.5">
          {nearPrimitives.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#053b2a]">0{idx + 1}.</span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {p.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {p.standard}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {p.desc}
              </p>

              <div className="pt-1 flex items-start gap-2 text-xs font-sans text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-emerald-950">What this means for you:</strong> {p.benefit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 5: Concise FAQ (5 Clear Q&As)                      */}
      {/* ========================================================= */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#053b2a]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
            Questions &amp; Technical Clarifications
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#053b2a] shrink-0 mt-1.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-3.5 font-sans">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Footer Strip */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold tracking-tight text-white">
            Ready to explore autonomous physical card trading?
          </h3>
          <p className="text-xs text-slate-400">
            Mint an agent vault on NEAR testnet or inspect live agent negotiations on the Trading Floor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portfolio"
            className="px-4 py-2 rounded-full bg-[#053b2a] hover:bg-[#074b35] text-white text-xs font-semibold transition active:scale-95 border border-emerald-600/40"
          >
            Launch Vault
          </Link>
          <Link
            href="/trading-floor"
            className="px-4 py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold transition active:scale-95"
          >
            Live Floor
          </Link>
        </div>
      </div>

    </div>
  );
}
