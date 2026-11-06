"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  X,
  ShoppingBag,
  Bot,
  Wallet,
  Coins,
  Cpu
} from "lucide-react";
import api from "@/lib/api";
import { initNearWallet } from "@/lib/near";

export default function CollectorCryptCatalog({ vaults, onCardBridged, onOpenMint }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("price_desc");

  // Connected Wallet Account
  const [connectedAccount, setConnectedAccount] = useState("alierkan.testnet");

  // Modals
  const [selectedCardForDirectBuy, setSelectedCardForDirectBuy] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyResult, setBuyResult] = useState(null);
  const [buyError, setBuyError] = useState("");

  const [selectedCardForAgent, setSelectedCardForAgent] = useState(null);
  const [targetVaultId, setTargetVaultId] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [agentError, setAgentError] = useState("");

  useEffect(() => {
    initNearWallet().then((w) => {
      if (w?.accountId) setConnectedAccount(w.accountId);
    });
  }, []);

  const fetchCcCards = async () => {
    setLoading(true);
    try {
      const res = await api.get("/market/collector-crypt", {
        params: { search, category, sortBy },
      });
      setCards(res.data?.cards || []);
    } catch (err) {
      console.error("Error loading Collector Crypt inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCcCards();
  }, [category, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCcCards();
  };

  // 1. DIRECT PURCHASE (Manuel Satın Al)
  const handleDirectBuy = async () => {
    if (!selectedCardForDirectBuy) return;
    setBuyLoading(true);
    setBuyError("");

    try {
      const res = await api.post("/market/buy-direct", {
        card_id: selectedCardForDirectBuy.id,
        buyer_account: connectedAccount || "alierkan.testnet",
      });

      setBuyResult(res.data);
      if (onCardBridged) onCardBridged();
    } catch (err) {
      setBuyError(err.message || "Failed to complete purchase");
    } finally {
      setBuyLoading(false);
    }
  };

  // 2. ASSIGN TO AGENT (Ajanıma Hedef Ver / Snipe)
  const handleAgentSnipe = async (e) => {
    e.preventDefault();
    if (!targetVaultId || !selectedCardForAgent) return;
    setAgentLoading(true);
    setAgentError("");

    try {
      const res = await api.post(`/vaults/${targetVaultId}/snipe`, {
        card_id: selectedCardForAgent.id,
      });

      setAgentResult(res.data);
      if (onCardBridged) onCardBridged();
    } catch (err) {
      setAgentError(err.message || "Ajan bu kartı satın alamadı");
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Editorial Banner */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#0c0c0e] border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
              🛍️ Canlı Kart Pazaryeri
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Brink's ve PSA Kasalı Gerçek Kartlar (RWA)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-sans">
            Pokémon & TCG Kart Pazaryeri
          </h2>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Buradaki kartları ister cüzdanınızla <strong className="text-white">kendiniz doğrudan satın alın</strong>, isterseniz kurallarını belirlediğiniz bir <strong className="text-cyan-400">Yapay Zeka Ticaret Ajanı (NEAR Sub-Account)</strong> görevlendirip otomatik avlatın.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-900 shrink-0 text-left md:text-right">
          <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Mevcut Kartlar</div>
          <div className="text-3xl font-semibold text-white mt-1">{cards.length}</div>
          <div className="text-xs text-emerald-400 mt-0.5">PSA 10 / GEM-MT Slabs</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "Pokemon", "One Piece", "Basketball", "Football"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0 ${
                category === cat
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {cat === "ALL" ? "Tüm Kartlar" : cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Kart ara (Pikachu, Charizard...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/[0.3] transition font-sans"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white/[0.3] transition font-sans"
          >
            <option value="price_desc">En Yüksek Fiyat</option>
            <option value="price_asc">En Düşük Fiyat</option>
            <option value="rareness">Nadirlik Sırası</option>
          </select>
        </div>
      </div>

      {/* Grid of Slabs */}
      {loading ? (
        <div className="py-24 text-center text-xs text-neutral-400 animate-pulse flex flex-col items-center justify-center gap-2">
          <span>Brink's ve Collector Crypt envanteri yükleniyor...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-500">
          Arama kriterine uygun kart bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const price = card.insuredUsd || card.costUsd || 0;

            return (
              <div
                key={card.id}
                className="group relative rounded-[28px] p-4 bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 flex flex-col justify-between shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* PSA Header */}
                  <div className="mb-3 px-3 py-1.5 rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center justify-between text-xs">
                    <span className="font-bold text-red-500 font-mono">PSA</span>
                    <span className="font-semibold text-white">{card.grade || "GEM MT 10"}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Brink's Mühürlü</span>
                  </div>

                  {/* Artwork Box */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center p-3 border border-neutral-900 mb-3 group-hover:border-neutral-800 transition">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300"
                    />

                    {card.rareness && (
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/[0.1] text-[10px] font-medium text-amber-300 flex items-center gap-1 shadow-sm">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Nadirlik {card.rareness}/100</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Set */}
                  <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[36px] group-hover:text-neutral-200 transition" title={card.name}>
                    {card.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                    <span>{card.category || "TCG"}</span>
                    <span>Pop: {card.population?.atGrade || "N/A"}</span>
                  </div>

                  {/* Pricing Box */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-neutral-950 border border-neutral-900 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Piyasa Değeri:</span>
                      <span className="text-sm font-semibold text-white font-mono">${price} USDC</span>
                    </div>
                  </div>
                </div>

                {/* DUAL ACTION BUTTONS: KENDİN AL & AJANA HEDEF VER */}
                <div className="mt-4 pt-3.5 border-t border-neutral-900 space-y-2">
                  {/* Action 1: Kendin Satın Al */}
                  <button
                    onClick={() => {
                      setSelectedCardForDirectBuy(card);
                      setBuyResult(null);
                      setBuyError("");
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Kendin Al (${price} USDC)</span>
                  </button>

                  {/* Action 2: Ajanıma Hedef Ver */}
                  <button
                    onClick={() => {
                      setSelectedCardForAgent(card);
                      setAgentResult(null);
                      setAgentError("");
                      if (vaults.length > 0) setTargetVaultId(String(vaults[0].id));
                    }}
                    className="w-full py-2 px-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-xs font-medium flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ajanıma Hedef Ver (Snipe)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: DIRECT BUY (KENDİN SATIN AL) */}
      {selectedCardForDirectBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] bg-[#0c0c0e] border border-white/[0.1] p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-5">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  Doğrudan Satın Al
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Kart doğrudan kendi Meteor cüzdanınıza aktarılır
                </p>
              </div>
              <button
                onClick={() => setSelectedCardForDirectBuy(null)}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {buyResult ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-neutral-950 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Kart Başarıyla Satın Alındı!
                  </div>
                  <p className="text-neutral-300">
                    <span className="text-white font-semibold">{selectedCardForDirectBuy.name}</span> kartı hesabınıza tanımlandı.
                  </p>
                  <div className="text-[10px] text-neutral-500 font-mono break-all pt-2 border-t border-neutral-900">
                    İşlem Hash: {buyResult.tx_hash} • Blok #{buyResult.block}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCardForDirectBuy(null)}
                  className="w-full py-2.5 rounded-full bg-white text-black text-xs font-semibold transition"
                >
                  Tamamla
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {buyError && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                    {buyError}
                  </div>
                )}

                {/* Card summary */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center gap-3">
                  <img
                    src={selectedCardForDirectBuy.imageUrl}
                    alt=""
                    className="w-14 h-18 object-contain rounded-xl bg-black p-1 border border-neutral-800"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{selectedCardForDirectBuy.name}</div>
                    <div className="text-xs text-neutral-500">{selectedCardForDirectBuy.grade} • PSA Sertifikalı</div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                      ${selectedCardForDirectBuy.insuredUsd || selectedCardForDirectBuy.costUsd} USDC
                    </div>
                  </div>
                </div>

                {/* Buyer Account */}
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-neutral-400" />
                    Alıcı Cüzdan:
                  </span>
                  <span className="font-mono font-semibold text-white">{connectedAccount}</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCardForDirectBuy(null)}
                    className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDirectBuy}
                    disabled={buyLoading}
                    className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition disabled:opacity-50"
                  >
                    {buyLoading ? "Satın Alınıyor..." : "Öde ve Satın Al"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN TO AGENT (AJANA HEDEF VER / SNIPE) */}
      {selectedCardForAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-[32px] bg-[#0c0c0e] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900 mb-5">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  Ajanıma Hedef Göster (Snipe)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Ajanınız kendi sub-account hazinesindeki bakiye ile bu kartı satın alır
                </p>
              </div>
              <button
                onClick={() => setSelectedCardForAgent(null)}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {agentResult ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-neutral-950 border border-cyan-500/30 text-cyan-400 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Ajan Kartı Başarıyla Avladı!
                  </div>
                  <p className="text-neutral-300">
                    <span className="text-white font-semibold">{selectedCardForAgent.name}</span> kartı ajanınızın sub-account kasasına eklendi.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCardForAgent(null)}
                  className="w-full py-2.5 rounded-full bg-white text-black text-xs font-semibold transition"
                >
                  Tamamla
                </button>
              </div>
            ) : (
              <form onSubmit={handleAgentSnipe} className="space-y-4">
                {agentError && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                    {agentError}
                  </div>
                )}

                {/* Card preview */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center gap-3">
                  <img
                    src={selectedCardForAgent.imageUrl}
                    alt=""
                    className="w-14 h-18 object-contain rounded-xl bg-black p-1 border border-neutral-800"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{selectedCardForAgent.name}</div>
                    <div className="text-xs text-neutral-500">{selectedCardForAgent.grade} • PSA Sertifikalı</div>
                    <div className="text-base font-bold text-white font-mono mt-1">
                      ${selectedCardForAgent.insuredUsd || selectedCardForAgent.costUsd} USDC
                    </div>
                  </div>
                </div>

                {vaults.length > 0 ? (
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Kartı Avlayacak Ajanı / Kasayı Seçin:
                    </label>
                    <select
                      value={targetVaultId}
                      onChange={(e) => setTargetVaultId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    >
                      {vaults.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.sub_account}) • Bütçe: ${v.usdc_balance} USDC
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-center space-y-2">
                    <p className="text-neutral-400">Henüz aktif bir ticaret ajanınız bulunmuyor.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardForAgent(null);
                        if (onOpenMint) onOpenMint();
                      }}
                      className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition"
                    >
                      + Şimdi Yeni Ajan Mint Et
                    </button>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCardForAgent(null)}
                    className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition"
                  >
                    İptal
                  </button>
                  {vaults.length > 0 && (
                    <button
                      type="submit"
                      disabled={agentLoading}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
                    >
                      {agentLoading ? "Ajan Avlıyor..." : "Ajanı Görevlendir & Satın Al"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
