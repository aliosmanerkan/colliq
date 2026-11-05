"use client";

import { useEffect, useState } from "react";
import { Shield, Sparkles, Plus, Wallet, Cpu, Layers, LogOut, CheckCircle2 } from "lucide-react";
import { initNearWallet, showWalletModal, signOutNearWallet, getLiveNearAccountBalance } from "@/lib/near";

export default function Navbar({ stats, onOpenMint, activeTab, setActiveTab, nearStatus }) {
  const [accountId, setAccountId] = useState(null);
  const [nearBalance, setNearBalance] = useState("0.00");

  useEffect(() => {
    initNearWallet().then(async (wallet) => {
      if (wallet?.accountId) {
        setAccountId(wallet.accountId);
        const bal = await getLiveNearAccountBalance(wallet.accountId);
        setNearBalance(bal);
      }
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090d16]/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white font-mono">VaultDeck</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Track 10
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Block #{nearStatus?.latest_block_height || "276,376,000"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab("vaults")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "vaults"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Merchant Vaults
          </button>
          <button
            onClick={() => setActiveTab("trading-floor")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "trading-floor"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live A2A Swarm
          </button>
          <button
            onClick={() => setActiveTab("rwa-cards")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "rwa-cards"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            RWA Slabs (Collector Crypt)
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "architecture"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Audit & Specs
          </button>
        </nav>

        {/* Right Actions & Real NEAR Wallet */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Mint Vault NFT
          </button>

          {accountId ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right">
                <div className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-[120px]">
                  {accountId}
                </div>
                <div className="text-[11px] font-bold text-white font-mono">
                  {nearBalance} NEAR
                </div>
              </div>
              <button
                onClick={signOutNearWallet}
                title="Disconnect Wallet"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 flex items-center justify-center border border-slate-700 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={showWalletModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-mono font-bold transition active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              Connect NEAR Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
