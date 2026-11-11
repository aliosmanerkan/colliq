"use client";

import { useState } from "react";
import MarketplaceHero from "@/components/marketplace/MarketplaceHero";
import CollectorCryptCatalog from "@/components/CollectorCryptCatalog";
import { useApp } from "@/context/AppContext";

export default function MarketplacePage() {
  const { vaults, loadData, openMint } = useApp();
  const [totalSlabs, setTotalSlabs] = useState(171386);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <MarketplaceHero totalSlabs={totalSlabs} />
      <CollectorCryptCatalog
        vaults={vaults}
        onCardBridged={() => loadData()}
        onOpenMint={openMint}
        onTotalSlabsChange={(count) => {
          if (count > 0) setTotalSlabs(count);
        }}
      />
    </div>
  );
}
