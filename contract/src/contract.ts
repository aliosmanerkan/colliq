import {
    NearBindgen,
    near,
    call,
    view,
    initialize,
    LookupMap,
    assert,
    bytes
} from "near-sdk-js";

// ==========================================
// DATA STRUCTURES & INTERFACES
// ==========================================

export interface VerifiedCardRecord {
    card_id: string;
    solana_mint_address: string;
    psa_cert_number: string;
    grade: string;               // e.g. "PSA 10 GEM MT", "CGC 10 PRISTINE"
    card_name: string;
    category: string;
    image_url: string;
    oracle_fair_value_usdc: number; // in cents or whole USDC
    vault_id: string;
}

export interface VaultState {
    vault_id: string;
    sub_account: string;         // <token_id>.<contract_id>
    owner_id: string;
    usdc_balance: number;        // USDC treasury balance
    strategy: string;            // "AGGRESSIVE_FLIPPER" | "PSA_10_COLLECTOR" | "BARTER_SPECIALIST"
    tier_badge: string;          // "Rookie" | "Shark" | "Whale Vault"
    trades_completed: number;
    unique_counterparties: string[];
    realized_pnl_usdc: number;
    is_locked: boolean;          // Anti-frontrunning lock for active escrow / marketplace listing
    guardrail_max_spend_usdc: number;
    guardrail_max_slippage_bps: number; // e.g. 1500 = 15% max variance from oracle fair value
    agent_public_key: string | null;    // Restricted Function-Call Access Key
    inventory: VerifiedCardRecord[];
}

export interface TokenMetadata {
    title: string;
    description: string;
    media: string;               // Dynamic Base64 SVG (data:image/svg+xml;base64,...)
    media_hash: string | null;
    copies: number;
    issued_at: string;
    expires_at: string | null;
    starts_at: string | null;
    updated_at: string | null;
    extra: string;               // Full telemetry JSON
    reference: string | null;
    reference_hash: string | null;
}

export interface Token {
    token_id: string;
    owner_id: string;
    metadata: TokenMetadata;
    approved_account_ids: Record<string, number>;
}

export interface NFTContractMetadata {
    spec: string;                // "nft-1.0.0"
    name: string;
    symbol: string;
    icon: string | null;
    base_uri: string | null;
    reference: string | null;
    reference_hash: string | null;
}

// ==========================================
// DYNAMIC ON-CHAIN BASE64 SVG GENERATOR
// ==========================================

