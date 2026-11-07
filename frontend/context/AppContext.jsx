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

  // Fetch all core platform data
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

    const onTradeEvent = (data) => {
      setLiveEvents((prev) => [
        {
          id: `evt-${Date.now()}-${Math.random()}`,
          type: "trade",
          speaker: "A2A ENGINE",
          message: `Deal locked: ${data.vaultA} swapped with ${data.vaultB}! Card: ${data.cardTitle || "PSA Slab"}.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 40),
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
        ...prev.slice(0, 40),
      ]);
      loadData();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("trade:event", onTradeEvent);
    socket.on("trade:rejected", onTradeRejected);
    socket.on("vault:created", () => loadData());
    socket.on("vault:updated", () => loadData());

    return () => {
      if (walletSub?.unsubscribe) walletSub.unsubscribe();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
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
