"use client";

import { useState } from "react";
import { Bot, Layers, Clock } from "lucide-react";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import AgentsTab from "@/components/portfolio/AgentsTab";
import SlabsTab from "@/components/portfolio/SlabsTab";
import ActivityTab from "@/components/portfolio/ActivityTab";
import { useApp } from "@/context/AppContext";

export default function PortfolioPage() {
  const [portfolioTab, setPortfolioTab] = useState("agents"); // "agents" | "slabs" | "activity"
  const { vaults, cards, trades, connectedAccount } = useApp();

  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const myVaults = vaults.filter((v) => (v.owner_account || "").toLowerCase() === userAccount);
  const myVaultIds = myVaults.map((v) => v.id);
  const myCards = cards.filter(
    (c) => (c.vault_id && myVaultIds.includes(c.vault_id)) || (c.owner_account || "").toLowerCase() === userAccount
  );
  const myTrades = trades.filter((t) => myVaultIds.includes(t.vault_a_id) || myVaultIds.includes(t.vault_b_id));

  return (
    <section className="space-y-8 animate-in fade-in duration-200">
      <PortfolioHero />

      {/* Pill Segmented Control: Agents | Slabs | Activity */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-full border border-neutral-200/80 shadow-sm w-fit">
        <button
          onClick={() => setPortfolioTab("agents")}
          className={`px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            portfolioTab === "agents"
              ? "bg-[#073525] text-white font-semibold shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>My AI Agents ({myVaults.length})</span>
        </button>

        <button
          onClick={() => setPortfolioTab("slabs")}
          className={`px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            portfolioTab === "slabs"
              ? "bg-[#073525] text-white font-semibold shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>My Cards ({myCards.length})</span>
        </button>

        <button
          onClick={() => setPortfolioTab("activity")}
          className={`px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            portfolioTab === "activity"
              ? "bg-[#073525] text-white font-semibold shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Trade History ({myTrades.length})</span>
        </button>
      </div>

      {/* Selected Tab Content */}
      {portfolioTab === "agents" && <AgentsTab />}
      {portfolioTab === "slabs" && <SlabsTab />}
      {portfolioTab === "activity" && <ActivityTab />}
    </section>
  );
}
