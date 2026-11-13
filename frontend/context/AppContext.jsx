"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { initNearWallet } from "@/lib/near";
import MintVaultModal from "@/components/MintVaultModal";
import TransferVaultModal from "@/components/TransferVaultModal";
import AgentCommandStudioModal from "@/components/AgentCommandStudioModal";

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
  const [isSniping, setIsSniping] = useState(false);
  const [liveNegotiation, setLiveNegotiation] = useState(null);

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

  // Trigger manual Collector Crypt market snipe cycle
  const handleTriggerSnipe = async () => {
    setIsSniping(true);
    try {
      await api.post("/trades/trigger-sniper");
    } catch (err) {
      console.error("Trigger snipe error:", err);
    } finally {
      setTimeout(() => setIsSniping(false), 800);
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
            const isRejected = t.status === "REJECTED_GUARDRAIL";
            const txHash = t.tx_hash || "8kPn7W...9xY";

            if (isRejected) {
              preloaded.push({
                id: `rejected-${t.id || t.trade_id}`,
                type: "rejected",
                speaker: "AGENT GUARDRAILS",
                message: `[DECLINED] Trade declined: Terms exceeded safety limits between ${t.vault_a_name} and ${t.vault_b_name}.`,
                timestamp: new Date(t.createdAt).getTime() || Date.now(),
              });
            } else {
              preloaded.push({
                id: `settled-${t.id || t.trade_id}`,
                type: "settled",
                speaker: "NEAR SETTLEMENT",
                message: `[COMPLETED] Trade agreed. Card swap executed between ${t.vault_a_name} and ${t.vault_b_name}.`,
                details: { txHash },
                timestamp: new Date(t.createdAt).getTime() || Date.now(),
              });
            }

            if (Array.isArray(t.negotiation_log)) {
              for (const round of t.negotiation_log) {
                preloaded.push({
                  id: `round-${t.id}-${round.round}`,
                  type: "round",
                  speaker: `${round.agent || "Agent"} (Round ${round.round})`,
                  message: round.turn?.public_argument || "Offer proposed.",
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
      const nameA = data.vaultA?.name || data.vaultA?.sub_account || "Agent 1";
      const nameB = data.vaultB?.name || data.vaultB?.sub_account || "Agent 2";
      setLiveEvents((prev) => [
        {
          id: `match-${Date.now()}-${Math.random()}`,
          type: "match",
          speaker: "MATCHMAKER",
          message: `[MATCHED] ${nameA} ⇄ ${nameB} started a card trade negotiation.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);

      const cardA = data.cardA || data.cards_from_a?.[0] || null;
      const cardB = data.cardB || data.cards_from_b?.[0] || null;

      setLiveNegotiation({
        id: data.sessionId || `live-${Date.now()}`,
        trade_id: data.sessionId || `live-${Date.now()}`,
        isLiveStreaming: true,
        status: "NEGOTIATING",
        vault_a_id: data.vaultA?.id,
        vault_b_id: data.vaultB?.id,
        vault_a_name: data.vaultA?.name || data.vaultA?.sub_account || "Agent 1",
        vault_b_name: data.vaultB?.name || data.vaultB?.sub_account || "Agent 2",
        vault_a_owner: data.vaultA?.owner_id || data.vaultA?.owner_account,
        vault_b_owner: data.vaultB?.owner_id || data.vaultB?.owner_account,
        cards_from_a: cardA ? [cardA] : [],
        cards_from_b: cardB ? [cardB] : [],
        card_a_name: cardA?.name || "Card 1",
        card_a_image: cardA?.image_url,
        card_a_company: cardA?.grading_company,
        card_a_grade: cardA?.grade,
        card_a_oracle: cardA?.oracle_price || cardA?.oracle_fair_value_usdc,
        card_b_name: cardB?.name || "Card 2",
        card_b_image: cardB?.image_url,
        card_b_company: cardB?.grading_company,
        card_b_grade: cardB?.grade,
        card_b_oracle: cardB?.oracle_price || cardB?.oracle_fair_value_usdc,
        usdc_from_a: 0,
        usdc_from_b: 0,
        activeSpeaker: data.activeSpeaker || data.vaultA?.name || data.vaultA?.sub_account || "Agent 1",
        activeRound: data.activeRound || 1,
        negotiation_log: [],
        createdAt: new Date().toISOString()
      });
    };

    const onRoundUpdate = (data) => {
      setLiveEvents((prev) => [
        {
          id: `round-${Date.now()}-${Math.random()}`,
          type: "round",
          speaker: `${data.log?.speaker || data.agent || "Agent"} (Round ${data.round || 1})`,
          message: data.turn?.public_argument || data.log?.message || "",
          decision: data.turn?.decision || data.log?.decision || null,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);

      setLiveNegotiation((prev) => {
        if (!prev) return null;
        const newRound = {
          round: data.round,
          agent: data.agent || data.log?.speaker || prev.vault_a_name,
          sub_account: data.sub_account || data.agent || prev.vault_a_name,
          turn: data.turn || {
            decision: data.log?.decision || "COUNTER",
            public_argument: data.log?.message || "",
            offer_usdc: data.offer_usdc || 0,
            private_reasoning_for_owner: data.turn?.private_reasoning_for_owner || ""
          }
        };

        const existingLogs = prev.negotiation_log || [];
        const filtered = existingLogs.filter((r) => r.round !== data.round);
        const updatedLogs = [...filtered, newRound].sort(
          (a, b) => (Number(a.round) || 0) - (Number(b.round) || 0)
        );

        const currentOffer =
          data.offer_usdc !== undefined
            ? Number(data.offer_usdc)
            : data.turn?.offer_usdc !== undefined
            ? Number(data.turn.offer_usdc)
            : prev.usdc_from_a;

        return {
          ...prev,
          negotiation_log: updatedLogs,
          rounds_count: updatedLogs.length,
          usdc_from_a: currentOffer,
          activeSpeaker: data.nextSpeaker !== undefined ? data.nextSpeaker : prev.activeSpeaker,
          activeRound: data.nextRound !== undefined ? data.nextRound : (data.round + 1)
        };
      });
    };

    const onTradeSettled = (data) => {
      const buyer = data.buyer || "Agent 1";
      const seller = data.seller || "Agent 2";
      const txHash = data.txHash || data.trade?.tx_hash || "8kPn7W...9xY";
      setLiveEvents((prev) => [
        {
          id: `settled-${Date.now()}-${Math.random()}`,
          type: "settled",
          speaker: "NEAR SETTLEMENT",
          message: `[COMPLETED] Trade agreed. Card swap executed between ${buyer} and ${seller}. NEAR state synchronized.`,
          details: { txHash },
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
      setLiveNegotiation(null);
      loadData();
    };

    const onTradeEvent = (data) => {
      setLiveEvents((prev) => [
        {
          id: `evt-${Date.now()}-${Math.random()}`,
          type: "settled",
          speaker: "TRADE ENGINE",
          message: `[COMPLETED] Trade completed: ${data.vaultA} swapped cards with ${data.vaultB}. Card: ${data.cardTitle || "Graded Card"}.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
      setLiveNegotiation(null);
      loadData();
    };

    const onTradeRejected = (data) => {
      setLiveEvents((prev) => [
        {
          id: `rejected-${Date.now()}-${Math.random()}`,
          type: "rejected",
          speaker: "AGENT GUARDRAILS",
          message: data.reason 
            ? `[DECLINED] ${data.reason}` 
            : `[DECLINED] Trade declined by agent safety rules between ${data.vaultA || data.buyer} and ${data.vaultB || data.seller}. Zero loss incurred.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 50),
      ]);
      setLiveNegotiation(null);
      loadData();
    };

    const onMarketSnipe = (data) => {
      const vName = data.vault?.name || "Agent";
      const cName = data.card?.name || "Graded Card";
      const price = data.price ? `$${Number(data.price).toFixed(2)} USDC` : "Market Price";
      setLiveEvents((prev) => [
        {
          id: `snipe-${Date.now()}-${Math.random()}`,
          type: "snipe",
          speaker: "MARKET PURCHASE",
          message: `[PURCHASE] ${vName} acquired ${cName} for ${price}. Graded physical slab secured in Brink's / PWCC vault.`,
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
    socket.on("a2a_trade_rejected", onTradeRejected);
    socket.on("market_snipe", onMarketSnipe);
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
      socket.off("a2a_trade_rejected", onTradeRejected);
      socket.off("market_snipe", onMarketSnipe);
      socket.off("trade:event", onTradeEvent);
      socket.off("trade:rejected", onTradeRejected);
      socket.off("vault:created");
      socket.off("vault:updated");
    };
  }, [loadData]);

  // Modal helper methods (Unified Agent Command Studio)
  const [studioInitialTab, setStudioInitialTab] = useState("directives");
  const openMint = () => setIsMintOpen(true);
  const closeMint = () => setIsMintOpen(false);

  const openTransfer = (vault) => setTransferVault(vault);
  const closeTransfer = () => setTransferVault(null);

  const openInspect = (vault) => {
    setStudioInitialTab("inventory");
    setInspectVault(vault);
  };
  const closeInspect = () => setInspectVault(null);

  const openChat = (vault) => {
    setStudioInitialTab("directives");
    setChatVault(vault);
  };
  const closeChat = () => setChatVault(null);

  const activeStudioVault = inspectVault || chatVault;
  const closeStudio = () => {
    setInspectVault(null);
    setChatVault(null);
  };

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
        liveNegotiation,
        connectedAccount,
        isTriggering,
        handleTriggerSwarm,
        isSniping,
        handleTriggerSnipe,
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

      <AgentCommandStudioModal
        vault={activeStudioVault}
        isOpen={!!activeStudioVault}
        onClose={closeStudio}
        initialTab={studioInitialTab}
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
