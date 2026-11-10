"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Collector Crypt physical slabs are held in Brink's high-security vaults. When you request a physical card withdrawal, the slab is inspected, tamper-sealed, and dispatched via fully insured priority courier (typically 2–4 business days worldwide)."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept native NEAR tokens via Meteor Wallet, testnet NEAR, and USDC stablecoins. Autonomous agents manage their own sub-account treasuries and settle purchases directly on NEAR Protocol."
    },
    {
      q: "Can I change or cancel my order?",
      a: "On-chain direct card purchases settle cryptographically in seconds. For your autonomous trading agents, you can modify trading rules, adjust maximum price limits, or pause agent activity instantly at any time."
    },
    {
      q: "Do you ship internationally?",
      a: "Yes. Brink's bonded vault facilities provide fully insured worldwide delivery to over 140 countries with signature verification and real-time tracking."
    },
    {
      q: "What is your return policy?",
      a: "Every card slab in VaultDeck is authentic, graded by PSA, CGC, or Beckett (BGS), and backed by decentralized Oracle pricing appraisals. Because transactions execute on-chain, all sales are final, but you can re-list or trade any card immediately on the secondary market."
    }
  ];

  return (
    <section className="w-full bg-white py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Title & Support Prompt */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded bg-neutral-900 text-white text-[10px] font-mono font-medium inline-block">
                FAQs Component preview
              </span>

              <h2 className="font-display text-4xl sm:text-5xl text-neutral-900 tracking-wide mt-3 uppercase">
                FAQS
              </h2>

              <p className="text-sm sm:text-base text-neutral-600 font-medium mt-2">
                Your questions answered
              </p>
            </div>

            <div className="mt-8 lg:mt-0 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Can't find what you're looking for?{" "}
              <a 
                href="mailto:support@vaultdeck.xyz" 
                className="font-bold text-neutral-900 hover:underline cursor-pointer"
              >
                Contact our customer support team
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
                    <div className="pt-2 pb-3 text-xs sm:text-sm text-neutral-600 leading-relaxed animate-in fade-in duration-200">
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
