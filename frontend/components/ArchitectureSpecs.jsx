"use client";

import { 
  ShieldCheck, 
  FileCode, 
} from "lucide-react";

export default function ArchitectureSpecs() {
  const specs = [
    {
      num: "01",
      title: "NFTs as Accounts (Sub-Accounts)",
      badge: "Track 10 Core",
      desc: "Minting each Merchant Vault NFT automatically deploys a lightweight NEAR sub-account (e.g. vault-<id>.market.near). A scoped Function-Call Access Key is bound to the AI agent, restricting its capabilities to authorized trades only (no withdrawals)."
    },
    {
      num: "02",
      title: "Dynamic On-Chain SVG (NEP-171 / 177)",
      badge: "Pure Blockchain State",
      desc: "As trading agents complete barter deals, the NFT's on-chain metadata and pure Base64 SVG (Tier badge, Net PnL, Settled Trades, and Slabs Value) dynamically evolve directly from smart contract state."
    },
    {
      num: "03",
      title: "PWCC & Brink's Vault Custody",
      badge: "Zero Fake Assets",
      desc: "Arbitrary image uploads are strictly forbidden at the contract level. Verified physical slabs stored in Brink's and PWCC institutional vaults are synced on-chain and sealed with authentic PSA, CGC, and BGS certifications."
    },
    {
      num: "04",
      title: "Stateless Event-Driven Swarm",
      badge: "10,000+ Agents",
      desc: "Instead of running 10,000 heavy Docker containers, agents exist as lightweight JSON states in PostgreSQL. Ephemeral Node.js workers load matched agents into RAM for 2-second negotiations, then return to sleep."
    },
    {
      num: "05",
      title: "Zombie Key Wipe Security Patch",
      badge: "Audit Proof",
      desc: "An is_locked Mutex prevents front-running empty-vault sales. Upon nft_transfer, the previous owner's AI agent key is revoked instantly (Zombie Key Wipe). On-chain slippage guardrails block prompt injection attacks."
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Keynote Hero */}
      <div className="p-8 sm:p-12 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a8f0be]/40 border border-[#a8f0be] text-xs font-medium text-[#053b2a]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#053b2a]" />
            <span>NEAR Track 10 Technical Blueprint</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-squada uppercase tracking-wide text-[#053b2a]">
            The Architecture of Colliq.
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed font-sans">
            Built from first principles on NEAR Protocol. Replacing static JPEGs with autonomous accounts that own USDC cash, custody physical PSA Pokémon slabs, and trade peer-to-peer.
          </p>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-neutral-100 font-sans">
          <div>
            <div className="text-xs text-neutral-500 uppercase font-medium">Account Standard</div>
            <div className="text-sm font-semibold text-neutral-900 mt-1">vault-*.market.near</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase font-medium">Key Delegation</div>
            <div className="text-sm font-semibold text-neutral-900 mt-1">Function-Call Only</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase font-medium">Asset Custody</div>
            <div className="text-sm font-semibold text-neutral-900 mt-1">Brink's Sealed Slabs</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 uppercase font-medium">Finality Speed</div>
            <div className="text-sm font-semibold text-neutral-900 mt-1">~1.2s on NEAR</div>
          </div>
        </div>
      </div>

      {/* Grid of Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specs.map((item, idx) => (
          <div
            key={idx}
            className="p-8 rounded-[28px] bg-white border border-neutral-200/80 hover:border-[#a8f0be] transition-all duration-300 flex flex-col justify-between shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(4,50,36,0.08)]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-semibold text-neutral-300 font-mono">
                  {item.num}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#f8faf9] border border-neutral-200/80 text-neutral-700">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>NEAR Protocol Native</span>
              <span className="text-[#053b2a] font-semibold">100% On-Chain</span>
            </div>
          </div>
        ))}

        {/* Rust Contract Code Preview */}
        <div className="p-8 rounded-[28px] bg-white border border-neutral-200/80 hover:border-[#a8f0be] flex flex-col justify-between shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#053b2a]" />
                Atomic Settlement Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#a8f0be]/40 text-[#053b2a] border border-[#a8f0be]">
                Rust Contract
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#091510] border border-[#1b3d2b] font-mono text-xs text-neutral-200 space-y-1.5 overflow-x-auto shadow-inner">
              <div className="text-[#7d9b89]">// 1. Mutex Check: Verify neither vault is locked</div>
              <div><span className="text-[#a8f0be] font-bold">assert!</span>(!vault_a.is_locked && !vault_b.is_locked);</div>
              <div className="text-[#7d9b89] pt-1">// 2. Guardrails Check: Spend limit & fair value range</div>
              <div><span className="text-[#a8f0be] font-bold">assert!</span>(cash_delta &lt;= vault_a.guardrail_max_spend);</div>
              <div className="text-[#7d9b89] pt-1">// 3. Atomic Swapping in Internal Ledger</div>
              <div>ledger.swap_cards(card_a, card_b);</div>
              <div>ledger.transfer_usdc(vault_a, vault_b, cash_delta);</div>
              <div className="text-[#7d9b89] pt-1">// 4. Evolve Dynamic NEP-171 On-Chain SVG & PnL</div>
              <div>vault_a.record_trade_and_evolve_svg();</div>
              <div>vault_b.record_trade_and_evolve_svg();</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Security Audited</span>
            <span className="text-[#053b2a] font-semibold">Zero-Loss Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
