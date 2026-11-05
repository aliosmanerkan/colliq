export function generateVaultDynamicSvg(vault, inventoryCount = 0, inventoryValue = 0) {
    const isLocked = vault.is_locked;
    const pnlPositive = (vault.pnl_percentage || 0) >= 0;
    const pnlColor = pnlPositive ? "#10b981" : "#ef4444";
    const pnlSign = pnlPositive ? "+" : "";

    // Tier based styling
    let tierBadge = "ROOKIE TRADER";
    let tierColorStart = "#3b82f6";
    let tierColorEnd = "#1d4ed8";
    let borderAccent = "#60a5fa";

    if (vault.tier === "CERTIFIED_MERCHANT") {
        tierBadge = "CERTIFIED MERCHANT";
        tierColorStart = "#8b5cf6";
        tierColorEnd = "#6d28d9";
        borderAccent = "#c084fc";
    } else if (vault.tier === "WHALE_VAULT") {
        tierBadge = "WHALE VAULT";
        tierColorStart = "#f59e0b";
        tierColorEnd = "#b45309";
        borderAccent = "#fbbf24";
    } else if (vault.tier === "LEGENDARY_DECK") {
        tierBadge = "LEGENDARY DECK";
        tierColorStart = "#ec4899";
        tierColorEnd = "#be185d";
        borderAccent = "#f472b6";
    }

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 640" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="50%" stop-color="#050811" />
      <stop offset="100%" stop-color="#020408" />
    </linearGradient>

    <!-- Border Tier Gradient -->
    <linearGradient id="tierBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${borderAccent}" />
      <stop offset="50%" stop-color="${tierColorStart}" />
      <stop offset="100%" stop-color="${tierColorEnd}" />
    </linearGradient>

    <!-- Holographic Header Foil -->
    <linearGradient id="holoFoil" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${tierColorStart}" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${tierColorEnd}" stop-opacity="0.8" />
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    .title { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; font-weight: 800; fill: #ffffff; font-size: 20px; }
    .subaccount { font-family: 'Courier New', monospace; font-size: 13px; fill: #38bdf8; font-weight: 600; }
    .tier { font-family: system-ui, sans-serif; font-weight: 800; font-size: 10px; fill: #ffffff; letter-spacing: 1.5px; }
    .label { font-family: system-ui, sans-serif; font-size: 11px; fill: #94a3b8; font-weight: 500; }
    .val { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 700; fill: #f8fafc; font-size: 17px; }
    .pnl { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 800; fill: ${pnlColor}; font-size: 20px; }
    .badge-text { font-family: system-ui, sans-serif; font-weight: 700; font-size: 9px; fill: #ffffff; }
  </style>

  <!-- Outer Card Frame -->
  <rect x="10" y="10" width="430" height="620" rx="24" fill="url(#bgGrad)" stroke="url(#tierBorder)" stroke-width="3" filter="drop-shadow(0px 10px 30px rgba(0,0,0,0.8))" />

  <!-- Holographic Top Ribbon -->
  <rect x="25" y="25" width="400" height="42" rx="12" fill="url(#holoFoil)" opacity="0.9" />
  <text x="45" y="51" class="tier">${tierBadge}</text>
  <circle cx="395" cy="46" r="6" fill="${isLocked ? '#f59e0b' : '#10b981'}" filter="url(#glow)" />

  <!-- Header Info -->
  <text x="35" y="105" class="title">${vault.name || 'Merchant Vault'}</text>
  <text x="35" y="128" class="subaccount">${vault.sub_account || 'vault.market.near'}</text>

  <!-- Central Chip / AI Merchant Graphic -->
  <rect x="35" y="150" width="380" height="200" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
  
  <!-- Circuit Grid Pattern -->
  <path d="M 50 170 L 120 170 L 150 200 L 320 200 L 350 170 L 400 170" stroke="#334155" stroke-width="1.5" fill="none" opacity="0.6"/>
  <path d="M 50 330 L 140 330 L 170 300 L 300 300 L 330 330 L 400 330" stroke="#334155" stroke-width="1.5" fill="none" opacity="0.6"/>

  <!-- Center Core Ring -->
  <circle cx="225" cy="250" r="48" fill="#1e1b4b" stroke="url(#tierBorder)" stroke-width="2.5" />
  <circle cx="225" cy="250" r="32" fill="#312e81" opacity="0.7" />
  
  <!-- Robot/Chip Icon in Center -->
  <polygon points="225,232 240,242 240,260 225,270 210,260 210,242" fill="#38bdf8" />
  <text x="225" y="254" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff" font-family="monospace">AI</text>

  <!-- Strategy Label inside graphic -->
  <rect x="135" y="318" width="180" height="22" rx="11" fill="#1e293b" stroke="#334155" />
  <text x="225" y="333" text-anchor="middle" class="badge-text" fill="#94a3b8">${vault.strategy || 'BALANCED_TRADER'}</text>

  <!-- Financial Metrics Grid -->
  <!-- Box 1: PnL % -->
  <rect x="35" y="370" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b" />
  <text x="50" y="394" class="label">NET PNL (ALL TIME)</text>
  <text x="50" y="426" class="pnl">${pnlSign}${(vault.pnl_percentage || 0).toFixed(1)}%</text>

  <!-- Box 2: USDC Treasury -->
  <rect x="233" y="370" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b" />
  <text x="248" y="394" class="label">USDC CASH VAULT</text>
  <text x="248" y="425" class="val">$${Number(vault.usdc_balance || 0).toLocaleString()} USDC</text>

  <!-- Box 3: Total Trades -->
  <rect x="35" y="456" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b" />
  <text x="50" y="480" class="label">SETTLED TRADES</text>
  <text x="50" y="511" class="val">${vault.total_trades || 0} Deals</text>

  <!-- Box 4: RWA Inventory -->
  <rect x="233" y="456" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b" />
  <text x="248" y="480" class="label">RWA CARDS HELD</text>
  <text x="248" y="511" class="val">${inventoryCount} Slabs <tspan font-size="12" fill="#64748b">($${Number(inventoryValue).toLocaleString()})</tspan></text>

  <!-- Footer Guardrails & Status -->
  <rect x="35" y="546" width="380" height="52" rx="12" fill="#090d16" stroke="#1e293b" />
  <text x="52" y="568" class="label">ON-CHAIN GUARDRAIL</text>
  <text x="52" y="586" font-family="monospace" font-size="11" fill="#38bdf8">Max Spend: $${vault.guardrail_max_spend_per_trade || 300} | Min Fair Val: ${vault.guardrail_min_oracle_fair_value_pct || 80}%</text>

  <circle cx="390" cy="572" r="5" fill="${isLocked ? '#f59e0b' : '#10b981'}" />
  <text x="375" y="575" text-anchor="end" font-size="10" font-weight="bold" fill="${isLocked ? '#f59e0b' : '#10b981'}" font-family="system-ui">
    ${isLocked ? 'MUTEX LOCKED' : 'READY TO TRADE'}
  </text>
</svg>
    `.trim();

    return svg;
}