function generateOnChainBase64Svg(vault: VaultState): string {
    const isPnlPositive = vault.realized_pnl_usdc >= 0;
    const pnlSign = isPnlPositive ? "+" : "";
    const pnlColor = isPnlPositive ? "#10b981" : "#ef4444";

    let tierGradient = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
    let tierBorder = "#60a5fa";
    if (vault.tier_badge === "Shark") {
        tierGradient = "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)";
        tierBorder = "#c084fc";
    } else if (vault.tier_badge === "Whale Vault") {
        tierGradient = "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)";
        tierBorder = "#fbbf24";
    }

    const cardCount = vault.inventory ? vault.inventory.length : 0;
    const cardsVal = vault.inventory ? vault.inventory.reduce((acc, c) => acc + c.oracle_fair_value_usdc, 0) : 0;
    const totalTvl = vault.usdc_balance + cardsVal;

    const rawSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 640" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="50%" stop-color="#050811"/>
      <stop offset="100%" stop-color="#020408"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#6366f1" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <style>
    .title { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 800; fill: #ffffff; font-size: 20px; }
    .sub { font-family: monospace; font-size: 13px; fill: #38bdf8; font-weight: 600; }
    .badge { font-family: system-ui, sans-serif; font-weight: 800; font-size: 10px; fill: #ffffff; letter-spacing: 1.5px; }
    .lbl { font-family: system-ui, sans-serif; font-size: 11px; fill: #94a3b8; font-weight: 500; }
    .val { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 700; fill: #f8fafc; font-size: 17px; }
    .pnl { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 800; fill: ${pnlColor}; font-size: 20px; }
  </style>

  <!-- Frame -->
  <rect x="10" y="10" width="430" height="620" rx="24" fill="url(#bg)" stroke="${tierBorder}" stroke-width="3"/>

  <!-- Tier Ribbon -->
  <rect x="25" y="25" width="400" height="42" rx="12" fill="url(#headerGrad)"/>
  <text x="45" y="51" class="badge">${vault.tier_badge.toUpperCase()} • AUTONOMOUS VAULT</text>
  <circle cx="395" cy="46" r="6" fill="${vault.is_locked ? '#f59e0b' : '#10b981'}"/>

  <!-- Identity -->
  <text x="35" y="105" class="title">Merchant Vault #${vault.vault_id}</text>
  <text x="35" y="128" class="sub">${vault.sub_account}</text>

  <!-- Core Graphic Window -->
  <rect x="35" y="150" width="380" height="200" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
  <circle cx="225" cy="245" r="46" fill="#1e1b4b" stroke="${tierBorder}" stroke-width="2"/>
  <text x="225" y="252" text-anchor="middle" font-size="14" font-weight="bold" fill="#38bdf8" font-family="monospace">AI AGENT</text>
  <rect x="135" y="315" width="180" height="22" rx="11" fill="#1e293b"/>
  <text x="225" y="330" text-anchor="middle" font-size="10" font-weight="bold" fill="#94a3b8" font-family="monospace">${vault.strategy}</text>

  <!-- Metrics Grid -->
  <rect x="35" y="370" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b"/>
  <text x="50" y="394" class="lbl">REALIZED PNL</text>
  <text x="50" y="426" class="pnl">${pnlSign}$${vault.realized_pnl_usdc} USDC</text>

  <rect x="233" y="370" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b"/>
  <text x="248" y="394" class="lbl">USDC TREASURY</text>
  <text x="248" y="425" class="val">$${vault.usdc_balance} USDC</text>

  <rect x="35" y="456" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b"/>
  <text x="50" y="480" class="lbl">SETTLED A2A DEALS</text>
  <text x="50" y="511" class="val">${vault.trades_completed} Trades</text>

  <rect x="233" y="456" width="182" height="74" rx="14" fill="#0b1120" stroke="#1e293b"/>
  <text x="248" y="480" class="lbl">RWA SLABS IN VAULT</text>
  <text x="248" y="511" class="val">${cardCount} Slabs ($${cardsVal})</text>

  <!-- Guardrail Footer -->
  <rect x="35" y="546" width="380" height="52" rx="12" fill="#090d16" stroke="#1e293b"/>
  <text x="52" y="568" class="lbl">ON-CHAIN GUARDRAIL ENFORCED</text>
  <text x="52" y="586" font-family="monospace" font-size="11" fill="#38bdf8">Max Spend: $${vault.guardrail_max_spend_usdc} | Max Slippage: ${(vault.guardrail_max_slippage_bps / 100).toFixed(1)}%</text>
  <text x="390" y="575" text-anchor="end" font-size="10" font-weight="bold" fill="${vault.is_locked ? '#f59e0b' : '#10b981'}" font-family="system-ui">
    ${vault.is_locked ? 'LOCKED MUTEX' : 'ACTIVE AGENT'}
  </text>
</svg>`.trim();

    // Convert SVG to Base64 data URI
    const base64Svg = Buffer.from(rawSvg).toString("base64");
    return `data:image/svg+xml;base64,${base64Svg}`;
}

// ==========================================
// VAULTDECK MAIN SMART CONTRACT
// ==========================================

@NearBindgen({ requireInit: true })
export class MerchantVaultContract {
    owner_id: string = "";
    verified_bridge_signer: string = "";
    next_vault_id: bigint = 1n;
    total_protocol_volume_usdc: number = 0;

    // NEP-171 Core Storage
    tokens_per_owner: LookupMap<string[]> = new LookupMap<string[]>("a");
    tokens_by_id: LookupMap<Token> = new LookupMap<Token>("t");
    
    // Internal Vault Ledger (Synchronous multi-asset storage)
    vault_ledger: LookupMap<VaultState> = new LookupMap<VaultState>("v");

    @initialize({ requireInit: true })
    init({ owner_id, verified_bridge_signer }: { owner_id: string; verified_bridge_signer: string }) {
        this.owner_id = owner_id;
        this.verified_bridge_signer = verified_bridge_signer;
        this.next_vault_id = 1n;
        this.total_protocol_volume_usdc = 0;
    }

    // ==========================================
    // MODULE A.1: EXECUTABLE NFTS & SUB-ACCOUNTS
    // ==========================================

    @call({ payableFunction: true })
    mint_merchant_vault({
        name,
        strategy,
        guardrail_max_spend_usdc,
        guardrail_max_slippage_bps,
        agent_public_key,
        initial_usdc
    }: {
        name: string;
        strategy: string;
        guardrail_max_spend_usdc: number;
        guardrail_max_slippage_bps: number;
        agent_public_key: string;
        initial_usdc: number;
    }): Token {
        const caller = near.predecessorAccountId();
        const attachedDeposit = near.attachedDeposit();
        // Require at least 0.05 NEAR for storage staking
        assert(attachedDeposit >= 50000000000000000000000n, "Requires >= 0.05 NEAR attached for sub-account storage stake");

        const tokenId = `vault-${this.next_vault_id.toString()}`;
        this.next_vault_id += 1n;

        const contractId = near.currentAccountId();
        const subAccount = `${tokenId}.${contractId}`;

        // Initialize Internal Vault Ledger state
        const vaultState: VaultState = {
            vault_id: tokenId,
            sub_account: subAccount,
            owner_id: caller,
            usdc_balance: initial_usdc || 500,
            strategy: strategy || "BALANCED_TRADER",
            tier_badge: "Rookie",
            trades_completed: 0,
            unique_counterparties: [],
            realized_pnl_usdc: 0,
            is_locked: false,
            guardrail_max_spend_usdc: guardrail_max_spend_usdc || 300,
            guardrail_max_slippage_bps: guardrail_max_slippage_bps || 1500, // 15%
            agent_public_key: agent_public_key,
            inventory: []
        };

        this.vault_ledger.set(tokenId, vaultState);

        // Generate Dynamic Base64 SVG on-chain
        const dynamicMedia = generateOnChainBase64Svg(vaultState);

        const metadata: TokenMetadata = {
            title: name || `Merchant Vault #${tokenId}`,
            description: `Autonomous Merchant Vault NFT owning ${subAccount}. Trades Collector Crypt RWA Pokémon cards on NEAR.`,
            media: dynamicMedia,
            media_hash: null,
            copies: 1,
            issued_at: near.blockTimestamp().toString(),
            expires_at: null,
            starts_at: null,
            updated_at: null,
            extra: JSON.stringify({
                sub_account: subAccount,
                tier_badge: vaultState.tier_badge,
                strategy: vaultState.strategy,
                trades_completed: 0,
                realized_pnl_usdc: 0,
                usdc_balance: vaultState.usdc_balance
            }),
            reference: null,
            reference_hash: null
        };

        const token: Token = {
            token_id: tokenId,
            owner_id: caller,
            metadata: metadata,
            approved_account_ids: {}
        };

        this.tokens_by_id.set(tokenId, token);
        let userTokens = this.tokens_per_owner.get(caller) || [];
        userTokens.push(tokenId);
        this.tokens_per_owner.set(caller, userTokens);

        // Log Sub-account & Key Creation event
        near.log(`🚀 [SUB-ACCOUNT CREATED] ${subAccount} with FunctionCall key [${agent_public_key}]`);
        return token;
    }

    // ==========================================
    // MODULE A.2: VERIFIED RWA CARD IMPORT (NO FAKE JPEGS)
    // ==========================================

    @call({})
    import_verified_card({
        vault_id,
        solana_mint_address,
        psa_cert_number,
        grade,
        card_name,
        category,
        image_url,
        oracle_fair_value_usdc
    }: {
        vault_id: string;
        solana_mint_address: string;
        psa_cert_number: string;
        grade: string;
        card_name: string;
        category: string;
        image_url: string;
        oracle_fair_value_usdc: number;
    }): VerifiedCardRecord {
        const caller = near.predecessorAccountId();
        assert(
            caller === this.verified_bridge_signer || caller === this.owner_id,
            "Only the verified_bridge_signer custodian can mint verified RWA cards into vaults"
        );

        const vault = this.vault_ledger.get(vault_id);
        assert(vault !== null, `Vault ${vault_id} does not exist`);

        const cardRecord: VerifiedCardRecord = {
            card_id: `cc-rwa-${psa_cert_number}`,
            solana_mint_address,
            psa_cert_number,
            grade,
            card_name,
            category: category || "Pokemon",
            image_url,
            oracle_fair_value_usdc,
            vault_id
        };

        vault.inventory.push(cardRecord);
        this.vault_ledger.set(vault_id, vault);

        // Update token metadata
        this.updateDynamicNftMetadata(vault_id);

        near.log(`📦 [RWA SEALED] Verified ${grade} #${psa_cert_number} (${card_name}) minted into ${vault_id}`);
        return cardRecord;
    }

    // ==========================================
    // MODULE A.4: ATOMIC A2A BARTER SETTLEMENT
    // ==========================================

    @call({})
    execute_a2a_swap({
        buyer_vault_id,
        seller_vault_id,
        offered_card_ids,
        requested_card_ids,
        offered_usdc,
        requested_usdc
    }: {
        buyer_vault_id: string;
        seller_vault_id: string;
        offered_card_ids: string[];
        requested_card_ids: string[];
        offered_usdc: number;
        requested_usdc: number;
    }) {
        const buyer = this.vault_ledger.get(buyer_vault_id);
        const seller = this.vault_ledger.get(seller_vault_id);

        assert(buyer !== null, "Buyer vault not found");
        assert(seller !== null, "Seller vault not found");
        assert(!buyer.is_locked, `Buyer vault ${buyer_vault_id} is locked`);
        assert(!seller.is_locked, `Seller vault ${seller_vault_id} is locked`);

        // GUARDRAIL 1: On-Chain Max Spend Enforcement
        if (offered_usdc > 0) {
            assert(
                offered_usdc <= buyer.guardrail_max_spend_usdc,
                `Security Guardrail Rejection: offered USDC ($${offered_usdc}) exceeds buyer limit ($${buyer.guardrail_max_spend_usdc})`
            );
            assert(buyer.usdc_balance >= offered_usdc, "Insufficient USDC in buyer vault");
        }
        if (requested_usdc > 0) {
            assert(
                requested_usdc <= seller.guardrail_max_spend_usdc,
                `Security Guardrail Rejection: requested USDC ($${requested_usdc}) exceeds seller limit ($${seller.guardrail_max_spend_usdc})`
            );
            assert(seller.usdc_balance >= requested_usdc, "Insufficient USDC in seller vault");
        }

        // Verify Cards exist in respective inventories
        const cardsToMoveFromBuyer: VerifiedCardRecord[] = [];
        for (const cId of offered_card_ids) {
            const idx = buyer.inventory.findIndex(c => c.card_id === cId);
            assert(idx !== -1, `Card ${cId} not found in buyer inventory`);
            cardsToMoveFromBuyer.push(buyer.inventory[idx]);
        }

        const cardsToMoveFromSeller: VerifiedCardRecord[] = [];
        for (const cId of requested_card_ids) {
            const idx = seller.inventory.findIndex(c => c.card_id === cId);
            assert(idx !== -1, `Card ${cId} not found in seller inventory`);
            cardsToMoveFromSeller.push(seller.inventory[idx]);
        }

        // GUARDRAIL 2: Oracle Fair Value Slippage Check
        const valueGivenByBuyer = offered_usdc + cardsToMoveFromBuyer.reduce((s, c) => s + c.oracle_fair_value_usdc, 0);
        const valueReceivedByBuyer = requested_usdc + cardsToMoveFromSeller.reduce((s, c) => s + c.oracle_fair_value_usdc, 0);

        const buyerSlippageBps = buyer.guardrail_max_slippage_bps || 1500;
        const minAllowedValueForBuyer = valueGivenByBuyer * (1 - (buyerSlippageBps / 10000));
        assert(
            valueReceivedByBuyer >= minAllowedValueForBuyer,
            `Slippage Guardrail Breach: Value received ($${valueReceivedByBuyer}) is below buyer tolerance limit ($${minAllowedValueForBuyer})`
        );

        // 0.5% Protocol Fee on Cash top-up (Anti-Wash Trading deterrent)
        const totalCashMoved = offered_usdc + requested_usdc;
        const protocolFee = Math.round(totalCashMoved * 0.005);

        // ATOMIC INTERNAL LEDGER EXECUTION
        buyer.usdc_balance = buyer.usdc_balance - offered_usdc + requested_usdc - Math.floor(protocolFee / 2);
        seller.usdc_balance = seller.usdc_balance - requested_usdc + offered_usdc - Math.ceil(protocolFee / 2);

        // Transfer Cards
        buyer.inventory = buyer.inventory.filter(c => !offered_card_ids.includes(c.card_id));
        seller.inventory = seller.inventory.filter(c => !requested_card_ids.includes(c.card_id));

        for (const c of cardsToMoveFromBuyer) {
            c.vault_id = seller_vault_id;
            seller.inventory.push(c);
        }
        for (const c of cardsToMoveFromSeller) {
            c.vault_id = buyer_vault_id;
            buyer.inventory.push(c);
        }

        // Telemetry & Tier Progression
        buyer.trades_completed += 1;
        seller.trades_completed += 1;

        if (!buyer.unique_counterparties.includes(seller.owner_id)) {
            buyer.unique_counterparties.push(seller.owner_id);
        }
        if (!seller.unique_counterparties.includes(buyer.owner_id)) {
            seller.unique_counterparties.push(buyer.owner_id);
        }

        const buyerPnl = valueReceivedByBuyer - valueGivenByBuyer;
        buyer.realized_pnl_usdc += buyerPnl;
        seller.realized_pnl_usdc -= buyerPnl;

        this.updateTierBadge(buyer);
        this.updateTierBadge(seller);

        this.vault_ledger.set(buyer_vault_id, buyer);
        this.vault_ledger.set(seller_vault_id, seller);
        this.total_protocol_volume_usdc += (valueGivenByBuyer + valueReceivedByBuyer);

        // Update Dynamic on-chain SVGs
        this.updateDynamicNftMetadata(buyer_vault_id);
        this.updateDynamicNftMetadata(seller_vault_id);

        near.log(
            `🤝 [ATOMIC A2A SETTLEMENT] ${buyer_vault_id} ⇄ ${seller_vault_id} completed. Swapped ${cardsToMoveFromBuyer.length + cardsToMoveFromSeller.length} cards + $${totalCashMoved} USDC`
        );
    }

    private updateTierBadge(vault: VaultState) {
        if (vault.trades_completed >= 30 && vault.realized_pnl_usdc >= 500) {
            vault.tier_badge = "Whale Vault";
        } else if (vault.trades_completed >= 10 && vault.realized_pnl_usdc >= 100) {
            vault.tier_badge = "Shark";
        } else {
            vault.tier_badge = "Rookie";
        }
    }

    private updateDynamicNftMetadata(vaultId: string) {
        const vault = this.vault_ledger.get(vaultId);
        if (!vault) return;
        const token = this.tokens_by_id.get(vaultId);
        if (!token) return;

        token.metadata.media = generateOnChainBase64Svg(vault);
        token.metadata.updated_at = near.blockTimestamp().toString();
        token.metadata.extra = JSON.stringify({
            sub_account: vault.sub_account,
            tier_badge: vault.tier_badge,
            strategy: vault.strategy,
            trades_completed: vault.trades_completed,
            unique_counterparties: vault.unique_counterparties.length,
            realized_pnl_usdc: vault.realized_pnl_usdc,
            usdc_balance: vault.usdc_balance,
            card_count: vault.inventory.length
        });

        this.tokens_by_id.set(vaultId, token);
    }

    // ==========================================
    // MODULE A.5: MANDATORY RED-TEAM SECURITY FIXES
    // ==========================================

    @call({})
    lock_vault({ vault_id }: { vault_id: string }) {
        const caller = near.predecessorAccountId();
        const vault = this.vault_ledger.get(vault_id);
        assert(vault !== null, "Vault not found");
        assert(vault.owner_id === caller, "Only owner can lock vault");
        vault.is_locked = true;
        this.vault_ledger.set(vault_id, vault);
        this.updateDynamicNftMetadata(vault_id);
    }

    @call({})
    unlock_vault({ vault_id }: { vault_id: string }) {
        const caller = near.predecessorAccountId();
        const vault = this.vault_ledger.get(vault_id);
        assert(vault !== null, "Vault not found");
        assert(vault.owner_id === caller, "Only owner can unlock vault");
        vault.is_locked = false;
        this.vault_ledger.set(vault_id, vault);
        this.updateDynamicNftMetadata(vault_id);
    }

    @call({})
    withdraw_usdc({ vault_id, amount }: { vault_id: string; amount: number }) {
        const caller = near.predecessorAccountId();
        const vault = this.vault_ledger.get(vault_id);
        assert(vault !== null, "Vault not found");
        assert(vault.owner_id === caller, "Only owner can withdraw USDC");
        // ANTI-FRONTRUNNING FIX: Withdrawals blocked when vault is locked for sale/escrow
        assert(!vault.is_locked, "Anti-Front-Running Lock Active: Cannot withdraw USDC while vault is locked");
        assert(vault.usdc_balance >= amount, "Insufficient USDC balance");

        vault.usdc_balance -= amount;
        this.vault_ledger.set(vault_id, vault);
        this.updateDynamicNftMetadata(vault_id);
        near.log(`💸 [WITHDRAW USDC] ${amount} USDC withdrawn from ${vault_id} by ${caller}`);
    }

    @call({})
    withdraw_card({ vault_id, card_id }: { vault_id: string; card_id: string }) {
        const caller = near.predecessorAccountId();
        const vault = this.vault_ledger.get(vault_id);
        assert(vault !== null, "Vault not found");
        assert(vault.owner_id === caller, "Only owner can withdraw card");
        // ANTI-FRONTRUNNING FIX: Withdrawals blocked when vault is locked
        assert(!vault.is_locked, "Anti-Front-Running Lock Active: Cannot withdraw cards while vault is locked");

        const cardIdx = vault.inventory.findIndex(c => c.card_id === card_id);
        assert(cardIdx !== -1, "Card not found in vault");

        const removedCard = vault.inventory.splice(cardIdx, 1)[0];
        this.vault_ledger.set(vault_id, vault);
        this.updateDynamicNftMetadata(vault_id);
        near.log(`🃏 [WITHDRAW CARD] Card ${card_id} withdrawn from ${vault_id} by ${caller}`);
    }

    // ==========================================
    // NEP-171 IMPLEMENTATION + ZOMBIE KEY WIPE
    // ==========================================

    @call({ payableFunction: true })
    nft_transfer({
        receiver_id,
        token_id,
        approval_id,
        memo
    }: {
        receiver_id: string;
        token_id: string;
        approval_id?: number;
        memo?: string;
    }) {
        const caller = near.predecessorAccountId();
        const token = this.tokens_by_id.get(token_id);
        assert(token !== null, "Token not found");
        assert(token.owner_id === caller, "Caller does not own this Merchant Vault NFT");

        const vault = this.vault_ledger.get(token_id);
        assert(vault !== null, "Vault state not found");

        // RED-TEAM FIX 1: Can only transfer if not in active barter lock
        // RED-TEAM FIX 2: ZOMBIE KEY WIPE
        const oldKey = vault.agent_public_key;
        vault.agent_public_key = null; // Purge old AI session key
        vault.is_locked = false;       // Reset lock
        vault.owner_id = receiver_id;
        this.vault_ledger.set(token_id, vault);

        // Update NEP-171 owner
        token.owner_id = receiver_id;
        token.approved_account_ids = {};
        this.tokens_by_id.set(token_id, token);

        // Update ownership maps
        let senderTokens = this.tokens_per_owner.get(caller) || [];
        senderTokens = senderTokens.filter(t => t !== token_id);
        this.tokens_per_owner.set(caller, senderTokens);

        let receiverTokens = this.tokens_per_owner.get(receiver_id) || [];
        receiverTokens.push(token_id);
        this.tokens_per_owner.set(receiver_id, receiverTokens);

        // Regenerate On-chain Dynamic SVG with new owner
        this.updateDynamicNftMetadata(token_id);

        near.log(
            `🧹 [ZOMBIE KEY WIPE] Revoked AI key [${oldKey}] for vault ${token_id}. Business-in-a-Box transferred to ${receiver_id}. Memo: ${memo || ""}`
        );
    }

    @call({})
    set_agent_key({ vault_id, new_agent_public_key }: { vault_id: string; new_agent_public_key: string }) {
        const caller = near.predecessorAccountId();
        const vault = this.vault_ledger.get(vault_id);
        assert(vault !== null, "Vault not found");
        assert(vault.owner_id === caller, "Only current vault owner can register new AI agent key");

        vault.agent_public_key = new_agent_public_key;
        this.vault_ledger.set(vault_id, vault);
        near.log(`🔑 [AGENT KEY ROTATED] Sub-account ${vault.sub_account} bound to key ${new_agent_public_key}`);
    }

    // ==========================================
    // NEP-171 & NEP-177 VIEW METHODS
    // ==========================================

    @view({})
    nft_token({ token_id }: { token_id: string }): Token | null {
        return this.tokens_by_id.get(token_id) || null;
    }

    @view({})
    nft_metadata(): NFTContractMetadata {
        return {
            spec: "nft-1.0.0",
            name: "VaultDeck Merchant Vaults",
            symbol: "VDECK",
            icon: null,
            base_uri: null,
            reference: null,
            reference_hash: null
        };
    }

    @view({})
    nft_total_supply(): string {
        return (this.next_vault_id - 1n).toString();
    }

    @view({})
    nft_tokens({ from_index, limit }: { from_index?: number; limit?: number }): Token[] {
        const start = from_index || 0;
        const count = limit || 50;
        const result: Token[] = [];
        for (let i = 1n; i < this.next_vault_id; i++) {
            const t = this.tokens_by_id.get(`vault-${i.toString()}`);
            if (t) result.push(t);
            if (result.length >= count) break;
        }
        return result;
    }

    @view({})
    get_vault({ vault_id }: { vault_id: string }): VaultState | null {
        return this.vault_ledger.get(vault_id) || null;
    }

    @view({})
    get_stats(): Record<string, any> {
        return {
            total_vaults: (this.next_vault_id - 1n).toString(),
            total_protocol_volume_usdc: this.total_protocol_volume_usdc,
            verified_bridge_signer: this.verified_bridge_signer
        };
    }
}
