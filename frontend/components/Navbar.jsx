"use client";

import { useEffect, useState } from "react";
import { 
  Sparkles, 
  Plus, 
  Wallet, 
  Cpu, 
  Layers, 
  LogOut, 
  Activity, 
  ShieldCheck, 
  Menu, 
  X, 
  Check, 
  Copy,
  ChevronDown
} from "lucide-react";
import { initNearWallet, showWalletModal, signOutNearWallet, getLiveNearAccountBalance } from "@/lib/near";

export default function Navbar({ stats, onOpenMint, activeTab, setActiveTab, nearStatus }) {
  const [accountId, setAccountId] = useState(null);
  const [nearBalance, setNearBalance] = useState("0.00");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initNearWallet().then(async (wallet) => {
      if (wallet?.accountId) {
        setAccountId(wallet.accountId);
        const bal = await getLiveNearAccountBalance(wallet.accountId);
        setNearBalance(bal);
      }
    });
  }, []);

  const handleCopyAccount = (e) => {
    e.stopPropagation();
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: "marketplace", label: "Marketplace" },
    { id: "my-agents", label: "My Agents" },
    { id: "trading-floor", label: "Trading Floor", isLive: true },
    { id: "architecture", label: "How It Works" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/75 backdrop-blur-3xl border-b border-white/[0.08] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        
        {/* Apple Brand Identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab("marketplace")}
            className="cursor-pointer group flex items-center gap-2.5 select-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-neutral-400 p-[1px] flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-semibold tracking-tight text-white font-sans">
                VaultDeck
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-400">
                Track 10
              </span>
            </div>
          </div>

          {/* Apple Status Capsule */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-950/80 border border-white/[0.08] text-[11px] text-neutral-400 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-neutral-300 font-medium">NEAR</span>
            <span className="text-neutral-600">•</span>
            <span className="font-mono text-[10px]">#{nearStatus?.latest_block_height || "276,376,000"}</span>
          </div>
        </div>

        {/* Center Apple-style Segmented Nav Control */}
        <nav className="hidden lg:flex items-center bg-neutral-950/90 p-1 rounded-full border border-white/[0.08] shadow-inner">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {item.isLive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-emerald-400"} animate-pulse`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Apple Pill Buttons & Wallet */}
        <div className="flex items-center gap-2.5">
          {/* Primary CTA (Apple White Pill) */}
          <button
            onClick={onOpenMint}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Deploy Agent</span>
          </button>

          {/* Account Widget */}
          {accountId ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-white/[0.1] text-xs">
              <div 
                onClick={handleCopyAccount}
                className="cursor-pointer group flex items-center gap-2 select-none"
                title="Click to copy account ID"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-neutral-600 to-neutral-400 text-[10px] font-bold text-white flex items-center justify-center">
                  {accountId.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-white truncate max-w-[90px]">
                    {accountId}
                  </span>
                </div>
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="text-[10px] font-mono text-neutral-400 font-medium">
                    {nearBalance} N
                  </span>
                )}
              </div>

              <div className="h-3 w-[1px] bg-neutral-800" />

              <button
                onClick={signOutNearWallet}
                title="Disconnect"
                className="text-neutral-500 hover:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={showWalletModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/[0.1] text-white text-xs font-medium transition active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5 text-neutral-300" />
              <span>Connect</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-full bg-neutral-900 border border-white/[0.1] text-neutral-300 hover:text-white transition"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-black/95 border-b border-neutral-900 space-y-2 backdrop-blur-3xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-xs font-medium flex items-center justify-between transition ${
                    isActive
                      ? "bg-white text-black font-semibold"
                      : "bg-neutral-900/80 text-neutral-300 border border-neutral-800"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              onOpenMint();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Deploy Agent</span>
          </button>
        </div>
      )}
    </header>
  );
}
