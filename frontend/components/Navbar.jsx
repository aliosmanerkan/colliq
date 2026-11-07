"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Wallet, 
  LogOut, 
  Copy, 
  Check, 
  Menu, 
  X 
} from "lucide-react";
import { initNearWallet, showWalletModal, signOutNearWallet, getLiveNearAccountBalance } from "@/lib/near";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const [accountId, setAccountId] = useState(null);
  const [nearBalance, setNearBalance] = useState("0.00");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pathname = usePathname();
  const { openMint, nearStatus } = useApp();

  useEffect(() => {
    let subscription = null;

    initNearWallet().then(async (wallet) => {
      if (!wallet) return;

      const syncAccount = async (accId) => {
        setAccountId(accId);
        if (accId) {
          const bal = await getLiveNearAccountBalance(accId);
          setNearBalance(bal);
        } else {
          setNearBalance("0.00");
        }
      };

      if (wallet.accountId) {
        await syncAccount(wallet.accountId);
      }

      if (wallet.selector) {
        subscription = wallet.selector.store.observable.subscribe(async (state) => {
          const activeAccount = state.accounts.find((a) => a.active)?.accountId || state.accounts[0]?.accountId || null;
          await syncAccount(activeAccount);
        });
      }
    });

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const handleCopyAccount = (e) => {
    e.stopPropagation();
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: "marketplace", href: "/marketplace", label: "Marketplace" },
    { id: "portfolio", href: "/portfolio", label: "My Portfolio" },
    { id: "trading-floor", href: "/trading-floor", label: "Trading Floor", isLive: true },
    { id: "how-it-works", href: "/how-it-works", label: "How It Works" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-[#a8f0be] border-b border-[#043021]/15 backdrop-blur-md">
      <header className="w-full px-6 sm:px-10 lg:px-14 xl:px-16 h-20 sm:h-22 flex items-center justify-between">
        
        {/* Left: 8-Leaf Swirl / Pinwheel Logo from Frame 1.png */}
        <Link 
          href="/"
          onClick={scrollToTop}
          className="cursor-pointer flex items-center gap-2.5 select-none group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:rotate-45 duration-500">
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-[#043224] fill-current"
            >
              <path d="M12 2C12.5 5 15 7.5 18 8C15 8.5 12.5 11 12 14C11.5 11 9 8.5 6 8C9 7.5 11.5 5 12 2Z" opacity="0.9" />
              <path d="M22 12C19 12.5 16.5 15 16 18C15.5 15 13 12.5 10 12C13 11.5 15.5 9 16 6C16.5 9 19 11.5 22 12Z" opacity="0.9" />
              <path d="M12 22C11.5 19 9 16.5 6 16C9 15.5 11.5 13 12 10C12.5 13 15 15.5 18 16C15 16.5 12.5 19 12 22Z" opacity="0.9" />
              <path d="M2 12C5 11.5 7.5 9 8 6C8.5 9 11 11.5 14 12C11 12.5 8.5 15 8 18C7.5 15 5 12.5 2 12Z" opacity="0.9" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#043224] hidden sm:inline-block">
            VaultDeck
          </span>
        </Link>

        {/* Center: Clean Text Links from Frame 1.png */}
        <nav className="hidden md:flex items-center gap-8 sm:gap-11 text-sm sm:text-base font-medium text-[#043224]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative py-1.5 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "font-bold text-[#022319] border-b-2 border-[#043224]"
                    : "hover:opacity-75"
                }`}
              >
                <span>{item.label}</span>
                {item.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Wallet & Mint Agent Button (Matching Frame 1.png) */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Wallet State Pill */}
          {accountId ? (
            <div className="flex items-center gap-1.5 bg-[#073525]/10 border border-[#043021]/20 rounded-full px-3.5 py-1.5 text-xs sm:text-sm text-[#043224] font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span 
                onClick={handleCopyAccount}
                className="max-w-[120px] sm:max-w-[160px] truncate cursor-pointer hover:underline font-medium"
                title="Click to copy account ID"
              >
                {accountId}
              </span>

              <span className="text-[#043224]/50 hidden sm:inline">|</span>
              <span className="hidden sm:inline font-semibold text-[#043224]">{nearBalance} Ⓝ</span>

              <button
                onClick={handleCopyAccount}
                className="text-[#043224]/70 hover:text-[#043224] ml-0.5 cursor-pointer"
                title="Copy account"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={signOutNearWallet}
                className="text-[#043224]/60 hover:text-rose-700 ml-1 transition cursor-pointer"
                title="Disconnect Wallet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={showWalletModal}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#043021]/30 hover:border-[#043021] text-[#043224] text-xs sm:text-sm font-medium transition active:scale-95 cursor-pointer bg-white/40 shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5 text-[#043224]" />
              <span>Connect</span>
            </button>
          )}

          {/* Mint Agent Button from Frame 1.png (Dark green pill with avatar circle) */}
          <button
            onClick={openMint}
            className="bg-[#073525] hover:bg-[#0a4531] text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <span>Mint Agent</span>
            <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
              <User className="w-2.5 h-2.5 text-white" />
            </div>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-[#043224] hover:bg-[#043224]/10 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 bg-[#a8f0be] border-b border-[#043021]/20 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive ? "text-[#022319] font-bold" : "text-[#043224]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#043021]/20 flex flex-col gap-2">
            {!accountId && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  showWalletModal();
                }}
                className="w-full py-2.5 rounded-full border border-[#043021] text-[#043224] text-xs font-medium flex items-center justify-center gap-1.5 bg-white/50"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Meteor Wallet</span>
              </button>
            )}
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openMint();
              }}
              className="w-full py-2.5 rounded-full bg-[#073525] text-white text-xs font-medium flex items-center justify-center gap-2"
            >
              <span>Mint Agent</span>
              <User className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
