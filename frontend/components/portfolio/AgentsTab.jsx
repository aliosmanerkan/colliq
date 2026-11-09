"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import VaultCard from "@/components/VaultCard";
import { useApp } from "@/context/AppContext";

export default function AgentsTab() {
  const { vaults, connectedAccount, openMint, openInspect, openTransfer, openChat } = useApp();

  const [agentScope, setAgentScope] = useState("my"); // "my" | "all"
  const [vaultSearch, setVaultSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [vaultSort, setVaultSort] = useState("pnl_desc");

  const filteredVaults = useMemo(() => {
    return vaults
      .filter((v) => {
        if (agentScope === "my" && connectedAccount) {
          const owner = (v.owner_account || "").toLowerCase();
          const conn = connectedAccount.toLowerCase();
          if (owner !== conn) return false;
        }

        const matchesSearch =
          v.name.toLowerCase().includes(vaultSearch.toLowerCase()) ||
          v.sub_account.toLowerCase().includes(vaultSearch.toLowerCase());

        const matchesTier = tierFilter === "ALL" || v.tier === tierFilter;
        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        if (vaultSort === "pnl_desc") return (b.pnl_percentage || 0) - (a.pnl_percentage || 0);
        if (vaultSort === "aum_desc") return (b.usdc_balance || 0) - (a.usdc_balance || 0);
        if (vaultSort === "trades_desc") return (b.total_trades || 0) - (a.total_trades || 0);
        return 0;
      });
  }, [vaults, agentScope, connectedAccount, vaultSearch, tierFilter, vaultSort]);

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="text-sm font-medium text-neutral-600">
          Active Trading Agents ({filteredVaults.length})
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Switcher: My Vaults vs All Protocol */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-neutral-200/80 shadow-sm">
            <button
              onClick={() => setAgentScope("my")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                agentScope === "my"
                  ? "bg-[#073525] text-white font-semibold shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              My Vaults
            </button>
            <button
              onClick={() => setAgentScope("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                agentScope === "all"
                  ? "bg-[#073525] text-white font-semibold shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              All Network Vaults
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search agents..."
              value={vaultSearch}
              onChange={(e) => setVaultSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-full bg-white border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#073525] font-sans w-48 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-neutral-200/80 shadow-sm">
            {["ALL", "Whale", "Shark", "Rookie"].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  tierFilter === t
                    ? "bg-[#073525] text-white font-semibold shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            value={vaultSort}
            onChange={(e) => setVaultSort(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs text-neutral-700 focus:outline-none focus:border-[#073525] cursor-pointer shadow-sm"
          >
            <option value="pnl_desc">Highest Return</option>
            <option value="aum_desc">Highest Treasury</option>
            <option value="trades_desc">Most Trades</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredVaults.length === 0 ? (
        <div className="py-24 text-center text-xs text-neutral-600 bg-white rounded-[28px] border border-neutral-200/80 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-4">
          <p>
            {agentScope === "my" && connectedAccount 
              ? `No active trading agents found under ${connectedAccount}.`
              : "No active trading agents found in this view."}
          </p>
          <button
            onClick={openMint}
            className="px-6 py-2.5 rounded-full bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold transition cursor-pointer shadow-md"
          >
            Mint New Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onInspect={openInspect}
              onTransfer={openTransfer}
              onChat={openChat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
