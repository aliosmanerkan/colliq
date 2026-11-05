"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Sparkles, ShieldCheck, ArrowRight, ExternalLink, Flame, CheckCircle2, Coins } from "lucide-react";
import api from "@/lib/api";

export default function CollectorCryptCatalog({ vaults, onCardBridged }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [grade, setGrade] = useState("ALL");
  const [sortBy, setSortBy] = useState("price_desc");
  const [selectedCardForBridge, setSelectedCardForBridge] = useState(null);
  const [targetVaultId, setTargetVaultId] = useState("");
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [bridgeResult, setBridgeResult] = useState(null);
  const [bridgeError, setBridgeError] = useState("");

  const fetchCcCards = async () => {
    setLoading(true);
    try {
      const res = await api.get("/market/collector-crypt", {
        params: { search, category, grade, sortBy },
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
  }, [category, grade, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCcCards();
  };

  const handleBridgeSubmit = async (e) => {
    e.preventDefault();
    if (!targetVaultId || !selectedCardForBridge) return;
    setBridgeLoading(true);
    setBridgeError("");

    try {
      const res = await api.post("/market/collector-crypt/bridge", {
        card_id: selectedCardForBridge.id,
        vault_id: parseInt(targetVaultId),
        owner_account: "alierkan.testnet",
      });

      setBridgeResult(res.data);
      if (onCardBridged) onCardBridged();
    } catch (err) {
      setBridgeError(err.message || "Failed to bridge card");
    } finally {
      setBridgeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Solana Mainnet ➔ NEAR Protocol
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Brink's Vault Custody Sealed
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">
            Collector Crypt RWA Pokémon & Sports Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real physical graded slabs stored in Brink's vaults. Authentic PSA certification, Solana mint address, 
            and live vendor insured valuations ready to be bridged into NEAR Autonomous Merchant Vaults.
          </p>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] uppercase text-slate-400">Total Live Slabs</div>
          <div className="text-2xl font-black text-amber-400">{cards.length} Products</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search slab name, player, set..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "Pokemon", "One Piece", "Basketball", "Football"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition shrink-0 ${
                category === cat
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="price_desc">Highest Insured Value</option>
            <option value="price_asc">Lowest Price</option>
            <option value="rareness">Rareness Score</option>
            <option value="return">Best Return %</option>
          </select>
        </div>
      </div>

      {/* Grid of Real Collector Crypt Slabs */}
      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-slate-500 animate-pulse">
          Loading live Collector Crypt items from Brink's vault registry...
        </div>
      ) : cards.length === 0 ? (
        <div className="py-20 text-center font-mono text-xs text-slate-500">
          No Collector Crypt slabs found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const price = card.insuredUsd || card.costUsd || 0;
            const returnPct = card.returnPct || 0;
            const isProfit = returnPct >= 0;

            return (
              <div
                key={card.id}
                className="group relative rounded-2xl p-3.5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* PSA Header Label */}
                  <div className="mb-2 px-2.5 py-1 rounded-md bg-slate-950 border border-red-500/40 flex items-center justify-between text-[10px] font-mono">
                    <span className="font-extrabold text-red-500">PSA</span>
                    <span className="font-bold text-white truncate max-w-[120px]">{card.grade}</span>
                    <span className="text-emerald-400 font-bold">RWA</span>
                  </div>

                  {/* Artwork with Real Cloudfront Image */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/60 flex items-center justify-center p-2 border border-slate-800/80 mb-3">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-105 transition duration-300"
                    />

                    {card.rareness && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[9px] font-mono font-bold text-amber-400 flex items-center gap-1 shadow">
                        <Flame className="w-2.5 h-2.5 text-amber-500" />
                        Rare {card.rareness}/100
                      </div>
                    )}
                  </div>

                  {/* Title & Set */}
                  <h3 className="text-xs font-bold text-white line-clamp-2 min-h-[32px]" title={card.name}>
                    {card.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>{card.category || "TCG"}</span>
                    <span>Pop: {card.population?.atGrade || "N/A"}</span>
                  </div>

                  {/* Financial Values */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 font-mono">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Insured Valuation:</span>
                      <span className="text-sm font-black text-cyan-400">${price} USDC</span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span>Cost Basis: ${card.costUsd || price}</span>
                      <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                        {isProfit ? "+" : ""}{returnPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bridge Action Button */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCardForBridge(card);
                      setBridgeResult(null);
                      setBridgeError("");
                      if (vaults.length > 0) setTargetVaultId(String(vaults[0].id));
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-500/20"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Bridge to NEAR Vault
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bridge Modal */}
      {selectedCardForBridge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Bridge Collector Crypt Slab to NEAR
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Solana Brink's Vault ➔ NEAR Sub-Account NFT
                </p>
              </div>
              <button
                onClick={() => setSelectedCardForBridge(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {bridgeResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    RWA Slab Successfully Bridged to NEAR!
                  </div>
                  <p className="text-slate-300">
                    Card <span className="text-white font-bold">{selectedCardForBridge.name}</span> has been deposited into{" "}
                    <span className="text-cyan-400 font-bold">{bridgeResult.vault.sub_account}</span>.
                  </p>
                  <div className="pt-2 text-[10px] text-slate-400 space-y-1">
                    <div>• Solana Mint: <span className="text-indigo-400">{bridgeResult.solana_mint}</span></div>
                    <div>• Custody: <span className="text-amber-400">{bridgeResult.vault_custody}</span></div>
                    <div>• TX Hash: <span className="text-emerald-400">{bridgeResult.tx_hash}</span></div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCardForBridge(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBridgeSubmit} className="space-y-4">
                {bridgeError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 font-mono">
                    {bridgeError}
                  </div>
                )}

                {/* Selected Card Preview */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <img
                    src={selectedCardForBridge.imageUrl}
                    alt=""
                    className="w-12 h-16 object-contain rounded bg-black/40 p-1 border border-slate-800"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{selectedCardForBridge.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{selectedCardForBridge.grade}</div>
                    <div className="text-xs font-black text-cyan-400 font-mono mt-1">
                      Price: ${selectedCardForBridge.insuredUsd || selectedCardForBridge.costUsd} USDC
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                    Select Target NEAR Merchant Vault
                  </label>
                  <select
                    value={targetVaultId}
                    onChange={(e) => setTargetVaultId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {vaults.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.sub_account}) • Balance: ${v.usdc_balance} USDC
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                    Card cost will be deducted from this vault's USDC treasury.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified RWA Sealing Process
                  </div>
                  <div>• Authenticates PSA barcode & Solana Mint address</div>
                  <div>• Assigns NFT custody to target NEAR Sub-Account</div>
                  <div>• Updates Merchant Vault Dynamic SVG & Net PnL</div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCardForBridge(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bridgeLoading}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold transition disabled:opacity-50"
                  >
                    {bridgeLoading ? "Sealing & Bridging..." : "Confirm Bridge to NEAR"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
