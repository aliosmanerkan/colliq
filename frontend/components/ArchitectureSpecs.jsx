"use client";

import { ShieldCheck, Cpu, Database, KeyRound, Layers, Sparkles, Lock, ArrowRightLeft } from "lucide-react";

export default function ArchitectureSpecs() {
  const specs = [
    {
      num: "01",
      title: "NFTs as Accounts (SUB-ACCOUNTS)",
      badge: "Track 10 Core",
      icon: Cpu,
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      desc: "Her NFT mint edildiğinde vault-<id>.market.near şeklinde hafif bir NEAR alt hesabı oluşturulur. Kısıtlı bir Function-Call Access Key ile AI Agent'a bağlanarak bütçesi ve yetkileri sınırlandırılır."
    },
    {
      num: "02",
      title: "Dynamic NFTs (NEP-171 & NEP-177)",
      badge: "On-Chain SVG",
      icon: Sparkles,
      color: "text-amber-400",
      border: "border-amber-500/30",
      desc: "Agent başarılı takaslar yaptıkça NFT'nin on-chain extra metadatası ve Dinamik SVG görseli (Tier rozeti, Net Kâr/PnL, İşlem Sayısı, Envanter Değeri) blokzincir üzerinde canlı evrimleşir."
    },
    {
      num: "03",
      title: "Gerçek RWA Verisi (Collector Crypt & Helius)",
      badge: "Zero Fake JPEGs",
      icon: Database,
      color: "text-indigo-400",
      border: "border-indigo-500/30",
      desc: "Rastgele resim yüklemek kontrat seviyesinde engellenmiştir. Solana üzerindeki Collector Crypt kasalarındaki gerçek Pokémon kartları Helius DAS API ile çekilerek PSA sertifikasıyla mühürlenir."
    },
    {
      num: "04",
      title: "Ölçeklenebilirlik (Stateless Event-Driven Swarm)",
      badge: "10,000+ Agents",
      icon: Layers,
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      desc: "10.000 Docker container yerine PostgreSQL'de duran JSON durum satırları. Eşleşme anında Node.js worker sadece ilgili 2 agent'ı 2 saniyeliğine RAM'e yükler, 3-5 turluk müzakereyi bitirip uyutur."
    },
    {
      num: "05",
      title: "Oyun Teorisi & Güvenlik (Audit Fixes)",
      badge: "Anti-Frontrunning",
      icon: ShieldCheck,
      color: "text-rose-400",
      border: "border-rose-500/30",
      desc: "is_locked Mutex ile kasanın boşaltılıp satılması engellenir. nft_transfer anında eski sahibin AI anahtarı silinir (Zombie Key Wipe). On-chain guardrail'lar prompt injection saldırılarını bloklar."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-lg font-bold text-white">NEAR Track 10 / NFT Mimari Raporu</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          VaultDeck, statik JPEG'ler yerine NEAR Protocol'ün Account Abstraction, Sub-Account,
          Function-Call Key ve Dynamic NEP-171/177 standartlarını kullanan otonom bir tüccar kasa ekosistemidir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-slate-950/80 border ${item.border} flex flex-col justify-between shadow-xl`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black font-mono text-slate-700">{item.num}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>NEAR Native Standard</span>
                <span className="text-emerald-400 font-bold">100% On-Chain Atomic</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
