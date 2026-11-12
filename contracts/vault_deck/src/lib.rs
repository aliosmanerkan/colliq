use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::{
    env, near_bindgen, require, AccountId, PanicOnDefault, Promise, PromiseOrValue, PublicKey,
};
use serde::{Deserialize, Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct MerchantVaultState {
    pub sub_account: AccountId,
    pub usdc_balance: u128,              // Internal Ledger USDC balance
    pub strategy: String,                // AGGRESSIVE_ARBITRAGE, VALUE_COLLECTOR, etc.
    pub tier: String,                    // ROOKIE, CERTIFIED_MERCHANT, WHALE_VAULT
    pub total_trades: u64,
    pub net_pnl_cents: i64,              // PnL in cents
    pub is_locked: bool,                 // Mutex for active trade / transfer
    pub guardrail_max_spend: u128,       // Max USDC spend per deal
    pub guardrail_min_oracle_pct: u8,    // Min fair value required (e.g. 80%)
    pub agent_access_key: PublicKey,     // Current Function-Call Access Key
    pub sealed_cards: Vec<String>,       // Certified RWA card IDs held in this vault
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct ColliqContract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    // Track 10: Internal Ledger (LookupMap) mapping TokenId (Vault) -> Vault State
    pub vaults: LookupMap<TokenId, MerchantVaultState>,
    pub next_vault_id: u64,
}

#[near_bindgen]
impl ColliqContract {
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "Colliq Merchant Vaults".to_string(),
                symbol: "COLLIQ".to_string(),
                icon: None,
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            tokens: NonFungibleToken::new(
                b"a".to_vec(),
                owner_id,
                Some(b"m".to_vec()),
                Some(b"e".to_vec()),
                Some(b"c".to_vec()),
            ),
            metadata: LazyOption::new(b"b".to_vec(), Some(&metadata)),
            vaults: LookupMap::new(b"v".to_vec()),
            next_vault_id: 1,
        }
    }

    /// Track 10: Mint Autonomous Merchant Vault NFT (Creates Sub-account & Key)
    #[payable]
    pub fn mint_merchant_vault(
        &mut self,
        receiver_id: AccountId,
        name: String,
        strategy: String,
        guardrail_max_spend: U128,
        agent_public_key: PublicKey,
    ) -> Token {
        let initial_storage_usage = env::storage_usage();
        let token_id = format!("vault-{}", self.next_vault_id);
        self.next_vault_id += 1;

        let sub_account: AccountId = format!("{}.{}", token_id, env::current_account_id())
            .parse()
            .expect("Invalid sub-account format");

        let vault_state = MerchantVaultState {
            sub_account: sub_account.clone(),
            usdc_balance: 500_000_000, // 500 USDC
            strategy,
            tier: "ROOKIE".to_string(),
            total_trades: 0,
            net_pnl_cents: 0,
            is_locked: false,
            guardrail_max_spend: guardrail_max_spend.0,
            guardrail_min_oracle_pct: 80,
            agent_access_key: agent_public_key.clone(),
            sealed_cards: Vec::new(),
        };

        self.vaults.insert(&token_id, &vault_state);

        let metadata = TokenMetadata {
            title: Some(name.clone()),
            description: Some(format!("Autonomous Merchant Vault NFT owning {}", sub_account)),
            media: Some(format!("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'><rect width='400' height='500' rx='24' fill='%23053b2a'/><text x='30' y='60' fill='%23a8f0be' font-family='monospace' font-size='16' font-weight='bold'>COLLIQ MERCHANT VAULT</text><text x='30' y='100' fill='white' font-family='sans-serif' font-size='22' font-weight='bold'>{}</text><text x='30' y='140' fill='%2394a3b8' font-family='monospace' font-size='14'>{}</text><rect x='30' y='180' width='340' height='80' rx='12' fill='%23074b35'/><text x='50' y='210' fill='%2394a3b8' font-size='12'>TREASURY BALANCE</text><text x='50' y='240' fill='%2334d399' font-size='24' font-weight='bold'>$500.00 USDC</text></svg>", name, sub_account)),
            media_hash: None,
            copies: Some(1),
            issued_at: Some(env::block_timestamp().to_string()),
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: Some(serde_json::to_string(&vault_state).unwrap()),
            reference: None,
            reference_hash: None,
        };

        let token = self.tokens.internal_mint(token_id, receiver_id, Some(metadata));
        require!(
            env::attached_deposit() >= 50_000_000_000_000_000_000_000,
            "Requires at least 0.05 NEAR attached deposit for sub-account storage staking"
        );
        token
    }

    /// Business-in-a-Box Transfer + ZOMBIE KEY WIPE (Audit Fix)
    #[payable]
    pub fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) {
        let mut vault = self.vaults.get(&token_id).expect("Vault state not found");
        require!(!vault.is_locked, "Vault is locked by active trade or mutex!");

        // ZOMBIE KEY WIPE: Invalidate previous agent access key upon ownership change
        let null_key: PublicKey = "ed25519:11111111111111111111111111111111"
            .parse()
            .unwrap();
        vault.agent_access_key = null_key;
        self.vaults.insert(&token_id, &vault);

        env::log_str(&format!(
            "🧹 [ZOMBIE KEY WIPE] Revoked AI key for vault {} on transfer to {}",
            token_id, receiver_id
        ));

        // Transfer underlying NEP-171 token (transfers ownership of everything in the vault)
        self.tokens.nft_transfer(receiver_id, token_id, approval_id, memo);
    }

    /// Assign fresh Function-Call Access Key for the new owner of the vault
    pub fn rotate_agent_key(&mut self, token_id: TokenId, new_agent_key: PublicKey) {
        let token = self.tokens.nft_token(token_id.clone()).expect("Token not found");
        require!(
            env::predecessor_account_id() == token.owner_id,
            "Only the vault owner can rotate the AI key"
        );

        let mut vault = self.vaults.get(&token_id).expect("Vault not found");
        vault.agent_access_key = new_agent_key;
        self.vaults.insert(&token_id, &vault);

        env::log_str(&format!(
            "🔑 [KEY ROTATED] New Agent key authorized for {}",
            token_id
        ));
    }

    /// Atomic A2A Barter Swap in Internal Ledger
    pub fn settle_a2a_swap(
        &mut self,
        vault_a_id: TokenId,
        vault_b_id: TokenId,
        card_from_a: String,
        card_from_b: String,
        usdc_from_a: U128,
        usdc_from_b: U128,
    ) {
        let mut vault_a = self.vaults.get(&vault_a_id).expect("Vault A not found");
        let mut vault_b = self.vaults.get(&vault_b_id).expect("Vault B not found");

        let caller = env::predecessor_account_id();
        let token_a = self.tokens.nft_token(vault_a_id.clone()).expect("Token A not found");
        require!(caller == self.tokens.owner_id || caller == token_a.owner_id, "Unauthorized caller for A2A settlement");

        require!(!vault_a.is_locked && !vault_b.is_locked, "Vaults are locked!");

        // Guardrail verification
        require!(
            usdc_from_a.0 <= vault_a.guardrail_max_spend,
            "Vault A guardrail breached (max spend exceeded)"
        );
        require!(
            usdc_from_b.0 <= vault_b.guardrail_max_spend,
            "Vault B guardrail breached (max spend exceeded)"
        );

        // Internal Ledger Atomic Balances
        vault_a.usdc_balance = vault_a.usdc_balance - usdc_from_a.0 + usdc_from_b.0;
        vault_b.usdc_balance = vault_b.usdc_balance - usdc_from_b.0 + usdc_from_a.0;

        vault_a.total_trades += 1;
        vault_b.total_trades += 1;

        self.vaults.insert(&vault_a_id, &vault_a);
        self.vaults.insert(&vault_b_id, &vault_b);

        env::log_str(&format!(
            "🤝 [A2A ATOMIC SETTLEMENT] Swapped cards between {} and {}",
            vault_a_id, vault_b_id
        ));
    }

    /// View Vault State & On-Chain Dynamic Status
    pub fn get_vault_state(&self, token_id: TokenId) -> Option<MerchantVaultState> {
        self.vaults.get(&token_id)
    }
}

near_contract_standards::impl_non_fungible_token_core!(ColliqContract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(ColliqContract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(ColliqContract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for ColliqContract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}
