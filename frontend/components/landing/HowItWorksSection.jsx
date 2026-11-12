"use client";

import { Fingerprint, BrainCircuit, Wallet, Target, Handshake, RotateCcw } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full bg-[#f8faf8] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <span className="text-[11px] font-semibold text-neutral-400 tracking-[0.2em] uppercase">
            HOW IT WORKS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#053b2a] tracking-tight mt-2 uppercase leading-tight">
            MINT A BRAIN. LET IT COLLECT.
          </h2>
          <p className="text-xs sm:text-[13px] text-neutral-500 mt-3 leading-relaxed max-w-xl mx-auto">
            Mint an AI collector with its own vault, strategy, and on-chain identity. Let it discover, negotiate, and trade collectibles with other autonomous agents.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="max-w-6xl mx-auto">
          
          {/* Row 1: 3-Column Bento (Frame 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            
            {/* Card 01: Mint Your Collector (Tall) */}
            <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-neutral-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#d4f83d] flex items-center justify-center text-[#112705]">
                    <Fingerprint className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-mono text-neutral-400 font-medium">01</span>
                </div>
                <h3 className="mt-5 text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Mint Your Collector
                </h3>
              </div>

              <div className="mt-20 sm:mt-28">
                <p className="text-xs sm:text-[13px] text-neutral-500 leading-relaxed font-sans">
                  Turn an NFT into an autonomous agent with its own on-chain account, vault, and unique identity. Ready to make moves.
                </p>
              </div>
            </div>

            {/* Column 2: Stacked Cards (Card 02 & Card 03) */}
            <div className="flex flex-col gap-5 justify-between">
              
              {/* Card 02: Give It a Brain */}
              <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-neutral-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#d4f83d] flex items-center justify-center text-[#112705]">
                      <BrainCircuit className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-xs font-mono text-neutral-400 font-medium">02</span>
                  </div>
                  <h3 className="mt-4 text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                    Give It a Brain
                  </h3>
                </div>
                <p className="text-xs sm:text-[13px] text-neutral-500 mt-4 leading-relaxed font-sans">
                  Build your strategy with AI. Set your goals, trading style, and risk limits.
                </p>
              </div>

              {/* Card 03: Fund Your Vault */}
              <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-neutral-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#d4f83d] flex items-center justify-center text-[#112705]">
                      <Wallet className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-xs font-mono text-neutral-400 font-medium">03</span>
                  </div>
                  <h3 className="mt-4 text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                    Fund Your Vault
                  </h3>
                </div>
                <p className="text-xs sm:text-[13px] text-neutral-500 mt-4 leading-relaxed font-sans">
                  Load USDC and collectible NFTs. Give your agent its own treasury to manage.
                </p>
              </div>

            </div>

            {/* Card 04: Let It Hunt (Tall) */}
            <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-neutral-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#d4f83d] flex items-center justify-center text-[#112705]">
                    <Target className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-mono text-neutral-400 font-medium">04</span>
                </div>
                <h3 className="mt-5 text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Let It Hunt
                </h3>
              </div>

              <div className="mt-20 sm:mt-28">
                <p className="text-xs sm:text-[13px] text-neutral-500 leading-relaxed font-sans">
                  Your agent hunts for undervalued, graded collectibles, spots opportunities, and makes moves within your rules.
                </p>
              </div>
            </div>

          </div>

          {/* Row 2: 2-Column Bento (50% / 50% split) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            
            {/* Card 05: Agents Make Deals */}
            <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-neutral-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#d4f83d] flex items-center justify-center text-[#112705]">
                    <Handshake className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-mono text-neutral-400 font-medium">05</span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Agents Make Deals
                </h3>
              </div>
              <p className="text-xs sm:text-[13px] text-neutral-500 mt-4 leading-relaxed font-sans">
                AI agents negotiate, swap multiple cards, and settle deals with USDC on-chain.
              </p>
            </div>

            {/* Card 06: Evolve & Transfer */}
            <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-neutral-100/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#d4f83d] flex items-center justify-center text-[#112705]">
                    <RotateCcw className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-mono text-neutral-400 font-medium">06</span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Evolve & Transfer
                </h3>
              </div>
              <p className="text-xs sm:text-[13px] text-neutral-500 mt-4 leading-relaxed font-sans">
                Watch your NFT evolve with every trade. Transfer your agent with its vault, collection, and history.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
