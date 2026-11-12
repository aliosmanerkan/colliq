"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/assets/logo.png";
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
    <div className="sticky top-0 z-50 w-full bg-[#B9EFC6] border-b border-[#043021]/15 backdrop-blur-md">
      <header className="relative w-full px-6 sm:px-10 lg:px-14 xl:px-16 h-18 sm:h-20 flex items-center justify-between">

        {/* Left: Brand Logo from assets/logo.png */}
        <Link
          href="/"
          onClick={scrollToTop}
          className="cursor-pointer flex items-center select-none group"
        >
          <Image
            src={logoImg}
            alt="Colliq"
            priority
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
          />
        </Link>

        {/* Center: Exactly Centered Page Links with Reduced Font Size */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-8 text-xs sm:text-[13px] font-medium tracking-wide text-[#043224]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative py-1 transition-all flex items-center gap-1.5 ${
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
        <div className="flex items-center gap-2.5 sm:gap-3.5">

          {/* Wallet State Pill */}
          {accountId ? (
            <div className="flex items-center gap-1.5 bg-[#073525]/10 border border-[#043021]/20 rounded-full px-3 py-1.5 text-xs text-[#043224] font-mono shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span
                onClick={handleCopyAccount}
                className="max-w-[110px] sm:max-w-[140px] truncate cursor-pointer hover:underline font-medium text-[11px] sm:text-xs"
                title="Click to copy account ID"
              >
                {accountId}
              </span>

              <span className="text-[#043224]/50 hidden sm:inline">|</span>
              <span className="hidden sm:inline font-semibold text-[#043224] text-[11px] sm:text-xs">{nearBalance} Ⓝ</span>

              <button
                onClick={handleCopyAccount}
                className="text-[#043224]/70 hover:text-[#043224] ml-0.5 cursor-pointer"
                title="Copy account"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
              </button>

              <button
                onClick={signOutNearWallet}
                className="text-[#043224]/60 hover:text-rose-700 ml-0.5 transition cursor-pointer"
                title="Disconnect Wallet"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={showWalletModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#043021]/30 hover:border-[#043021] text-[#043224] text-xs font-medium transition active:scale-95 cursor-pointer bg-white/40 shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5 text-[#043224]" />
              <span>Connect</span>
            </button>
          )}

          {/* Mint Agent Button from Frame 1.png (Dark green pill with avatar circle) */}
          <button
            onClick={openMint}
            className="bg-[#073525] hover:bg-[#0a4531] text-white text-xs font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <span>Mint Agent</span>
            <div className="w-3.5 h-3.5 rounded-full border border-white/40 flex items-center justify-center">
              <User className="w-2 h-2 text-white" />
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
