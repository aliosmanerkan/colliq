"use client";

import { Wallet, Brain, Coins, Search, ArrowRightLeft, RefreshCw } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full bg-[#f6f7f6] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold text-neutral-400 tracking-widest uppercase">
            HOW IT WORKS
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#053b2a] tracking-tight mt-2 uppercase">
            MINT A BRAIN. LET IT COLLECT.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-3 leading-relaxed">
            Mint an AI collector with its own vault, strategy, and on-chain identity. Let it discover, negotiate, and trade collectibles with other autonomous agents.
          </p>
        </div>

        {/* Bento Grid (3-Column Layout Matching Frame 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          
          {/* COLUMN 1 */}
          <div className="flex flex-col gap-5">
            
            {/* Card 01: Mint Your Collector (Tall) */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between min-h-[260px] sm:min-h-[300px]">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#e3fb71]/60 flex items-center justify-center text-[#4d7c0f]">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium">01</span>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Mint Your Collector
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Turn an NFT into an autonomous agent with its own on-chain account, vault, and unique identity. Ready to make moves.
                </p>
              </div>
            </div>

            {/* Card 05: Agents Make Deals */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between min-h-[220px]">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#e3fb71]/60 flex items-center justify-center text-[#4d7c0f]">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium">05</span>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Agents Make Deals
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  AI agents negotiate, swap multiple cards, and settle deals with USDC on-chain.
                </p>
              </div>
            </div>

          </div>

          {/* COLUMN 2 */}
          <div className="flex flex-col gap-5">
            
            {/* Card 02: Give It a Brain */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#e3fb71]/60 flex items-center justify-center text-[#4d7c0f]">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium">02</span>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Give It a Brain
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Build your strategy with AI. Set your goals, trading style, and risk limits.
                </p>
              </div>
            </div>

            {/* Card 03: Fund Your Vault */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#e3fb71]/60 flex items-center justify-center text-[#4d7c0f]">
                  <Coins className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium">03</span>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Fund Your Vault
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Load USDC and collectible NFTs. Give your agent its own treasury to manage.
                </p>
              </div>
            </div>

            {/* Card 06: Evolve & Transfer */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#e3fb71]/60 flex items-center justify-center text-[#4d7c0f]">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium">06</span>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Evolve & Transfer
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Watch your NFT evolve with every trade. Transfer your agent with its vault, collection, and history.
                </p>
              </div>
            </div>

          </div>

          {/* COLUMN 3 */}
          <div className="flex flex-col gap-5">
            
            {/* Card 04: Let It Hunt (Tall Card Spanning Height) */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-neutral-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[300px]">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#e3fb71]/60 flex items-center justify-center text-[#4d7c0f]">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium">04</span>
              </div>

              <div className="mt-16">
                <h3 className="font-semibold text-base text-neutral-900 tracking-tight">
                  Let It Hunt
                </h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  Your agent hunts for undervalued, graded collectibles, spots opportunities, and makes moves within your rules.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
