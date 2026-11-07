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
  const { vaults, cards, trades } = useApp();

  return (
    <section className="space-y-8 animate-in fade-in duration-200">
      <PortfolioHero />

      {/* Apple Pill Segmented Control: Agents | Slabs | Activity */}
      <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-full border border-white/[0.08] w-fit">
        <button
          onClick={() => setPortfolioTab("agents")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            portfolioTab === "agents"
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>My Agents ({vaults.length})</span>
        </button>

        <button
          onClick={() => setPortfolioTab("slabs")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            portfolioTab === "slabs"
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Vaulted Slabs ({cards.length})</span>
        </button>

        <button
          onClick={() => setPortfolioTab("activity")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            portfolioTab === "activity"
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent Activity & Purchases ({trades.length + cards.length})</span>
        </button>
      </div>

      {/* Selected Tab Content */}
      {portfolioTab === "agents" && <AgentsTab />}
      {portfolioTab === "slabs" && <SlabsTab />}
      {portfolioTab === "activity" && <ActivityTab />}
    </section>
  );
}
