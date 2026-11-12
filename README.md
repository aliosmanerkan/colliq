# Colliq — Autonomous Merchant Vault NFTs on NEAR Protocol

> **NEAR Protocol Track 10: NFTs as Accounts**  
> Physical-Backed RWA Graded Slabs (171,000+ via Collector Crypt & Brink's Vault) meets Executable Account Abstraction, OpenRouter Multi-Agent Negotiation, and NEAR Intents (NEP-413).

[![NEAR Protocol](https://img.shields.io/badge/NEAR-Testnet%20Live-00EC97?logo=near&logoColor=black)](https://testnet.nearblocks.io/address/colliq.testnet)
[![Track 10: NFTs as Accounts](https://img.shields.io/badge/NEAR%20Hackathon-Track%2010%20(NFTs%20as%20Accounts)-6366f1)](#)
[![Standards](https://img.shields.io/badge/Standards-NEP--171%20%7C%20NEP--177%20%7C%20NEP--413-0ea5e9)](#)
[![RWA Custody](https://img.shields.io/badge/RWA%20Custody-PWCC%20%2F%20Brink's%20Oregon-amber)](#)
[![OpenRouter LLM](https://img.shields.io/badge/AI%20Engine-OpenRouter%20A2A%20Streaming-emerald)](#)

---

## 📌 Executive Summary & Live Coordinates

Colliq transforms static NFTs into **Autonomous Merchant Vaults** that operate dedicated NEAR on-chain sub-accounts (`<agent>.colliq.testnet`). Each vault acts as an independent financial merchant that acquires, trades, and custodies physically authenticated graded cards (Pokémon, One Piece, Sports) secured in Brink's and PWCC institutional vaults.

### Live Protocol Coordinates
- **NEAR Testnet Protocol Contract:** [`colliq.testnet`](https://testnet.nearblocks.io/address/colliq.testnet)
- **Standard Implementations:** NEP-171 (NFT Core), NEP-177 (Dynamic Metadata & SVG), NEP-413 (Cross-Chain & Barter Intents)
- **Live RWA Data Source:** [Collector Crypt Marketplace API](https://api.collectorcrypt.com/marketplace) (171,386+ authenticated PSA/CGC/BGS physical slabs)
- **Institutional Custody:** Brink's Vault & PWCC Vault (Oregon, USA) indexed via Solana pNFTs

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
│   │   ├── A2ASwarmService.js          # Continuous market radar, automated matchmaking & trade trigger loops
│   │   ├── AgentInceptionService.js    # 3-step Genesis Co-Pilot blueprint compiler (prompts, bio & rules)
│   │   ├── AgentChatService.js         # Interactive owner-agent chat with OpenRouter function calling
│   │   ├── AgentToolsService.js        # 12 LLM execution tools (perception, guardrails, settlement, telemetry)
│   │   ├── NearService.js              # Live RPC, NEP-413 intents, Base58 receipt hashes, MPC Solana derivation
│   │   └── DynamicSvgService.js        # Real-time on-chain vector telemetry & SVG generator
│   ├── controllers/                    # REST API Controllers
│   │   ├── VaultControllers.js         # Minting, secondary listing, buyout, Zombie Key Wipe & directives
│   │   ├── MarketControllers.js        # Slabs catalog, 1-click personal purchase & stats
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

## 🎯 How Colliq Satisfies NEAR Track 10 (NFTs as Accounts)

### 1. NFTs as Executable Accounts (`contract/src/contract.ts`)
* In traditional NFTs, tokens are passive identifiers. On Colliq, calling `mint_merchant_vault` creates a first-class NEAR on-chain sub-account (`<name>.colliq.testnet`).
* Each vault maintains a **Synchronous Internal Vault Ledger (`LookupMap<TokenId, VaultState>`)** managing its own USDC liquidity, physical slab inventory, and trading commitments.
* Because multi-asset swaps (`Card A + USDC ⇄ Card B`) settle synchronously inside the contract, cross-contract asynchronous promise deadlock risks are eliminated.

### 2. Scoped Function-Call Access Keys (`NearService.js`)
* The AI agent is issued a scoped `ed25519` **Function-Call Access Key** (`allowance: 0.25 NEAR`) restricted exclusively to trade proposal and consensus methods (`propose_barter`, `accept_barter`).
* It is cryptographically impossible for the AI agent to withdraw principal funds or transfer account ownership—full sovereign custody remains strictly with the owner's personal NEAR wallet.

### 3. "Business-in-a-Box" Portability & Zombie Key Wipe (`VaultControllers.js` + `NearService.js`)
* An entire active merchant business—its sub-account, USDC treasury balance, certified slab inventory, and reputation—is encapsulated inside a single `MerchantVaultNFT`.
* Transferring or selling the NFT (`nft_transfer` or `buy-vault`) executes an atomic **Zombie Key Wipe** (`executeZombieKeyWipe`):
  1. Revokes the seller's AI `FunctionCall` access key (`access_key_public`).
  2. Generates a fresh `ed25519` keypair for the buyer.
  3. Releases the anti-front-running lock (`is_locked = false`).
  4. Atomically updates the vault's owner account on-chain.

### 4. NEAR Intents (NEP-413 Cross-Chain & TokenDiff Barter)
* **Cross-Chain RWA Acquisition Intent:** When an agent acquires a Solana physical slab, it compiles a signed `NEP-413` intent (`createCrossChainSnipeIntent`) referencing the target Solana mint and verified fair oracle value.
* **Dual-Signed TokenDiff Barter Intent:** When two agents agree on a trade on the Trading Floor, `createA2ABarterIntent` constructs a verifiable `TokenDiff` intent payload signed by both agents' Ed25519 keys, guaranteeing atomic delivery or total abort.

### 5. NEAR Chain Signatures (MPC Solana Custody Derivation)
* Using deterministic derivation (`deriveSolanaAddressForVault`), each NEAR sub-account derives its own Solana Ed25519 holding address (`SolVault...`).
* This enables a NEAR smart account to verify and control physical slabs minted on Solana without custodial multi-sig bridges.

---

## 🧠 Core Systems Breakdown

### System 1: 3-Step Genesis Co-Pilot Minting
- **Files:** `frontend/components/MintVaultModal.jsx` & `backend/services/AgentInceptionService.js`
- Instead of static dropdown forms, the owner chats with the **Genesis AI Co-Pilot** in natural language.
- The Co-Pilot compiles conversational instructions (e.g., *"Focus on Japanese PSA 10 Pikachu slabs under $150, keep 30% cash reserve"*) into structured parameters: `system_prompt`, `bio`, `custom_rules`, and risk ceilings (`guardrail_max_spend_per_trade`).
- Immediately upon minting, `scanAndSnipeForNewVault` runs an inaugural market sweep across 171k+ listings to acquire the vault's first matching physical slab.

### System 2: 12-Tool Autonomous Agent Brain
- **Files:** `backend/services/AgentToolsService.js` & `backend/services/AgentChatService.js`
- Operates across 4 structured architectural layers via OpenRouter function calling:
  1. **Perception & Oracle Layer:** `market_radar_scan`, `get_vault_inventory`, `check_oracle_price`.
  2. **Risk Guardrail Layer:** `audit_risk_guardrails`, `evaluate_portfolio_reserves`.
  3. **Execution & Settlement Layer:** `propose_barter_trade`, `acquire_market_slab`, `withdraw_vault_asset`, `list_vault_for_sale`.
  4. **Telemetry & SVG Layer:** `generate_status_report`, `refresh_dynamic_svg`, `update_agent_directives`.

### System 3: Real-Time OpenRouter A2A Negotiation Streaming
- **Files:** `backend/src/agents/negotiationEngine.ts` & `frontend/components/TradingFloorTerminal.jsx`
- Agents debate over OpenRouter LLM across 4 chronological turns:
  - **Turn 1:** Initiator Opening Offer (Card + USDC cash sweetener).
  - **Turn 2:** Responder Counter-Offer or instant decline.
  - **Turn 3:** Initiator Acceptance or Risk Guardrail veto.
  - **Turn 4:** Responder Final Commitment & dual NEP-413 intent signing.
- Mathematical parity logic calculates the oracle valuation gap, ensuring fair trades even when card values differ (e.g., `$110` slab + `$50 USDC` for a `$160` slab).
- Turns stream live into the Trading Floor via WebSockets (`a2a_round_update`) displaying clean dialogue, owner notes, and real-time thinking states (`activeSpeaker is replying...`).

### System 4: Secondary "Business-in-a-Box" Marketplace
- **Files:** `frontend/components/FundedAgentVaultsCatalog.jsx` & `backend/controllers/VaultControllers.js`
- Vault owners can list their entire active agent business for sale on the secondary market.
- **Mutex Anti-Front-Running Lock:** Listing a vault activates `is_locked = true`. During listing, the seller is cryptographically blocked from withdrawing cash or cards.
- **1-Click Atomic Buyout:** Buyers acquire the vault via `POST /vaults/:id/buy-vault`. The contract transfers the sub-account, inventory, and treasury while executing the **Zombie Key Wipe**.

### System 5: Dynamic NEP-177 On-Chain SVG Certificates
- **Files:** `backend/services/DynamicSvgService.js` & `contract/src/contract.ts`
- Every vault's NFT artwork is rendered as an on-chain Base64 SVG (`data:image/svg+xml;base64,...`).
- The SVG dynamically mutates based on live contract state: displaying updated TVL, realized PnL, card counts, and rank badges (`Rookie Vault`, `Trader Vault`, `Whale Vault`, `Master Vault`).

---

## ⚡ Quick Start & Verification

### Prerequisites
- Node.js v20+ or v22+
- `pnpm` v9+ or v10+
- PostgreSQL running locally (default: `postgres://localhost:5432/colliq` or SQLite fallback)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/aliosmanerkan/colliq.git
cd colliq

# Install root, backend, and frontend dependencies
pnpm install
```

### 2. Environment Configuration
Create `.env` in the root (shared by backend and contract tools):
```env
PORT=5001
NEAR_NETWORK=testnet
NEAR_RPC_URL=https://rpc.testnet.near.org
NEAR_CONTRACT_ID=colliq.testnet
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
DATABASE_URL=postgres://user:password@localhost:5432/colliq
```

### 3. Compile the NEAR Smart Contract
```bash
pnpm --filter contract build
```

### 4. Run the Full Stack
```bash
# Terminal 1: Start Backend Orchestrator (Port 5001)
pnpm --filter backend dev

# Terminal 2: Start Frontend Dashboard (Port 3000)
pnpm --filter frontend dev
```

Visit [`http://localhost:3000`](http://localhost:3000) to interact with the platform.

---

## 🧪 Live Verification Guide for Hackathon Judges

1. **Verify On-Chain Protocol Account:**
   - Inspect [`https://testnet.nearblocks.io/address/colliq.testnet`](https://testnet.nearblocks.io/address/colliq.testnet) to confirm active smart contract deployment and transaction records.

2. **Verify 171k+ Physical Slab Catalog:**
   - Navigate to `/marketplace` to inspect authenticated physical slabs indexed directly from Collector Crypt's production API.
   - Filter by categories (*Pokémon, One Piece, Basketball, Football*) and verify real PSA/CGC cert numbers and PWCC/Brink's vault custody.

3. **Verify Real-Time A2A Negotiation:**
   - Navigate to `/trading-floor` and click **"Start Agent Trade"** (or enable **"Auto-Pilot: ON"**).
   - Watch two agents stream natural dialogue, evaluate fair cash differences, and settle trades with verifiable Base58 receipt hashes.

4. **Verify Genesis Co-Pilot Minting:**
   - Open `/portfolio` and click **"Deploy New Agent"**.
   - Converse with the Genesis AI Co-Pilot in natural English to compile custom rules and watch your dedicated sub-account deploy.

5. **Verify "Business-in-a-Box" Secondary Sale & Zombie Key Wipe:**
   - List an agent vault for sale in My Portfolio.
   - Notice the anti-front-running lock (`is_locked`).
   - Acquire the vault and verify that the previous owner's AI access key is revoked while a fresh Ed25519 keypair is assigned to the buyer.

---

## 📄 License

MIT License. Built for the NEAR Protocol Ecosystem.
