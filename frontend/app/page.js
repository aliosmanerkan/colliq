"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import VaultCard from "@/components/VaultCard";
import CardSlab from "@/components/CardSlab";
import CollectorCryptCatalog from "@/components/CollectorCryptCatalog";
import TradingFloorTerminal from "@/components/TradingFloorTerminal";
import MintVaultModal from "@/components/MintVaultModal";
import TransferVaultModal from "@/components/TransferVaultModal";
import VaultDetailModal from "@/components/VaultDetailModal";
import ArchitectureSpecs from "@/components/ArchitectureSpecs";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { 
  Zap, 
  Plus, 
  Search, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Sparkles
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [vaults, setVaults] = useState([]);
  const [cards, setCards] = useState([]);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [nearStatus, setNearStatus] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [liveEvents, setLiveEvents] = useState([]);
  const [isTriggering, setIsTriggering] = useState(false);

  // Filter & Search
  const [vaultSearch, setVaultSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [vaultSort, setVaultSort] = useState("pnl_desc");

  // Modals
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [transferVault, setTransferVault] = useState(null);
  const [inspectVault, setInspectVault] = useState(null);

  // Fetch data
  const loadData = useCallback(async () => {
    try {
      const [vaultsRes, cardsRes, tradesRes, statsRes, nearRes] = await Promise.all([
        api.get("/vaults"),
        api.get("/market/cards"),
        api.get("/trades/history"),
        api.get("/market/stats"),
        api.get("/market/near-status"),
      ]);

      setVaults(vaultsRes.data?.vaults || []);
      setCards(cardsRes.data?.cards || []);
      setTrades(tradesRes.data?.trades || []);
      setStats(statsRes.data || null);
      setNearStatus(nearRes.data || null);
    } catch (err) {
      console.error("Failed to load platform data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();

    const socket = getSocket();

    const onConnect = () => setSocketStatus("connected");
    const onDisconnect = () => setSocketStatus("disconnected");

    const onMatchFound = (data) => {
      setLiveEvents((prev) => [
        {
          type: "match",
          speaker: "A2A MATCH ENGINE",
          message: `🎯 Target Match: ${data.vaultA.name} [${data.vaultA.sub_account}] matched with ${data.vaultB.name} [${data.vaultB.sub_account}]. Initializing 3-round negotiation...`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 40),
      ]);
    };

    const onRoundUpdate = (data) => {
      setLiveEvents((prev) => [
        {
          type: "round",
          speaker: `ROUND ${data.round} • ${data.log.speaker}`,
          message: data.log.message,
          decision: data.log.decision || (data.log.turn ? data.log.turn.decision : null),
          timestamp: Date.now(),
        },
        ...prev.slice(0, 40),
      ]);
    };

    const onTradeSettled = (data) => {
      setLiveEvents((prev) => [
        {
          type: "settled",
          speaker: "NEAR ATOMIC SETTLEMENT",
          message: `✅ Deals Settled! Cards & USDC swapped atomically in Internal Ledger. Both Merchant NFTs evolved on-chain.`,
          details: { txHash: data.trade?.tx_hash },
          timestamp: Date.now(),
        },
        ...prev.slice(0, 40),
      ]);
      loadData();
    };

    const onTradeRejected = (data) => {
      setLiveEvents((prev) => [
        {
          type: "rejected",
          speaker: "ON-CHAIN GUARDRAIL",
          message: `⚠️ Trade aborted by guardrails between ${data.vaultA} and ${data.vaultB}. Zero loss incurred.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 40),
      ]);
      loadData();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("a2a_match_found", onMatchFound);
    socket.on("a2a_round_update", onRoundUpdate);
    socket.on("a2a_trade_settled", onTradeSettled);
    socket.on("a2a_trade_rejected", onTradeRejected);

    if (socket.connected) setSocketStatus("connected");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("a2a_match_found", onMatchFound);
      socket.off("a2a_round_update", onRoundUpdate);
      socket.off("a2a_trade_settled", onTradeSettled);
      socket.off("a2a_trade_rejected", onTradeRejected);
    };
  }, [loadData]);

  const handleTriggerSwarm = async () => {
    setIsTriggering(true);
    try {
      await api.post("/trades/trigger-swarm");
    } catch (err) {
      console.error("Trigger swarm error:", err);
    } finally {
      setTimeout(() => setIsTriggering(false), 800);
    }
  };

  // Filtered Vaults
  const filteredVaults = useMemo(() => {
    return vaults
      .filter((v) => {
        const matchesSearch = 
          (v.name || "").toLowerCase().includes(vaultSearch.toLowerCase()) ||
          (v.sub_account || "").toLowerCase().includes(vaultSearch.toLowerCase());
        
        if (!matchesSearch) return false;
        if (tierFilter === "ALL") return true;
        return (v.tier || "").toUpperCase().includes(tierFilter.toUpperCase());
      })
      .sort((a, b) => {
        if (vaultSort === "pnl_desc") return (b.pnl_percentage || 0) - (a.pnl_percentage || 0);
        if (vaultSort === "aum_desc") {
          const aAum = (a.usdc_balance || 0) + (a.inventoryValueUsdc || 0);
          const bAum = (b.usdc_balance || 0) + (b.inventoryValueUsdc || 0);
          return bAum - aAum;
        }
        if (vaultSort === "trades_desc") return (b.total_trades || 0) - (a.total_trades || 0);
        return 0;
      });
  }, [vaults, vaultSearch, tierFilter, vaultSort]);

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col justify-between selection:bg-white selection:text-black font-sans antialiased">
      
      {/* Apple Studio Ambient Spotlight */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_70%)]" />
      </div>

      {/* Apple Navbar */}
      <Navbar
        stats={stats}
        nearStatus={nearStatus}
        onOpenMint={() => setIsMintOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full flex-1">
        
        {/* Apple Keynote Hero */}
        <section className="mb-16 sm:mb-20 text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>NEAR Track 10 • NFTs as Accounts</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">Agentic Pokémon Card Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-4xl leading-[1.08]">
            Card Marketplace & Autonomous AI Agents.
          </h1>

          <p className="text-lg sm:text-xl text-neutral-400 font-normal max-w-3xl mt-4 leading-relaxed">
            Buy verified physical PSA 10 slabs directly or mint a custom <strong className="text-white">Trading Agent (NEAR Sub-Account)</strong> that hunts and snipes cards on your terms 24/7.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`px-6 py-3 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 shadow-sm ${
                activeTab === "marketplace"
                  ? "bg-white text-black"
                  : "bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800"
              }`}
            >
              <span>🛍️ Marketplace</span>
            </button>

            <button
              onClick={() => setIsMintOpen(true)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Deploy Agent</span>
            </button>

            <button
              onClick={() => setActiveTab("trading-floor")}
              className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs sm:text-sm font-medium flex items-center gap-2 transition active:scale-95"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>⚡ Live Trading Floor</span>
            </button>
          </div>

          {/* Apple Bento Grid Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 w-full text-left">
            {/* Box 1 */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
              <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Protocol Volume</div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono mt-3">
                ${stats ? Number(stats.total_aum_usdc).toLocaleString() : "..."} <span className="text-xs text-neutral-500 font-normal">USDC</span>
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                USDC cash reserves + PSA slab custody
              </div>
            </div>

            {/* Box 2 */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
              <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Active Trading Agents</div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono mt-3">
                {stats ? stats.total_vaults : "..."} <span className="text-xs text-neutral-500 font-normal">Sub-Accounts</span>
              </div>
              <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                24/7 Autonomous Hunter Agents
              </div>
            </div>

            {/* Box 3 */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
              <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Brink's Physical Vault</div>
              <div className="text-2xl sm:text-3xl font-semibold text-white font-mono mt-3">
                {stats ? stats.total_cards : "..."} <span className="text-xs text-neutral-500 font-normal">Slabs</span>
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                Sealed PSA 10/9 RWA Certifications
              </div>
            </div>

            {/* Box 4 */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-[#0c0c0e] border border-white/[0.08] shadow-xl flex flex-col justify-between">
              <div className="text-xs uppercase text-neutral-500 font-medium tracking-wider">Settled Trades</div>
              <div className="text-2xl sm:text-3xl font-semibold text-emerald-400 font-mono mt-3">
                {stats ? stats.total_completed_trades : "..."} <span className="text-xs text-neutral-500 font-normal">Swaps & Snipes</span>
              </div>
              <div className="text-xs text-neutral-400 mt-2">
                Volume: ${stats ? Number(stats.total_volume_usdc).toLocaleString() : "0"} USDC
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: CARD MARKETPLACE (DEFAULT TAB) */}
        {activeTab === "marketplace" && (
          <CollectorCryptCatalog
            vaults={vaults}
            onCardBridged={() => loadData()}
            onOpenMint={() => setIsMintOpen(true)}
          />
        )}

        {/* Tab 2: AJANLARIM & KASALAR (MY AGENTS) */}
        {activeTab === "my-agents" && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>🤖 My Autonomous Agents & Vaults</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Autonomous trading accounts on NEAR Protocol. Each agent owns its own sub-account treasury, hunts target cards, and manages physical slab inventory.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsMintOpen(true)}
                  className="px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deploy Agent</span>
                </button>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={vaultSearch}
                    onChange={(e) => setVaultSearch(e.target.value)}
                    className="pl-9 pr-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/[0.3] font-sans w-44"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-full border border-neutral-800">
                  {["ALL", "Whale", "Shark", "Rookie"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTierFilter(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        tierFilter === t
                          ? "bg-white text-black font-semibold shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {filteredVaults.length === 0 ? (
              <div className="py-24 text-center text-xs text-neutral-500 bg-[#0c0c0e] rounded-[32px] border border-white/[0.08] space-y-3">
                <p>No active trading agents found.</p>
                <button
                  onClick={() => setIsMintOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold transition"
                >
                  + Deploy Your First Agent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVaults.map((vault) => (
                  <VaultCard
                    key={vault.id}
                    vault={vault}
                    onInspect={(v) => setInspectVault(v)}
                    onTransfer={(v) => setTransferVault(v)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 3: CANLI BORSA MASASI (TRADING FLOOR) */}
        {activeTab === "trading-floor" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>⚡ Live A2A Trading Floor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Watch autonomous AI agents negotiate peer-to-peer barter deals and snipe target slabs in real-time.
                </p>
              </div>

              <button
                onClick={loadData}
                className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <TradingFloorTerminal
              socketStatus={socketStatus}
              onTriggerCycle={handleTriggerSwarm}
              isTriggering={isTriggering}
              liveEvents={liveEvents}
              tradeHistory={trades}
            />
          </section>
        )}

        {/* Tab 4: HOW IT WORKS & SPECS */}
        {activeTab === "architecture" && <ArchitectureSpecs />}
      </main>

      {/* Modals */}
      <MintVaultModal
        isOpen={isMintOpen}
        onClose={() => setIsMintOpen(false)}
        onSuccess={() => loadData()}
      />

      <TransferVaultModal
        vault={transferVault}
        isOpen={!!transferVault}
        onClose={() => setTransferVault(null)}
        onSuccess={() => loadData()}
      />

      <VaultDetailModal
        vault={inspectVault}
        isOpen={!!inspectVault}
        onClose={() => setInspectVault(null)}
      />

      {/* Apple Footer */}
      <footer className="border-t border-neutral-900 bg-black py-10 text-xs text-neutral-500 font-sans mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-300 font-medium">VaultDeck Protocol</span>
            <span>•</span>
            <span>NEAR Hackathon Track 10 Submission</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <span>NEP-171 & NEP-177 Dynamic Accounts</span>
            <span>•</span>
            <span className="text-neutral-400">Brink's Sealed Custody</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
