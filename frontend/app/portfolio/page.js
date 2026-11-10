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
  const { vaults, cards, trades, connectedAccount, isLoading } = useApp();

  const userAccount = (connectedAccount || "alierkan.testnet").toLowerCase();
  const myVaults = vaults.filter((v) => (v.owner_account || "").toLowerCase() === userAccount);
  const myVaultIds = myVaults.map((v) => v.id);
  const myCards = cards.filter(
    (c) => (c.vault_id && myVaultIds.includes(c.vault_id)) || (c.owner_account || "").toLowerCase() === userAccount
  );
  const myTrades = trades.filter((t) => myVaultIds.includes(t.vault_a_id) || myVaultIds.includes(t.vault_b_id));

  if (isLoading && vaults.length === 0) {
    return (
      <section className="space-y-8 animate-in fade-in duration-200">
        <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] animate-pulse space-y-4">
          <div className="h-6 w-48 bg-neutral-200/80 rounded-full" />
          <div className="h-10 w-72 bg-neutral-200/80 rounded-xl" />
          <div className="h-4 w-96 bg-neutral-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] animate-pulse space-y-3">
              <div className="h-4 w-24 bg-neutral-200/80 rounded" />
              <div className="h-8 w-32 bg-neutral-300/80 rounded" />
              <div className="h-3 w-28 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

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
