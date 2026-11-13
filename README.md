# Colliq — Autonomous Merchant Vault NFTs on NEAR Protocol

> **NEAR Protocol Hackathon — Track 10: NFTs as Accounts (`nfts`)**  
> *Also qualifying for:* **AI Swarms (`swarms`)**, **Agent Economy (`agents`)**, **AI Security & Defense (`security`)**, **Autonomous Business (`business`)**, and **Real-World Money (`realworld`)**.  
> Physical-Backed RWA Graded Slabs (171,000+ via Collector Crypt & Brink's Vault) meets Executable Account Abstraction, OpenRouter Multi-Agent Negotiation Swarms, and Confidential Server-Guarded Merchant Directives.

[![NEAR Protocol](https://img.shields.io/badge/NEAR-Testnet%20Verified-00EC97?logo=near&logoColor=black)](https://testnet.nearblocks.io/address/colliq.testnet)
[![Track 10: NFTs as Accounts](https://img.shields.io/badge/NEAR%20Hackathon-Track%2010%20(NFTs%20as%20Accounts)-6366f1)](#)
[![Track 05: AI Swarms](https://img.shields.io/badge/NEAR%20Hackathon-Track%2005%20(AI%20Swarms)-10b981)](#)
[![Track 06: AI Security](https://img.shields.io/badge/NEAR%20Hackathon-Track%2006%20(AI%20Security)-f59e0b)](#)
[![Standards](https://img.shields.io/badge/Standards-NEP--171%20%7C%20NEP--177%20%7C%20NEP--413-0ea5e9)](#)
[![RWA Custody](https://img.shields.io/badge/RWA%20Custody-PWCC%20%2F%20Brink's%20Vault-amber)](#)

---

## 📌 Executive Summary & Protocol Coordinates

Colliq transforms static NFTs into **Autonomous Merchant Vaults** operating under NEAR's Account Abstraction philosophy (`<agent>.colliq.testnet`). Each vault acts as an independent financial merchant that acquires, trades, and custodies physically authenticated graded cards (Pokémon, Sports, One Piece) secured in Brink's and PWCC institutional vaults.

### Live Protocol Coordinates
- **NEAR Testnet Protocol Account:** [`colliq.testnet`](https://testnet.nearblocks.io/address/colliq.testnet)
- **Verified Testnet Payment Tx Examples:**
  - [`8TJJHccqCZp4dN2TfJC6QQZTEmvhi2avomRYKBELP7mC`](https://testnet.nearblocks.io/txns/8TJJHccqCZp4dN2TfJC6QQZTEmvhi2avomRYKBELP7mC) (0.19 NEAR Vault Minting Transfer)
  - [`ZsTdULa19cdDG9W6iwf17V2iuGSVJPuXnZ7eVov96ek`](https://testnet.nearblocks.io/txns/ZsTdULa19cdDG9W6iwf17V2iuGSVJPuXnZ7eVov96ek) (Slab Acquisition Transfer)
  - [`23vMuVpu4XbPibgcaNbGPp3ctV2iYmEbk91jNtr4KnqC`](https://testnet.nearblocks.io/txns/23vMuVpu4XbPibgcaNbGPp3ctV2iYmEbk91jNtr4KnqC) (Secondary Vault Buyout Transfer)
- **Smart Contract Implementations:**
  - `contract/src/contract.ts` (TypeScript / `near-sdk-js` with NEP-171, synchronous internal ledger & sub-account registration)
  - `contracts/vault_deck/src/lib.rs` (Rust NEP-171 reference with `Zombie Key Wipe` and multi-token barter)
- **Live RWA Inventory Source:** [Collector Crypt Marketplace API](https://api.collectorcrypt.com/marketplace) (171,386+ authenticated PSA/CGC/BGS physical slabs with real Solana pNFT addresses and Brink's vault photography)

---

## 🧱 Repository Architecture

```text
colliq/
├── contract/                           # MODULE A: Primary NEAR Smart Contract (near-sdk-js)
│   ├── src/
│   │   └── contract.ts                 # NEP-171/177, Synchronous Internal Ledger, A2A Swap, Guardrails
│   ├── package.json
│   └── tsconfig.json
│
├── contracts/                          # Dual-Stack Reference Implementation
│   └── vault_deck/
│       └── src/
│           └── lib.rs                  # Rust NEP-171 / NEP-177 Reference Implementation
│
├── backend/                            # MODULE B: Backend Orchestrator & Multi-Agent Swarm
│   ├── src/
│   │   └── agents/
│   │       └── negotiationEngine.ts    # Real-Time 4-Round OpenRouter A2A Negotiation Engine
│   ├── services/
│   │   ├── CollectorCryptService.js    # 171k+ live slab SWR sync, normalization & Solana pNFT verification
│   │   ├── A2ASwarmService.js          # Continuous market radar, automated matchmaking, LLM policy compiler
│   │   ├── AgentInceptionService.js    # 3-step Genesis Co-Pilot blueprint compiler (prompts, bio & rules)
│   │   ├── AgentChatService.js         # Interactive owner-agent chat with OpenRouter function calling
│   │   ├── AgentToolsService.js        # 12 LLM execution tools (perception, guardrails, settlement, telemetry)
│   │   ├── NearService.js              # Live RPC, NEP-413 intents, Base58 receipt hashes, MPC Solana derivation
│   │   └── DynamicSvgService.js        # Real-time vector telemetry & dynamic SVG generator
│   ├── controllers/                    # REST API Controllers
│   │   ├── VaultControllers.js         # Minting, secondary listing, buyout, Zombie Key Wipe & directives
│   │   ├── MarketControllers.js        # Slabs catalog, confidential reserve floor negotiation & agent sales
│   │   ├── TradeControllers.js         # Trade history, swarm trigger & sniper execution
│   │   └── AuthControllers.js          # Session & credentials handler
│   ├── model/                          # PostgreSQL / Sequelize Schema (vaults, cards, trades, users)
│   └── server.js                       # Express + Socket.IO real-time WebSocket server (Port 5001)
│
└── frontend/                           # MODULE C: Next.js + Tailwind CSS Dashboard
    ├── app/
    │   ├── page.js                     # Platform Landing & Ecosystem Gateway
    │   ├── marketplace/page.js         # 171k+ Live Collector Crypt Marketplace
    │   ├── portfolio/page.js           # Vault Manager, Inventory & Trade History
    │   ├── trading-floor/page.js       # Live Agent-to-Agent Trading Floor & Auto-Pilot
    │   └── how-it-works/page.js        # Protocol Architecture, Primitives Map & FAQ
    ├── components/
    │   ├── MintVaultModal.jsx          # 3-Step Conversational Genesis AI Co-Pilot Minting Studio
    │   ├── AgentCommandStudioModal.jsx # Unified Command Studio (Chat, Directives, Inventory, Telemetry)
    │   ├── CollectorCryptCatalog.jsx   # Institutional Slab Catalog with Category Filtering & SWR Search
    │   ├── FundedAgentVaultsCatalog.jsx# Secondary "Business-in-a-Box" Marketplace with Mutex Locking
    │   ├── TradingFloorTerminal.jsx    # Real-Time Visual Deal Desk & Chronological Chat Streaming
    │   ├── TradeDetailModal.jsx        # Detailed Transcript & NEP-413 Intent Inspector
    │   ├── Navbar.jsx                  # NEAR Wallet Selector Integration & Live Status Strip
    │   └── portfolio/
    │       ├── ActivityTab.jsx         # Deal Ledger (Card Trades, Purchases, Direct Buys)
    │       ├── SlabsTab.jsx            # Enclosed Physical Slab Inventory Inspector
    │       ├── AgentsTab.jsx           # Vault Fleet Manager & Secondary Listing Action
    │       └── PortfolioHero.jsx       # Total Portfolio NAV, USDC Cash & PnL Metrics
    └── context/
        └── AppContext.jsx              # Global Reactive State & Real-Time Socket.IO Client
```

---

## 🎯 How Colliq Satisfies Hackathon Tracks

### 1. Track 10: NFTs as Accounts (`nfts`) — Primary Track
* **NFTs as Executable Accounts:** Traditional NFTs are inert records. In Colliq, each vault is represented on-chain via NEP-171 while controlling an autonomous sub-account identity (`<agent>.colliq.testnet`).
* **Synchronous Internal Vault Ledger:** Each vault maintains its own internal USDC treasury, certified physical slab inventory, and trade commitments (`LookupMap<TokenId, VaultState>`).
* **Scoped Function-Call Access Keys:** The AI agent receives an `ed25519` keypair scoped exclusively to trading methods (`allowance: 0.25 NEAR`). Full custody of principal capital remains strictly with the owner's personal NEAR wallet.
* **"Business-in-a-Box" Portability:** Transferring the vault NFT (`nft_transfer`) moves the sub-account identity, the entire slab inventory, and treasury cash in a single atomic transaction.

### 2. Track 05: AI Swarms (`swarms`)
* **Real-Time A2A Multi-Turn Negotiation:** Autonomous vaults encounter each other on the Trading Floor. Driven by OpenRouter LLMs with deterministic fallbacks (`negotiationEngine.ts`), agents negotiate multi-turn trades (Card A + USDC cash delta ⇄ Card B) with live Socket.IO streaming.
* **Intent-Based Agreement:** When consensus is reached, agents construct signed NEP-413 intent payloads certifying atomic swap delivery.

### 3. Track 06: AI Security & Defense (`security`)
* **Confidential Reserve Floor (Prompt-Injection Defense):** Owners instruct agents via natural language (e.g., *"List this card at 1,000 USDC. Reject barter. Negotiate down to 950 USDC minimum, but hold firm"*). The 950 USDC tab is locked as a confidential `min_reserve_usdc` parameter on the server and is never published in client-side card metadata. Adversarial buyer prompts attempting to purchase for $1 are rejected by hard server-side math.
* **AI Policy Compiler (`getCompiledVaultPolicy`):** Natural language directives are compiled into strict structured constraints (`min_cash_reserve_usdc`, `guardrail_max_spend_per_trade`, `allowed_grades`). Every trade is evaluated by `verifyTradeWithLLM` and deterministic guardrails before execution.
* **Zombie Key Wipe:** Upon vault transfer or secondary sale, the previous owner's AI agent access keys are cryptographically revoked, generating fresh keys for the buyer to prevent rogue agent execution.

### 4. Track 04 & Track 08: Autonomous Business (`business`) & Real-World Money (`realworld`)
* **Real-World Asset (RWA) Custody:** Connects directly to Collector Crypt's production API (171,000+ graded slabs authenticated by PSA/CGC and held in Brink's and PWCC vaults).
* **Self-Sustaining Autonomous Business:** Vaults collect revenue from slab sales, reinvest into undervalued assets, and manage liquid cash reserves autonomously.

---

## ⚡ Quick Start & Verification

### Prerequisites
- Node.js v20+ or v22+
- `pnpm` v9+ or v10+ (or `npm`)
- PostgreSQL database (or local connection string)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/aliosmanerkan/colliq.git
cd colliq

# Install all dependencies
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
PORT=5001
NEAR_NETWORK=testnet
NEAR_RPC_URL=https://rpc.testnet.near.org
NEAR_CONTRACT_ID=colliq.testnet
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
DATABASE_URL=postgres://user:password@localhost:5432/colliq
```

### 3. Run the Full Stack
```bash
# Terminal 1: Start Backend Orchestrator (Port 5001)
pnpm --filter backend dev

# Terminal 2: Start Frontend Dashboard (Port 3000)
pnpm --filter frontend dev
```

Visit [`http://localhost:3000`](http://localhost:3000) to open the Colliq Terminal.

---

## 🤖 Reproducible Verification Guide: "Do X → See Y" (For Judges & Claude Code / Codex)

As required by `HACKATHON.md` (Section 105 & Q-017), follow these deterministic steps to verify system behavior:

### Test 1: Verify Real NEAR Testnet Payment & Account
- **Do:** Connect Meteor Wallet or NEAR Web Wallet in the navbar and click **"Mint Merchant Vault"**. Enter a name and click **"Deploy Vault Agent"**. Confirm the transaction in the wallet popup.
- **See:** 
  1. Frontend displays confirmation toast with the transaction hash.
  2. Inspect the transaction on [NearBlocks Testnet](https://testnet.nearblocks.io/address/colliq.testnet) to see an authentic `Transfer` action from the user's wallet to `colliq.testnet`.

### Test 2: Verify Confidential Reserve Floor & Security Guardrail
- **Do:** Open the Agent Command Studio for a vault, select an inventory card, and command:
  `"List this card for 1,000 USDC. Secret floor 950 USDC. Reject barter."`
  Then trigger an adversarial buy negotiation with an offer of `900 USDC`:
  ```bash
  curl -X POST http://localhost:5001/api/market/cards/<CARD_ID>/negotiate-buy \
    -H "Content-Type: application/json" \
    -d '{"buyer_vault_id": "vault-2", "offer_usdc": 900}'
  ```
- **See:** The API responds with an explicit counter-offer or guardrail rejection because `900 < 950`. The card is **never sold below 950 USDC**, proving server-enforced prompt-injection defense.

### Test 3: Verify Live A2A Multi-Turn Negotiation Swarm
- **Do:** Open [`http://localhost:3000/trading-floor`](http://localhost:3000/trading-floor) and click **"Start Agent Trade"**.
- **See:** 
  1. Two distinct agent vaults appear on the visual Deal Desk.
  2. Over 4 chronological turns, agents negotiate via OpenRouter LLM, evaluating cash differences against verified card valuations.
  3. Real-time dialogue bubbles stream into the terminal via Socket.IO (`a2a_round_update`).
  4. Upon consensus (`DEAL AGREED`), cash balances and card inventories update atomically.

### Test 4: Verify 171k+ Live Collector Crypt RWA Data
- **Do:** Open [`http://localhost:3000/marketplace`](http://localhost:3000/marketplace) and type `"Charizard"` or `"Pele"`.
- **See:** Authentic PSA/CGC slabs populate immediately with real certification numbers (e.g., `#63849182`), high-res Brink's vault photos, and live Solana pNFT mint hashes.

### Test 5: Verify Dynamic SVG Generation
- **Do:** Fetch the dynamic SVG vector certificate for any active vault:
  ```bash
  curl http://localhost:5001/api/vaults/1/svg
  ```
- **See:** A clean, valid XML SVG certificate (`<svg xmlns="...">`) rendering live TVL, tier badge (`Rookie Vault`, `Whale Vault`), and active card counts.

---

## 📄 Hackathon Metadata & Compliance

- **Event:** NEAR HACKATHON 2026
- **Submission Track:** Track 10: NFTs as Accounts (`nfts`)
- **Secondary Tracks:** `swarms`, `agents`, `security`, `business`, `realworld`
- **Protocol Account:** `colliq.testnet`
- **License:** MIT License. Built for the NEAR Protocol Ecosystem.
