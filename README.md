# Colliq — The Autonomous Economy for Real-World Collectibles

> **"What if your collectibles could negotiate, trade, and manage their own economy?"**  
> Colliq transforms real-world collectibles into autonomous digital assets. Each collection is represented through a NEAR-powered merchant vault, while autonomous AI agents evaluate collections, negotiate multi-asset trades, and coordinate continuous exchanges.

[![NEAR Protocol](https://img.shields.io/badge/NEAR-Testnet%20Verified-00EC97?logo=near&logoColor=black)](https://testnet.nearblocks.io/address/colliq.testnet)
[![Track 10: NFTs as Accounts](https://img.shields.io/badge/NEAR%20Hackathon-Track%2010%20(NFTs%20as%20Accounts)-6366f1)](#)
[![Track 05: AI Swarms](https://img.shields.io/badge/NEAR%20Hackathon-Track%2005%20(AI%20Swarms)-10b981)](#)
[![Track 06: AI Security](https://img.shields.io/badge/NEAR%20Hackathon-Track%2006%20(AI%20Security)-f59e0b)](#)
[![Live Data](https://img.shields.io/badge/RWA%20Live%20Data-171k%2B%20Indexed%20Physical%20Slabs-amber)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ⚡ Quick Links & Live Coordinates

- **Live Web Application:** [https://colliq.vercel.app](https://colliq.vercel.app) *(or `http://localhost:3000` via local setup)*
- **Demo Video (3.5 Minutes):** [Watch on YouTube / Loom / X](#)
- **Public X Demo Post:** [View Hackathon Announcement on X (@NEARProtocol #NEARHackathon)](#)
- **Verified NEAR Testnet Protocol Account:** [`colliq.testnet`](https://testnet.nearblocks.io/address/colliq.testnet)
- **Primary Hackathon Track:** Track 10: NFTs as Accounts (`nfts`)  
- **Eligible Secondary Tracks:** `swarms`, `agents`, `security`, `business`, `realworld`

---

## 1. Hero

Colliq is an **Autonomous Merchant Vault Protocol** on NEAR Protocol that binds physically authenticated graded trading cards (Pokémon, Sports, One Piece) to sovereign on-chain account identities. 

Instead of sitting statically in cold storage or passive display wallets, your physical slabs become active capital: managed by autonomous AI agents that run market radar scans, enforce strict owner guardrails, negotiate multi-asset trades in real-time, and settle atomic swaps.

---

## 2. The Problem

High-value graded collectibles (PSA, CGC, BGS) represent a rapidly expanding multi-billion dollar physical asset market, with hundreds of millions in card inventory secured inside institutional vaults like **Brink's** and **PWCC**. 

Despite tokenization on networks like Solana via programmable NFTs (pNFTs), the market suffers from three fundamental bottlenecks:
1. **Severe Illiquidity & Lockup:** Once a card is vaulted, trading it requires waiting weeks on custodial auction houses or manual P2P escrow forums.
2. **Fragmented, Time-Consuming Negotiation:** Real-world trades almost never consist of pure cash—they are complex, multi-asset deals (*"My PSA 9 Charizard + $50 cash for your PSA 10 Gengar"*). Human collectors cannot monitor market fluctuations 24/7 or negotiate deals across different time zones.
3. **Passive Ownership (Inert NFTs):** Standard NFTs are passive cryptographic receipts. They cannot hold working capital, cannot execute self-directed strategies, and cannot manage their own micro-economies.

---

## 3. Our Solution

Colliq bridges real-world institutional custody with NEAR Protocol’s Account Abstraction philosophy to build a living, autonomous asset economy:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   COLLIQ ARCHITECTURE                                  │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│    1. NFT VAULTS         │      2. AI AGENTS           │     3. COLLECTIBLE MARKET     │
│  (NFTs as Accounts)      │  (Autonomous Merchants)     │   (171,000+ Indexed Slabs)    │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ • Sovereign NEAR Identity│ • Natural Language Compiler │ • Live Collector Crypt Oracle │
│   (<name>.colliq.testnet)│ • 4-Round A2A Negotiation   │ • Authenticated PSA/CGC Slabs │
│ • Internal Treasury      │ • Confidential Reserve Floor│ • Real Brink's Vault Photos   │
│ • "Business-in-a-Box"    │ • Server-Side Guardrails    │ • Dual-Asset Barter Desk      │
│   Atomic Portability     │   (Prompt-Injection Proof)  │   (Card + Cash Delta)         │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

1. **NFT Merchant Vaults (NFTs as Accounts):** Every collection is encapsulated within an autonomous NEAR vault. The vault holds liquid USDC working capital, certified slab inventory, and a scoped AI execution key.
2. **Autonomous Merchant Agents:** Each vault is commanded by an AI agent operating within owner-defined boundaries. The agent compiles natural language instructions into strict mathematical rules, audits risk before every transaction, and refuses predatory offers.
3. **Real-Time Collectibles Marketplace & Trading Floor:** A live visual deal desk streaming 171,000+ real physical slabs, where two independent AI vaults negotiate live over WebSockets and agree on fair multi-asset exchanges.

---

## 4. How It Works: The End-to-End User Journey

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Deploy Vault │ ────> │ 2. Set Strategy │ ────> │ 3. Direct Sales │ ────> │ 4. Autonomous   │
│ (Meteor Wallet) │       │ (Policy Engine) │       │ (Secret Floor)  │       │    Settlement   │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Step 1: Deploy a Merchant Vault
The collector connects their NEAR wallet (e.g., Meteor Wallet) and deploys a vault by funding it with initial liquidity. The system registers the vault identity, provisions an internal treasury, and assigns an Ed25519 AI keypair.

### Step 2: Establish the Investment Strategy
Instead of complex scripting, the owner chats with the **AI Strategy Architect** in natural language:
> *"Focus strictly on PSA 10 vintage Japanese cards under 150 USDC. Keep a mandatory 50 USDC cash reserve at all times."*  
The engine compiles this instruction into a deterministic JSON policy (`must_match_keywords`, `allowed_grades`, `min_cash_reserve_usdc`, `guardrail_max_spend_per_trade`).

### Step 3: Command Autonomous Asset Sales
When monetizing an inventory card, the owner issues a strategic sales directive:
> *"List this 1958 Pelé slab at 1,000 USDC. Reject pure barter. You can negotiate down to 950 USDC minimum, but try to hold firm."*  
The agent lists the card at 1,000 USDC publicly, while locking a confidential **950 USDC reserve floor** on the backend.

### Step 4: Live A2A Negotiation & Settlement
A prospective buyer vault encounters the listing. Over 4 chronological rounds on the **Trading Floor**, the buyer offers cash or card combinations. If the buyer bids $900, our agent rejects it. When the buyer meets the criteria ($960 cash), consensus is reached: the slab moves to the buyer vault, cash is credited to the seller, and both portfolios update atomically across internal ledgers (with dual-signed NEP-413 intent payloads prepared for on-chain settlement).

---

## 5. Live Demo: 2-Minute Judge Walkthrough ("Do X → See Y")

To verify system behavior quickly and deterministically, follow this 3-step walkthrough:

### Scenario A: Verify Confidential Reserve Floor & Prompt-Injection Defense
1. **Do:** In the web application, open any vault's **Agent Command Studio**, select an inventory card, and command:
   ```text
   List this card for 1,000 USDC. Secret floor 950 USDC. Reject barter.
   ```
2. **Do (Simulated Adversarial Attack):** Submit a lowball offer of 900 USDC using `curl`:
   ```bash
   curl -X POST http://localhost:5001/api/market/cards/1/negotiate-buy \
     -H "Content-Type: application/json" \
     -d '{"buyer_vault_id": "vault-2", "offer_usdc": 900}'
   ```
3. **See:** The API returns an explicit counter-offer or guardrail rejection (`"Security Guardrail: Offer $900 is below locked confidential reserve"`). The card is **never sold below 950 USDC**, demonstrating robust defense against adversarial LLM jailbreaks.

### Scenario B: Verify Real-Time A2A Multi-Turn Negotiation Swarm
1. **Do:** Navigate to [`/trading-floor`](http://localhost:3000/trading-floor) and click **"Start Agent Trade"**.
2. **See:** 
   - Two distinct agent vaults take the stage on the Deal Desk.
   - Watch the 4-round chronological dialogue stream in real time via Socket.IO: Round 1 (Opening Offer) → Round 2 (Counter-Offer) → Round 3 (Guardrail Check) → Round 4 (Final Agreement).
   - Upon agreement (`DEAL AGREED`), both vaults' cash balances and slab inventories update atomically across internal ledgers, with immediate portfolio reflection.

### Scenario C: Verify Real NEAR Testnet Payment
1. **Do:** Connect Meteor Wallet in the top navigation bar and click **"Mint Merchant Vault"**. Confirm the transaction popup in Meteor Wallet.
2. **See:** 
   - A confirmation toast appears with an authentic NEAR transaction hash.
   - Verify on [NearBlocks Explorer](https://testnet.nearblocks.io/address/colliq.testnet) to observe a real on-chain `Transfer` action from your wallet to `colliq.testnet`.

---

## 6. NEAR Integration: Technical Realities & Architecture

We believe in absolute technical honesty. Here is the exact mapping of what happens on-chain, what runs on the application layer, and the architectural justification for each:

| Feature / Primitive | Layer | NEAR Implementation & Reality |
|---|---|---|
| **User Payments** | ✅ **On-Chain (Testnet)** | Minting and asset purchases execute authentic NEAR `Transfer` actions from Meteor Wallet to `colliq.testnet` ([view confirmed tx](https://testnet.nearblocks.io/txns/8TJJHccqCZp4dN2TfJC6QQZTEmvhi2avomRYKBELP7mC)). |
| **Smart Contract Code** | ✅ **Codebase Ready** | Complete NEP-171 / NEP-177 smart contracts implemented in `contract/src/contract.ts` (near-sdk-js) and `contracts/vault_deck/src/lib.rs` (Rust) featuring internal synchronous ledgers and sub-account registration. |
| **AI Strategy & Guardrails** | 🛡️ **App Layer (Server-Side)** | LLM inference (`getCompiledVaultPolicy`, `verifyTradeWithLLM`) and confidential reserve floor math are enforced server-side. *Blockchain WASM runtimes cannot execute non-deterministic LLM neural network inferences.* |
| **A2A Negotiation Swarm** | ⚡ **App Layer (WebSockets)** | 4-round dynamic agent bargaining runs via OpenRouter LLMs and streams over Socket.IO for instant user responsiveness, without waiting for block latency on intermediate dialogue turns. |
| **Vault Settlement** | 🔄 **App Layer (DB Atomic)** | Multi-asset inventory swaps settle atomically across vault balances in PostgreSQL, constructing dual-signed NEP-413 intent payload schemas. |
| **Dynamic SVG Visuals** | 🎨 **App Layer (Dynamic Vector)** | `GET /vaults/:id/svg` dynamically synthesizes SVG certificates reflecting real-time AUM, rank badges, and card counts. |
| **Collector Crypt Ingestion** | 🌐 **Live Production API** | 171k+ real-world slabs ingested from `api.collectorcrypt.com` with authentic PSA cert numbers, Brink's vault photos, and Solana pNFT mint hashes. |

---

## 7. System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (Next.js)                          │
│  • TradingFloorTerminal.jsx (Socket.IO)  • AgentCommandStudioModal.jsx      │
│  • CollectorCryptCatalog.jsx (SWR)       • NEAR Wallet Selector (Meteor)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WebSockets
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    BACKEND & SWARM ORCHESTRATOR (Node.js)                   │
│  • negotiationEngine.ts (4-Turn A2A)     • A2ASwarmService (Policy Compiler)│
│  • MarketControllers (Confidential Floor)• DynamicSvgService (Vector Engine)│
│  • NearService (Keypair derivation, RPC telemetry & NEP-413 payloads)       │
└──────────────────┬───────────────────────────────────────────┬──────────────┘
                   │                                           │
┌──────────────────▼───────────────┐       ┌───────────────────▼──────────────┐
│      ORACLE & EXTERNAL DATA      │       │       BLOCKCHAIN & PERSISTENCE   │
│  • Collector Crypt API (171k+)   │       │  • NEAR Testnet (colliq.testnet) │
│  • Physical Custody: Brink's CA  │       │  • PostgreSQL / Sequelize DB     │
│  • OpenRouter Multi-LLM Gateway  │       │  • NEP-171/177 Smart Contract    │
└──────────────────────────────────┘       └──────────────────────────────────┘
```

---

## 8. Tech Stack

- **Blockchain Platform:** NEAR Protocol (Testnet)
- **NEAR Tooling:** `@near-wallet-selector/core`, `@near-wallet-selector/meteor-wallet`, `near-api-js`, `near-sdk-js`
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Node.js, Express, Socket.IO (Real-Time Streaming)
- **AI Engine:** OpenRouter Multi-LLM Gateway (Claude 3.5 Haiku / Llama 3) with deterministic rule-based fallback
- **Database & State:** PostgreSQL, Sequelize ORM
- **RWA Oracle:** Collector Crypt Production Marketplace API (171,000+ Slabs)

---

## 9. Local Setup & Reproduction

### Prerequisites
- Node.js v20+ or v22+
- `pnpm` v9+ (or `npm`)
- PostgreSQL running locally (e.g., `postgres://localhost:5432/colliq`)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/aliosmanerkan/colliq.git
cd colliq

# 2. Install dependencies across all workspaces
pnpm install

# 3. Configure environment variables
# Create a .env file in the root directory:
cat <<EOF > .env
PORT=5001
NEAR_NETWORK=testnet
NEAR_RPC_URL=https://rpc.testnet.near.org
NEAR_CONTRACT_ID=colliq.testnet
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
DATABASE_URL=postgres://user:password@localhost:5432/colliq
EOF

# 4. Start the Backend Orchestrator (Port 5001)
pnpm --filter backend dev

# 5. In a second terminal, start the Frontend Dashboard (Port 3000)
pnpm --filter frontend dev
```

Open [`http://localhost:3000`](http://localhost:3000) to launch the Colliq Terminal.

### Database Auto-Initialization & Seeding
On initial launch, the backend automatically connects to PostgreSQL, creates all required tables (`vaults`, `cards`, `trades`), and seeds default demo merchant vaults and sample slab inventories (`db.sync`). No manual migrations or seed scripts are necessary.

### Automated Verification Test Suite
Run the automated test suite to verify prompt-injection defense, confidential reserve floors, and policy compilation:
```bash
pnpm test
```

---

## 10. Roadmap, Current Limitations & License

### Current Scope & Limitations
- **RWA Physical Custody:** The 171k+ slabs display live production data, certs, and photos from Collector Crypt. Within this testnet prototype, slab custody transfers are managed within Colliq’s internal ledger rather than executing mainnet Solana pNFT burns.
- **Cross-Chain Signatures:** Deterministic Solana address derivation algorithms (`deriveSolanaAddressForVault`) are fully implemented. Full multi-party computation via `v1.signer-prod.testnet` is architected for mainnet deployment to avoid testnet RPC timeouts during live judging.
- **Smart Contract Deployment:** User wallet payments settle via on-chain `Transfer` transactions on `colliq.testnet`. The complete NEP-171 smart contract codebase (`contract/src/contract.ts`) is provided for auditing and mainnet deployment.

### Development Roadmap
- **Q1 2027:** Deploy production NEP-171 contract with native sub-account creation on NEAR Mainnet.
- **Q2 2027:** Implement NEAR Intents 1Click solver integration for seamless cross-chain swaps between Solana pNFTs and NEAR assets.
- **Q3 2027:** Launch physical delivery redeem bridge (allowing vault owners to trigger physical Brink's vault dispatch to their home address).

### License
This project is licensed under the **MIT License**. Built with pride for the **NEAR Protocol Hackathon 2026**.
