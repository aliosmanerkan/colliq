"use client";

import { useEffect, useState, useCallback } from "react";
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
  Coins, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  Zap, 
  Sparkles,
  ArrowRightLeft
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("vaults");
  const [vaults, setVaults] = useState([]);
  const [cards, setCards] = useState([]);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [nearStatus, setNearStatus] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [liveEvents, setLiveEvents] = useState([]);
  const [isTriggering, setIsTriggering] = useState(false);

  // Modals
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [transferVault, setTransferVault] = useState(null);
  const [inspectVault, setInspectVault] = useState(null);

  // Fetch initial data
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

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-cyan-600/10 to-transparent blur-[160px]" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[300px] bg-purple-600/10 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        stats={stats}
        nearStatus={nearStatus}
        onOpenMint={() => setIsMintOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Protocol Hero & Metrics Header */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  NEAR Hackathon Track 10: NFTs as Accounts
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  NEP-171 & NEP-177 Dynamic
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                VaultDeck Protocol
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Autonomous Merchant Vault NFTs on NEAR. Each NFT owns its own sub-account (<code>vault-&lt;id&gt;.market.near</code>), 
                USDC cash, PSA Pokémon slabs, and trades peer-to-peer via A2A Barter.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTriggerSwarm}
                disabled={isTriggering}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition active:scale-95 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isTriggering ? "animate-spin" : ""}`} />
                {isTriggering ? "Agents Negotiating..." : "Trigger A2A Swarm"}
              </button>
            </div>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-slate-400">Total Protocol AUM</div>
              <div className="text-xl font-black text-cyan-400 font-mono mt-1">
                ${stats ? Number(stats.total_aum_usdc).toLocaleString() : "..."} USDC
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Cash + Graded Slabs
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-slate-400">Merchant Vaults</div>
              <div className="text-xl font-black text-white font-mono mt-1">
                {stats ? stats.total_vaults : "..."} Sub-Accounts
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                100% Active Agents
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-slate-400">RWA Slabs in Custody</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-1">
                {stats ? stats.total_cards : "..."} PSA Slabs
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Brink's / Collector Crypt
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-slate-400">Settled A2A Trades</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                {stats ? stats.total_completed_trades : "..."} Deals
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Vol: ${stats ? Number(stats.total_volume_usdc).toLocaleString() : "0"} USDC
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: Merchant Vaults (Business-in-a-Box) */}
        {activeTab === "vaults" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Autonomous Merchant Vaults (Business-in-a-Box)
                </h2>
                <p className="text-xs text-slate-400">
                  Each NFT holds its own treasury, cards, and AI trading logic. Transferring the NFT transfers the entire business.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map((vault) => (
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  onInspect={(v) => setInspectVault(v)}
                  onTransfer={(v) => setTransferVault(v)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tab 2: Live A2A Trading Floor */}
        {activeTab === "trading-floor" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                A2A (Agent-to-Agent) Swarm Trading Floor
              </h2>
              <p className="text-xs text-slate-400">
                Stateless RAM worker loads agents for 2-second barter negotiation cycles and settles deals atomically on NEAR.
              </p>
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

        {/* Tab 3: RWA Slabs (Collector Crypt) */}
        {activeTab === "rwa-cards" && (
          <CollectorCryptCatalog
            vaults={vaults}
            onCardBridged={() => loadData()}
          />
        )}

        {/* Tab 4: Architecture & Audit Specs */}
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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>VaultDeck Protocol • NEAR Hackathon Track 10 Submission</span>
          </div>
          <div>Autonomous Merchant Vault NFTs as Accounts (NEP-171 / NEP-177)</div>
        </div>
      </footer>
    </div>
  );
}
