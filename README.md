# Colliq 

> **Autonomous Merchant Vault NFTs on NEAR Protocol (Track [10 / NFT])**  
> Physical-Backed RWA Pokémon & TCG Slabs (Collector Crypt / Solana) meets Executable Account Abstraction on NEAR.

[![NEAR Protocol](https://img.shields.io/badge/NEAR-Testnet%20Live-00EC97?logo=near&logoColor=black)](https://near.org)
[![Track 10: NFTs as Accounts](https://img.shields.io/badge/NEAR%20Hackathon-Track%2010%20(NFTs%20as%20Accounts)-6366f1)](#)
[![Smart Contract: NEP-171/177](https://img.shields.io/badge/Standard-NEP--171%20%2F%20NEP--177%20Dynamic-cyan)](#)
[![Collector Crypt RWA](https://img.shields.io/badge/RWA-Brink's%20Vault%20Sealed-amber)](#)

---

## 📌 Executive Summary

Colliq transforms static NEP-171 NFTs into **Autonomous Merchant Vaults** that trade physical-backed graded Pokémon/TCG cards (sourced from Solana's Collector Crypt).

Each minted `MerchantVaultNFT` is an executable account with:
1. **Its own on-chain identity** (`<token_id>.<contract_id>`, e.g., `vault-1.colliq.testnet`).
2. **Its own USDC treasury** and **RWA card inventory** stored in a synchronous Internal Vault Ledger.
3. **An autonomous AI Agent brain** that negotiates multi-card + USDC barter swaps with other Merchant NFTs via a stateless event-driven swarm.
4. **"Business-in-a-Box" Portability:** When an owner transfers the `MerchantVaultNFT` (`nft_transfer`), the entire underlying business (USDC treasury, physical card inventory, and trading reputation) transfers atomically to the new owner, while the previous AI session key is automatically wiped clean on-chain (**Zombie Key Wipe**).

---

## 🧱 Repository Architecture

```text
poke-agent/
├── contract/                       # MODULE A: NEAR Smart Contract (TypeScript / near-sdk-js)
│   ├── src/
│   │   └── contract.ts             # NEP-171/177, Internal Ledger, A2A Swap, Guardrails
│   ├── Cargo.toml                  # Optional Rust implementation (dual-stack)
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                        # Backend Orchestrator & Live Feed
│   ├── src/
│   │   ├── services/
│   │   │   └── collectorCryptSync.ts # MODULE B: Helius DAS & Magic Eden RWA Sync
│   │   └── agents/
│   │       └── negotiationEngine.ts  # MODULE C: Stateless 5-Round A2A Swarm Engine
│   ├── services/
│   │   ├── NearService.js          # Live near-api-js RPC & KeyPair management
│   │   └── DynamicSvgService.js    # On-Chain Vector Telemetry Engine
│   ├── controllers/                # REST API controllers (Vaults, Trades, Market)
│   ├── model/                      # PostgreSQL / Sequelize schema
│   └── server.js                   # Express + Socket.IO real-time trading floor
│
└── frontend/                       # MODULE D: Next.js + Tailwind CSS v4 Dashboard
    ├── app/
    │   ├── page.js                 # Unified Trading Floor & Inspector View
    │   └── layout.js
    ├── components/
    │   ├── Navbar.jsx              # Real NEAR Wallet Selector & Testnet block sync
    │   ├── VaultCard.jsx           # Business-in-a-Box Slab Card
    │   ├── TradingFloorTerminal.jsx# Live A2A Negotiation Arena
    │   ├── CollectorCryptCatalog.jsx # 50-slab Brink's Vault RWA Marketplace
    │   ├── VaultDetailModal.jsx    # Live Dynamic On-Chain SVG inspector
    │   ├── TransferVaultModal.jsx  # 1-Click Business Sale + Zombie Key Wipe Proof
    │   └── MintVaultModal.jsx      # Spawner with strategy & on-chain guardrails
    └── lib/
        ├── near.js                 # @near-wallet-selector/core + MyNearWallet
        └── api.js                  # Axios client
```

---

## 🎯 How Colliq Satisfies Every Requirement of Track [10 / NFT]

### 1. Executable NFTs & Sub-Accounts (`contract/src/contract.ts`)
* Minting a `MerchantVaultNFT` invokes `mint_merchant_vault`, generating `<token_id>.<contract_id>` (e.g. `vault-1.colliq.testnet`).
* Attaches a restricted `FunctionCall` Access Key allowing the off-chain AI Agent to call ONLY `execute_a2a_swap` and `submit_offer`—never owner withdrawal methods.
* Multi-asset swaps (Cards + USDC) execute in a **Synchronous Internal Vault Ledger (`LookupMap<TokenId, VaultState>`)**, eliminating asynchronous cross-contract promise deadlock risks.

### 2. Verified RWA Card Inventory (No Fake JPEGs)
* Regular users cannot mint arbitrary JPEGs.
* Only the authorized `verified_bridge_signer` can call `import_verified_card`, locking:
  - `solana_mint_address` (Solana SPL token)
  - `psa_cert_number` (Authentic 8-digit PSA cert)
  - `grade` (`PSA 10 GEM MT`, `CGC 10 PRISTINE`)
  - `oracle_fair_value_usdc` (Market valuation)

### 3. Dynamic NEP-177 Metadata & On-Chain SVG (`nft_token`)
* When trades settle, contract state updates: `trades_completed`, `unique_counterparties`, `realized_pnl_usdc`, and `tier_badge` (`Rookie` ➔ `Shark` ➔ `Whale Vault`).
* In the `media` field of `TokenMetadata`, the contract generates a **Live Dynamic Base64 SVG** (`data:image/svg+xml;base64,...`) rendering TVL, PnL, card count, and tier badge directly from contract state.

### 4. Atomic A2A Barter Settlement (`execute_a2a_swap`)
* Atomically swaps `offered_cards[] + offered_usdc` from Buyer with `requested_cards[] + requested_usdc` from Seller.
* Deducts a **0.5% protocol fee** to deter Sybil wash-trading.

### 5. Mandatory Red-Team Security Fixes
1. **Anti-Front-Running Lock (`is_locked`):** When a vault is listed for sale or in trade escrow, `withdraw_usdc` and `withdraw_card` are locked. Sellers cannot rug-pull cash before an NFT sale.
2. **Zombie Key Wipe on Transfer (`nft_transfer`):** Transferring a Merchant Vault NFT automatically revokes the seller's `agent_public_key`, resetting `is_locked = false`.
3. **On-Chain AI Guardrails:** Enforces `max_spend_per_trade_usdc` and `max_slippage_bps` against `oracle_fair_value_usdc`. Prompt injection or hallucination cannot drain funds beyond the owner's hard limits.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js v22+
- `pnpm` v12+ (`curl -fsSL https://get.pnpm.io/install.sh | sh -`)
- PostgreSQL running locally on port 5432 (database: `poke_agent`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Compile the NEAR Smart Contract
```bash
pnpm build:contract
```

### 4. Start the Full Stack (Backend + Frontend)
```bash
pnpm dev
```
* **Frontend:** `http://localhost:3000`
* **Backend:** `http://localhost:5001` (Live Socket.IO on `ws://localhost:5001`)

---

## 🧪 Testing the Modules Live

1. **Connect NEAR Wallet:** Click **"Connect NEAR Wallet"** in the top-right navbar to connect your MyNearWallet Testnet account.
2. **Trigger A2A Swarm:** Click **"Trigger A2A Swarm"** to watch two AI Merchant Vaults negotiate in real-time round-by-round and settle an atomic swap on NEAR.
3. **Inspect Dynamic On-Chain SVG:** Click **"Inspect NFT"** on any vault card to view the live Base64 SVG rendered directly from contract state.
4. **Test "Business-in-a-Box" Sale + Zombie Key Wipe:** Click **"Buy / Transfer Vault"** and input a recipient account. Observe how the entire treasury, card portfolio, and reputation transfer in one transaction while the old AI access key is instantly wiped.
5. **Bridge Collector Crypt RWA Slabs:** Open the **"RWA Slabs (Collector Crypt)"** tab to browse 50 authentic Brink's vault slabs and bridge them into your NEAR Merchant Vault.
