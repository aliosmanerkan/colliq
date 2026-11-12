"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How is a Colliq Agent both an NFT and an autonomous wallet?",
      a: "Under NEAR Track 10 (NFTs as Accounts), minting an agent deploys an autonomous on-chain sub-account (<agent>.colliq.testnet) equipped with an internal synchronous asset ledger. The Merchant Vault NFT (NEP-171 / NEP-177) represents sovereign ownership of that account, which manages its own USDC treasury and physical card inventory."
    },
    {
      q: "Where are the physical graded cards stored?",
      a: "Every card indexed on Colliq is an authenticated physical slab graded by PSA, CGC, or BGS, securely custodied in institutional, insured vaults (PWCC & Brink's Oregon facilities) via Collector Crypt on Solana. Slabs are cross-chain bridged to NEAR sub-accounts via Chain Signatures (MPC)."
    },
    {
      q: "How do agents negotiate and settle trades without human intervention?",
      a: "Agents operate a 4-round chronological LLM negotiation engine on the Live Trading Floor. When two slabs have unequal market valuations, agents calculate the exact fair valuation spread and negotiate a USDC cash difference. Once consensus is reached, the trade settles atomically via dual-signed NEAR Intents (NEP-413)."
    },
    {
      q: "Can an AI agent rug-pull or drain my personal NEAR wallet?",
      a: "No. The AI agent runtime operates strictly via Scoped Function-Call Access Keys (with a restricted 0.25 NEAR gas allowance) limited solely to proposing and confirming trade terms. It has zero cryptographic authority to withdraw owner funds, and hardcoded risk guardrails (maxSpendPerCard, 25% cash reserve) prevent excessive treasury spending."
    },
    {
      q: "What happens when I sell or transfer my Agent NFT?",
      a: "Colliq implements a \"Business-in-a-Box\" model: transferring the NFT atomically transfers the agent's entire sub-account, USDC treasury, physical slab inventory, and track record to the buyer. Upon transfer (nft_transfer), a cryptographic Zombie Key Wipe instantly revokes the previous owner's AI session key and provisions fresh keys for the buyer."
    }
  ];

  return (
    <section className="w-full bg-white py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Title, Protocol Architecture Summary Card & Support Prompt */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-[#a8f0be]/30 text-[#053b2a] border border-[#053b2a]/15 text-[10px] font-mono font-bold uppercase tracking-wider inline-block">
                PROTOCOL ARCHITECTURE &amp; FAQ
              </span>

              <h2 className="font-display text-4xl sm:text-5xl text-neutral-900 tracking-wide mt-3 uppercase">
                FAQS
              </h2>

              <p className="text-sm sm:text-base text-neutral-600 font-medium mt-2">
                Frequently asked questions about autonomous collector vaults
              </p>

              {/* Protocol Architecture Summary Card */}
              <div className="mt-6 p-5 rounded-2xl bg-[#f8faf9] border border-neutral-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#053b2a]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>NEAR TRACK 10 • NFTS AS ACCOUNTS</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  Colliq transforms static NFTs into autonomous merchant vaults with dedicated on-chain sub-accounts (<code className="text-[#053b2a] font-mono font-semibold text-[11px]">&lt;agent&gt;.colliq.testnet</code>), multi-turn LLM barter, and 171k+ physical slab custody.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs font-semibold">
                  <Link href="/how-it-works" className="text-[#053b2a] hover:underline flex items-center gap-1">
                    <span>Architecture Spec</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-neutral-300">•</span>
                  <a 
                    href="https://testnet.nearblocks.io/address/colliq.testnet" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>colliq.testnet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-neutral-500 leading-relaxed pt-4 border-t border-neutral-100">
              Need technical assistance or partnership inquiries?{" "}
              <a 
                href="mailto:contact@colliq.fun" 
                className="font-bold text-neutral-900 hover:underline cursor-pointer"
              >
                contact@colliq.fun
              </a>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7 divide-y divide-neutral-200">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-2 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-neutral-900 hover:text-neutral-600 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? "rotate-180 text-neutral-900" : ""
                      }`} 
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-2 pb-3 text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
