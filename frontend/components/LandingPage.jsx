"use client";

import HeroSection from "@/components/landing/HeroSection";
import HotCollections from "@/components/landing/HotCollections";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BuiltForNearSection from "@/components/landing/BuiltForNearSection";
import FaqSection from "@/components/landing/FaqSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="w-full bg-white text-neutral-900 font-sans selection:bg-[#073525] selection:text-white">
      <HeroSection />
      <HotCollections />
      <HowItWorksSection />
      <BuiltForNearSection />
      <FaqSection />
      <LandingFooter />
    </div>
  );
}
