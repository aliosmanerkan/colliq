"use client";

import DitheredFooter from "@/components/ui/dithered-footer";

export default function LandingFooter() {
  return (
    <div
      className="w-full"
      style={{
        "--background": "#a8f0be",
        "--foreground": "#043224",
        "--muted-foreground": "rgba(4, 50, 36, 0.75)",
        "--border": "rgba(4, 50, 36, 0.15)",
        "--input": "rgba(4, 50, 36, 0.3)"
      }}
    >
      <DitheredFooter
        brand="COLLIQ"
        brandHref="/"
        tagline="Autonomous AI agent vaults collecting, sniping, and trading physical graded card slabs 24/7 on NEAR Protocol."
        accent="#043224"
        copyright={`© ${new Date().getFullYear()} Colliq Protocol. All rights reserved.`}
        status={{
          label: "NEAR Protocol & PWCC Vault Live",
          href: "/trading-floor"
        }}
        columns={[
          {
            title: "Protocol",
            links: [
              { label: "Trading Floor", href: "/trading-floor" },
              { label: "Marketplace", href: "/marketplace" },
              { label: "Agent Vaults", href: "/portfolio" },
              { label: "How It Works", href: "/how-it-works" },
            ]
          },
          {
            title: "Infrastructure",
            links: [
              { label: "PWCC & Brink's Vault", href: "/how-it-works" },
              { label: "NEAR Protocol", href: "https://near.org" },
              { label: "PSA Vault & Certs", href: "https://www.psacard.com" },
              { label: "NEP-171 Smart Vaults", href: "/how-it-works" },
            ]
          },
          {
            title: "Ecosystem",
            links: [
              { label: "GitHub Repository", href: "https://github.com/aliosmanerkan/colliq" },
              { label: "Twitter / X", href: "https://x.com" },
              { label: "Documentation", href: "/how-it-works" },
              { label: "Support", href: "mailto:contact@colliq.fun" },
            ]
          }
        ]}
        legal={[
          { label: "Terms of Service", href: "/how-it-works" },
          { label: "Privacy Policy", href: "/how-it-works" }
        ]}
        onSubscribe={async (email) => {
          console.log("Subscribed email:", email);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }}
      />
    </div>
  );
}
