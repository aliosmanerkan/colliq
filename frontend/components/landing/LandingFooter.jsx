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
        brand="Acme"
        brandHref="/"
        tagline="Tools for teams who ship. Built in the open, one release at a time."
        accent="#043224"
        copyright={`© ${new Date().getFullYear()} Acme, Inc.`}
        columns={[
          {
            title: "Product",
            links: [
              { label: "Features", href: "/marketplace" },
              { label: "Pricing", href: "/marketplace" },
              { label: "Changelog", href: "/trading-floor" },
              { label: "Roadmap", href: "/how-it-works" },
            ]
          },
          {
            title: "Resources",
            links: [
              { label: "Docs", href: "/how-it-works" },
              { label: "Guides", href: "/how-it-works" },
              { label: "Community", href: "https://x.com" },
              { label: "Blog", href: "/marketplace" },
            ]
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "/how-it-works" },
              { label: "Careers", href: "/portfolio" },
              { label: "Contact", href: "mailto:contact@colliq.xyz" },
              { label: "Press", href: "/how-it-works" },
            ]
          }
        ]}
        onSubscribe={async (email) => {
          console.log("Subscribed email:", email);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }}
      />
    </div>
  );
}
