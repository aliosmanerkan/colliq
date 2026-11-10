"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { initNearWallet } from "@/lib/near";
import MintVaultModal from "@/components/MintVaultModal";
import TransferVaultModal from "@/components/TransferVaultModal";
import VaultDetailModal from "@/components/VaultDetailModal";
import AgentChatModal from "@/components/AgentChatModal";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [vaults, setVaults] = useState([]);
  const [cards, setCards] = useState([]);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [nearStatus, setNearStatus] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [liveEvents, setLiveEvents] = useState([]);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isMintOpen, setIsMintOpen] = useState(false);
  const [transferVault, setTransferVault] = useState(null);
  const [inspectVault, setInspectVault] = useState(null);
  const [chatVault, setChatVault] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);

  // Trigger manual A2A trading cycle
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

  // Fetch all core platform data with resilient Promise.allSettled
  const loadData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        api.get("/vaults"),
        api.get("/market/cards"),
        api.get("/trades/history"),
        api.get("/market/stats"),
        api.get("/market/near-status"),
      ]);

      const [vaultsRes, cardsRes, tradesRes, statsRes, nearRes] = results;

      if (vaultsRes.status === "fulfilled") {
        setVaults(vaultsRes.value.data?.vaults || []);
      }
      if (cardsRes.status === "fulfilled") {
        setCards(cardsRes.value.data?.cards || []);
      }
      if (tradesRes.status === "fulfilled") {
        const fetchedTrades = tradesRes.value.data?.trades || [];
        setTrades(fetchedTrades);

        // Pre-hydrate liveEvents on initial load so terminal is immediately active
        setLiveEvents((prev) => {
          if (prev.length > 0) return prev;
          const preloaded = [];
          for (const t of fetchedTrades.slice(0, 4)) {
            const txHash = t.tx_hash || "0x9482bf...38a";
            preloaded.push({
              id: `settled-${t.id || t.trade_id}`,
              type: "settled",
              speaker: "NEAR ATOMIC SETTLEMENT",
              message: `⚡ Consensus locked! Parity swap executed between ${t.vault_a_name} and ${t.vault_b_name}.`,
              details: { txHash },
              timestamp: new Date(t.createdAt).getTime() || Date.now(),
            });
            if (Array.isArray(t.negotiation_log)) {
              for (const round of t.negotiation_log) {
                preloaded.push({
                  id: `round-${t.id}-${round.round}`,
                  type: "round",
                  speaker: `${round.agent || "Agent"} (Round ${round.round})`,
                  message: round.turn?.public_argument || "Barter terms proposed.",
                  decision: round.turn?.decision || null,
                  timestamp: new Date(t.createdAt).getTime() || Date.now(),
                });
              }
            }
          }
          return preloaded;
        });
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data || null);
      }
      if (nearRes.status === "fulfilled") {
        setNearStatus(nearRes.value.data || null);
      }
    } catch (err) {
      console.error("Failed to load platform data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    let walletSub = null;
    initNearWallet().then((w) => {
      if (!w) return;
      if (w.accountId) setConnectedAccount(w.accountId);
      if (w.selector) {
        walletSub = w.selector.store.observable.subscribe((state) => {
          const active = state.accounts.find((a) => a.active)?.accountId || state.accounts[0]?.accountId || null;
          setConnectedAccount(active);
        });
      }
    });

    const socket = getSocket();

    const onConnect = () => setSocketStatus("connected");
    const onDisconnect = () => setSocketStatus("disconnected");

    const onMatchFound = (data) => {
      const nameA = data.vaultA?.name || "Agent A";
      const nameB = data.vaultB?.name || "Agent B";
      setLiveEvents((prev) => [
        {
          id: `match-${Date.now()}-${Math.random()}`,
          type: "match",
          speaker: "A2A MATCHMAKER",
          message: `🤝 Pair Matched: ${nameA} ⇄ ${nameB} entered atomic negotiation channel.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
    };

    const onRoundUpdate = (data) => {
      setLiveEvents((prev) => [
        {
          id: `round-${Date.now()}-${Math.random()}`,
          type: "round",
          speaker: `${data.log?.speaker || "Agent"} (Round ${data.round || 1})`,
          message: data.log?.message || "",
          decision: data.log?.decision || null,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
    };

    const onTradeSettled = (data) => {
      const buyer = data.buyer || "Agent A";
      const seller = data.seller || "Agent B";
      const txHash = data.txHash || data.trade?.tx_hash || "0x9482bf...38a";
      setLiveEvents((prev) => [
        {
          id: `settled-${Date.now()}-${Math.random()}`,
          type: "settled",
          speaker: "NEAR ATOMIC SETTLEMENT",
          message: `⚡ Consensus locked! Parity swap executed between ${buyer} and ${seller}. NEAR state synchronized.`,
          details: { txHash },
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
      loadData();
    };

    const onTelemetry = (data) => {
      setLiveEvents((prev) => [
        {
          id: `telemetry-${Date.now()}-${Math.random()}`,
          type: "telemetry",
          speaker: data.speaker || data.category || "SYSTEM",
          message: data.message,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
    };

    const onTradeEvent = (data) => {
      setLiveEvents((prev) => [
        {
          id: `evt-${Date.now()}-${Math.random()}`,
          type: "settled",
          speaker: "A2A ENGINE",
          message: `Deal locked: ${data.vaultA} swapped with ${data.vaultB}! Card: ${data.cardTitle || "PSA Slab"}.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
      loadData();
    };

    const onTradeRejected = (data) => {
      setLiveEvents((prev) => [
        {
          id: `evt-${Date.now()}-${Math.random()}`,
          type: "rejected",
          speaker: "SMART CONTRACT SAFETY",
          message: `⚠️ Trade declined by agent safety rules between ${data.vaultA} and ${data.vaultB}. Zero loss incurred.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
      loadData();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("a2a_match_found", onMatchFound);
    socket.on("a2a_round_update", onRoundUpdate);
    socket.on("a2a_trade_settled", onTradeSettled);
    socket.on("a2a_telemetry", onTelemetry);
    socket.on("trade:event", onTradeEvent);
    socket.on("trade:rejected", onTradeRejected);
    socket.on("vault:created", () => loadData());
    socket.on("vault:updated", () => loadData());

    return () => {
      if (walletSub?.unsubscribe) walletSub.unsubscribe();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("a2a_match_found", onMatchFound);
      socket.off("a2a_round_update", onRoundUpdate);
      socket.off("a2a_trade_settled", onTradeSettled);
      socket.off("a2a_telemetry", onTelemetry);
      socket.off("trade:event", onTradeEvent);
      socket.off("trade:rejected", onTradeRejected);
      socket.off("vault:created");
      socket.off("vault:updated");
    };
  }, [loadData]);

  // Modal helper methods
  const openMint = () => setIsMintOpen(true);
  const closeMint = () => setIsMintOpen(false);

  const openTransfer = (vault) => setTransferVault(vault);
  const closeTransfer = () => setTransferVault(null);

  const openInspect = (vault) => setInspectVault(vault);
  const closeInspect = () => setInspectVault(null);

  const openChat = (vault) => setChatVault(vault);
  const closeChat = () => setChatVault(null);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        vaults,
        cards,
        trades,
        stats,
        nearStatus,
        socketStatus,
        liveEvents,
        connectedAccount,
        isTriggering,
        handleTriggerSwarm,
        loadData,
        openMint,
        closeMint,
        openTransfer,
        closeTransfer,
        openInspect,
        closeInspect,
        openChat,
        closeChat,
      }}
    >
      {children}

      {/* Global Modals Mounted at Root */}
      <MintVaultModal
        isOpen={isMintOpen}
        onClose={closeMint}
        onSuccess={() => loadData()}
      />

      <TransferVaultModal
        vault={transferVault}
        isOpen={!!transferVault}
        onClose={closeTransfer}
        onSuccess={() => loadData()}
      />

      <VaultDetailModal
        vault={inspectVault}
        isOpen={!!inspectVault}
        onClose={closeInspect}
        onOpenChat={(v) => openChat(v)}
      />

      <AgentChatModal
        vault={chatVault}
        isOpen={!!chatVault}
        onClose={closeChat}
        onRulesUpdated={() => loadData()}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
