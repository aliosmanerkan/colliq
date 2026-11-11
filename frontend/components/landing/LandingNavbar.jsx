"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function LandingNavbar() {
  const { openMint } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-[#09481E] border-b border-[#043021]/10">
      <header className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between">

        {/* Logo (8-Leaf Swirl / Pinwheel Icon in Figma) */}
        <div
          onClick={scrollToTop}
          className="cursor-pointer flex items-center gap-2 select-none group"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:rotate-45 duration-500">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-[#043224] fill-current"
            >
              <path d="M12 2C12.5 5 15 7.5 18 8C15 8.5 12.5 11 12 14C11.5 11 9 8.5 6 8C9 7.5 11.5 5 12 2Z" opacity="0.9" />
              <path d="M22 12C19 12.5 16.5 15 16 18C15.5 15 13 12.5 10 12C13 11.5 15.5 9 16 6C16.5 9 19 11.5 22 12Z" opacity="0.9" />
              <path d="M12 22C11.5 19 9 16.5 6 16C9 15.5 11.5 13 12 10C12.5 13 15 15.5 18 16C15 16.5 12.5 19 12 22Z" opacity="0.9" />
              <path d="M2 12C5 11.5 7.5 9 8 6C8.5 9 11 11.5 14 12C11 12.5 8.5 15 8 18C7.5 15 5 12.5 2 12Z" opacity="0.9" />
            </svg>
          </div>
          <span className="font-display text-xl sm:text-2xl tracking-wide uppercase text-[#043224] hidden sm:inline-block">
            Colliq
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="flex items-center gap-7 sm:gap-10 text-xs sm:text-sm font-medium text-[#043224]">
          <Link
            href="/marketplace"
            className="hover:opacity-70 transition cursor-pointer"
          >
            Marketplace
          </Link>
          <Link
            href="/portfolio"
            className="hover:opacity-70 transition cursor-pointer"
          >
            My Portfolio
          </Link>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:opacity-70 transition cursor-pointer"
          >
            How It Works
          </button>
        </nav>

        {/* Right Button: Mint Agent */}
        <button
          onClick={openMint}
          className="bg-[#073525] hover:bg-[#0a4531] text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <span>Mint Agent</span>
          <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
            <User className="w-2.5 h-2.5 text-white" />
          </div>
        </button>
      </header>
    </div>
  );
}
