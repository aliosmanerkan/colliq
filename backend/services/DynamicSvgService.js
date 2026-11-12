export function generateVaultDynamicSvg(vault, inventoryCount = 0, inventoryValue = 0) {
    const isLocked = vault.is_locked;
    const isListed = vault.is_listed_for_sale;
    const pnlPositive = (vault.pnl_percentage || 0) >= 0;
    const pnlColor = pnlPositive ? "#a8f0be" : "#fca5a5";
    const pnlSign = pnlPositive ? "+" : "";

    const usdcBal = Number(vault.usdc_balance || 0);
    const invVal = Number(inventoryValue || 0);
    const totalNav = usdcBal + invVal;
    const netPnlUsdc = Number(vault.net_pnl_usdc || 0);
    const pnlPct = Number(vault.pnl_percentage || 0).toFixed(1);
    const guardrail = Number(vault.guardrail_max_spend_per_trade || 300);

    // Status Badge Logic
    let statusText = "ACTIVE";
    let statusBg = "#a8f0be";
    let statusTextFill = "#043224";

    if (isListed) {
        statusText = "LISTED FOR SALE";
        statusBg = "#e3fb71";
        statusTextFill = "#043224";
    } else if (isLocked) {
        statusText = "MUTEX LOCKED";
        statusBg = "#f59e0b";
        statusTextFill = "#04281c";
    }

    const keyDisplay = vault.access_key_public
        ? (vault.access_key_public.length > 34 ? vault.access_key_public.substring(0, 32) + "..." : vault.access_key_public)
        : "ed25519:scoped-key";

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 620" width="100%" height="100%">
  <defs>
    <!-- Background Gradient: Corporate Deep Emerald -->
    <linearGradient id="colliqBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#053b2a" />
      <stop offset="60%" stop-color="#03271c" />
      <stop offset="100%" stop-color="#021d15" />
    </linearGradient>

    <!-- Certificate Border Frame Gradient -->
    <linearGradient id="certBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a8f0be" />
      <stop offset="50%" stop-color="#053b2a" />
      <stop offset="100%" stop-color="#e3fb71" />
    </linearGradient>

    <!-- NAV Panel Gradient -->
    <linearGradient id="navPanel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#074431" />
      <stop offset="100%" stop-color="#042e21" />
    </linearGradient>

    <!-- Metric Box Gradient -->
    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#063d2c" />
      <stop offset="100%" stop-color="#03261b" />
    </linearGradient>
  </defs>

  <style>
    .brand-title { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 11px; fill: #a8f0be; letter-spacing: 2px; }
    .status-text { font-family: system-ui, sans-serif; font-weight: 800; font-size: 9px; fill: ${statusTextFill}; letter-spacing: 0.8px; }
    .agent-name { font-family: system-ui, -apple-system, sans-serif; font-weight: 800; fill: #ffffff; font-size: 23px; letter-spacing: -0.3px; }
    .subaccount { font-family: 'Courier New', Courier, monospace; font-size: 12px; fill: #a8f0be; font-weight: 600; }
    .nav-label { font-family: system-ui, sans-serif; font-size: 10px; fill: #a8f0be; font-weight: 700; letter-spacing: 1.5px; }
    .nav-val { font-family: system-ui, -apple-system, sans-serif; font-weight: 800; fill: #ffffff; font-size: 28px; }
    .nav-unit { font-size: 13px; font-weight: 600; fill: #a8f0be; }
    .pnl-pill-text { font-family: system-ui, sans-serif; font-weight: 700; font-size: 11px; fill: ${pnlColor}; }
    .card-label { font-family: system-ui, sans-serif; font-size: 9.5px; fill: rgba(168, 240, 190, 0.75); font-weight: 600; letter-spacing: 1px; }
    .card-val { font-family: system-ui, sans-serif; font-weight: 700; fill: #ffffff; font-size: 15px; }
    .card-sub { font-size: 11px; fill: #a8f0be; font-weight: 500; }
    .footer-label { font-family: system-ui, sans-serif; font-size: 9px; fill: rgba(251, 253, 252, 0.6); font-weight: 500; }
    .footer-mono { font-family: 'Courier New', Courier, monospace; font-size: 10px; fill: #e3fb71; font-weight: 600; }
    .custody-text { font-family: system-ui, sans-serif; font-size: 9.5px; fill: #a8f0be; font-weight: 600; letter-spacing: 0.5px; }
  </style>

  <!-- Outer Card Frame (Curved Financial Settee / Security Certificate) -->
  <rect x="10" y="10" width="430" height="600" rx="24" fill="url(#colliqBg)" stroke="url(#certBorder)" stroke-width="2" />

  <!-- Inner Fine Guilloché / Security Inset Border -->
  <rect x="20" y="20" width="410" height="580" rx="18" fill="none" stroke="rgba(168, 240, 190, 0.22)" stroke-width="1" stroke-dasharray="6,3" />

  <!-- Top Ribbon: Colliq 8-Pointed Star Logo + Protocol Mandate -->
  <g transform="translate(32, 34)">
    <!-- 8-Pointed Swirl / Star Logo -->
    <g transform="scale(0.85)">
      <path d="M12 2C12.5 5 15 7.5 18 8C15 8.5 12.5 11 12 14C11.5 11 9 8.5 6 8C9 7.5 11.5 5 12 2Z" fill="#a8f0be" opacity="0.95" />
      <path d="M22 12C19 12.5 16.5 15 16 18C15.5 15 13 12.5 10 12C13 11.5 15.5 9 16 6C16.5 9 19 11.5 22 12Z" fill="#a8f0be" opacity="0.95" />
      <path d="M12 22C11.5 19 9 16.5 6 16C9 15.5 11.5 13 12 10C12.5 13 15 15.5 18 16C15 16.5 12.5 19 12 22Z" fill="#a8f0be" opacity="0.95" />
      <path d="M2 12C5 11.5 7.5 9 8 6C8.5 9 11 11.5 14 12C11 12.5 8.5 15 8 18C7.5 15 5 12.5 2 12Z" fill="#a8f0be" opacity="0.95" />
    </g>
    <text x="32" y="16" class="brand-title">NEP-171 EXECUTABLE VAULT ACCOUNT</text>
  </g>

  <!-- Status Badge (Top Right) -->
  <g transform="translate(305, 34)">
    <rect x="0" y="0" width="112" height="24" rx="12" fill="${statusBg}" />
    <text x="56" y="15" text-anchor="middle" class="status-text">${statusText}</text>
  </g>

  <!-- Divider Line -->
  <line x1="32" y1="74" x2="418" y2="74" stroke="rgba(168, 240, 190, 0.18)" stroke-width="1" />

  <!-- Agent Identification -->
  <text x="32" y="106" class="agent-name">${vault.name || 'Merchant Vault'}</text>
  <text x="32" y="127" class="subaccount">@${vault.sub_account || 'vault.colliq.testnet'}</text>

  <!-- Central Total NAV Box -->
  <rect x="32" y="145" width="386" height="110" rx="18" fill="url(#navPanel)" stroke="#0a523b" stroke-width="1.5" />
  
  <text x="50" y="174" class="nav-label">TOTAL NET ASSET VALUE (NAV)</text>
  <text x="50" y="210" class="nav-val">$${totalNav.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <tspan class="nav-unit">USDC</tspan></text>
  
  <!-- Net PnL Pill inside NAV box -->
  <g transform="translate(50, 224)">
    <rect x="0" y="0" width="140" height="20" rx="10" fill="rgba(168, 240, 190, 0.12)" stroke="${pnlColor}" stroke-width="0.8" />
    <text x="70" y="14" text-anchor="middle" class="pnl-pill-text">Net PnL: ${pnlSign}${pnlPct}% (${pnlSign}$${netPnlUsdc.toFixed(2)})</text>
  </g>

  <!-- Strategy Badge (Right inside NAV box) -->
  <g transform="translate(262, 162)">
    <rect x="0" y="0" width="140" height="22" rx="11" fill="rgba(227, 251, 113, 0.15)" stroke="#e3fb71" stroke-width="0.8" />
    <text x="70" y="15" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#e3fb71" letter-spacing="1px">${vault.strategy || 'BALANCED_TRADER'}</text>
  </g>

  <!-- 2x2 Financial Indicators Grid -->
  <!-- Box 1: Liquid USDC Reserve -->
  <g transform="translate(32, 270)">
    <rect x="0" y="0" width="186" height="74" rx="14" fill="url(#boxGrad)" stroke="#094e38" stroke-width="1" />
    <text x="16" y="24" class="card-label">LIQUID USDC RESERVE</text>
    <text x="16" y="52" class="card-val">$${usdcBal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</text>
  </g>

  <!-- Box 2: Enclosed RWA Slabs -->
  <g transform="translate(232, 270)">
    <rect x="0" y="0" width="186" height="74" rx="14" fill="url(#boxGrad)" stroke="#094e38" stroke-width="1" />
    <text x="16" y="24" class="card-label">ENCLOSED RWA SLABS</text>
    <text x="16" y="52" class="card-val">${inventoryCount} Slabs <tspan class="card-sub">($${invVal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })})</tspan></text>
  </g>

  <!-- Box 3: Settled Trades -->
  <g transform="translate(32, 356)">
    <rect x="0" y="0" width="186" height="74" rx="14" fill="url(#boxGrad)" stroke="#094e38" stroke-width="1" />
    <text x="16" y="24" class="card-label">SETTLED TRADES</text>
    <text x="16" y="52" class="card-val">${vault.total_trades || 0} Trades</text>
  </g>

  <!-- Box 4: Single-Trade Guardrail -->
  <g transform="translate(232, 356)">
    <rect x="0" y="0" width="186" height="74" rx="14" fill="url(#boxGrad)" stroke="#094e38" stroke-width="1" />
    <text x="16" y="24" class="card-label">SINGLE-TRADE GUARDRAIL</text>
    <text x="16" y="52" class="card-val">$${guardrail.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <tspan class="card-sub">Max Spend</tspan></text>
  </g>

  <!-- Security Verification Panel (Bottom) -->
  <rect x="32" y="445" width="386" height="90" rx="16" fill="#032117" stroke="#0a523b" stroke-width="1" />
  
  <text x="48" y="470" class="footer-label">SCOPED FUNCTION-CALL KEY (ED25519)</text>
  <text x="48" y="488" class="footer-mono">${keyDisplay}</text>

  <line x1="48" y1="502" x2="402" y2="502" stroke="rgba(168, 240, 190, 0.12)" stroke-width="1" />

  <text x="48" y="522" class="custody-text">Custody: PWCC / Brink's Vault • NEAR Chain Signatures MPC</text>

  <!-- Bottom Certificate Footer Seal -->
  <g transform="translate(32, 558)">
    <circle cx="8" cy="8" r="4" fill="#a8f0be" />
    <text x="22" y="12" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="rgba(251, 253, 252, 0.7)">Colliq Autonomous Merchant Vault Protocol • Certified On-Chain</text>
  </g>
</svg>
    `.trim();

    return svg;
}
