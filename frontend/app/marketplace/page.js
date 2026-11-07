"use client";

import MarketplaceHero from "@/components/marketplace/MarketplaceHero";
import CollectorCryptCatalog from "@/components/CollectorCryptCatalog";
import { useApp } from "@/context/AppContext";

export default function MarketplacePage() {
  const { vaults, loadData, openMint } = useApp();

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      <MarketplaceHero />
      <CollectorCryptCatalog
        vaults={vaults}
        onCardBridged={() => loadData()}
        onOpenMint={openMint}
      />
    </div>
  );
}
