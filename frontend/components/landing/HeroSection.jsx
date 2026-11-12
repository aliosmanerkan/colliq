"use client";

import { ArrowDown } from "lucide-react";
import CardDeckCarousel from "@/components/ui/card-deck-carousel";

const HERO_SLIDES = [
  {
    title: "Umbreon VMAX Alt Art",
    caption: "2021 Sword & Shield Evolving Skies #095 • PSA 10 GEM MINT",
    category: "POKÉMON",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/0-FzbklxvfIW5mDxeRSvEyNOvPGNEXUyX9MlC9yhQL0",
  },
  {
    title: "Victor Wembanyama",
    caption: "2024 Select Red Cracked Ice #9 • BGS 9.5 GEM MINT",
    category: "BASKETBALL",
    grade: "BGS 9.5",
    image: "https://d1xpxki1g4htqu.cloudfront.net/EJdMbFfNw7OQqXfX8xy1sltkRPNLLYHiZ4Sje35g7Xc",
  },
  {
    title: "Monkey D. Luffy",
    caption: "2024 Japanese OP10-Royal Blood #118 • PSA 10 GEM MINT",
    category: "ONE PIECE",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/8XvsjvOW3LVp6Xc11hpdOqGJKplvdnKFmUXE_QpmRaM",
  },
  {
    title: "Erling Haaland",
    caption: "2019 Topps Chrome UCL Refractor #74 • PSA 10 GEM MINT",
    category: "SOCCER",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/r4IQK2YWC0ifjt_RYc0qAp6XYL11txw_Z8D7KmolAVk",
  },
  {
    title: "Vegeta Super",
    caption: "2024 Fusion World Ultra Limit #FB04 • PSA 10 GEM MINT",
    category: "DRAGON BALL",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/artJj-xOwwJImBoZiISjwQgNthArvkc04CXjjKqbxVo",
  },
  {
    title: "Ahri Inquisitive",
    caption: "2025 Riftbound: LoL Origins #119 • PSA 10 GEM MINT",
    category: "RIFTBOUND",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/PK1u0vlSgsfenNDlOmNiJet7mFNQCilirk-7bkOElkA",
  },
  {
    title: "Matas Buzelis",
    caption: "2024 Panini Prizm Rookie #252 • PSA 10 GEM MINT",
    category: "BASKETBALL",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/9YlvyUt8SCWbr8q9ERu3x8zkDAYl1RgU_9G-BHGG8sc",
  },
  {
    title: "Heimerdinger Inventor",
    caption: "2025 Riftbound: LoL Origins #111a • PSA 10 GEM MINT",
    category: "RIFTBOUND",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/bm5X8EBprVb1whSmQo1s1u_MKhNPcO2EJgkODujzwuY",
  },
];

export default function HeroSection() {
  const scrollToCollections = () => {
    const el = document.getElementById("hot-collections");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-[#B9EFC6] min-h-[calc(100vh-4.5rem)] sm:min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full flex-1 flex flex-col justify-between py-6 sm:py-8 lg:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center w-full my-auto py-4 sm:py-6">

          {/* Left: Huge Display Typography */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1 className="font-squada text-5xl sm:text-7xl lg:text-[5.4rem] xl:text-[6.2rem] text-[#09481E] leading-[0.93] tracking-normal uppercase select-none">
              THE FUTURE<br />
              OF COLLECTING<br />
              IS AGENTIC.
            </h1>
          </div>

          {/* Right: Card Deck Carousel with Timed Auto Throw */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
            <div className="w-full max-w-[270px] sm:max-w-[310px] lg:max-w-[340px]">
              <CardDeckCarousel
                slides={HERO_SLIDES}
                cardWidth="100%"
                aspect="1 / 1.63"
                scatter={8}
                autoplay={3200}
                showButtons={false}
                showCount={false}
                showCaption={false}
                showMeta={false}
                showBadge={false}
                background="transparent"
                ink="#043224"
              />
            </div>
          </div>

        </div>

        {/* Bottom Center: See Collections Prompt */}
        <div className="flex flex-col items-center justify-center pt-3 pb-2 text-[#043224] shrink-0 select-none">
          <button
            onClick={scrollToCollections}
            className="group flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Scroll to collections"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#043224]/20 animate-ping pointer-events-none" />
              <div className="relative w-8 h-8 rounded-full border border-[#043224]/30 bg-[#043224]/10 flex items-center justify-center shadow-sm group-hover:bg-[#043224]/20 group-hover:border-[#043224]/60 transition-all duration-300">
                <ArrowDown className="w-4 h-4 text-[#043224] animate-bounce" />
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#043224]/90 group-hover:text-[#043224] transition-colors">
              See collections
            </span>
          </button>
        </div>

      </div>
    </section>
  );
}
