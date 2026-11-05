import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../model/model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CC_JSON_PATH = path.join(__dirname, "../collector_crypt_real_cards.json");

let cachedCollectorCryptCards = null;

export function getCollectorCryptInventory() {
    if (!cachedCollectorCryptCards) {
        try {
            if (fs.existsSync(CC_JSON_PATH)) {
                const data = fs.readFileSync(CC_JSON_PATH, "utf-8");
                cachedCollectorCryptCards = JSON.parse(data);
            } else {
                cachedCollectorCryptCards = [];
            }
        } catch (err) {
            console.error("Failed to load collector_crypt_real_cards.json:", err);
            cachedCollectorCryptCards = [];
        }
    }
    return cachedCollectorCryptCards;
}

export async function bridgeCollectorCryptCardToNearVault(cardId, vaultId, ownerAccount) {
    const ccCards = getCollectorCryptInventory();
    const ccCard = ccCards.find(c => c.id === cardId);
    if (!ccCard) throw new Error("Collector Crypt card not found");

    const vault = await db.vault.findOne({ where: { id: vaultId } });
    if (!vault) throw new Error("Target NEAR Merchant Vault not found");

    if (vault.is_locked) {
        throw new Error("Vault is currently locked. Cannot bridge cards.");
    }

    const cardPrice = ccCard.insuredUsd || ccCard.costUsd || 50.0;
    if (vault.usdc_balance < cardPrice) {
        throw new Error(`Insufficient USDC in vault. Required: $${cardPrice}, Available: $${vault.usdc_balance}`);
    }

    // Deduct USDC from vault treasury
    vault.usdc_balance = Math.round((vault.usdc_balance - cardPrice) * 100) / 100;
    await vault.save();

    // Generate certified barcode & PSA cert number from Solana mint
    const certNum = ccCard.id.substring(0, 8).toUpperCase();
    const barcode = `CC-${certNum}-PSA`;

    // Create or transfer card into NEAR vault inventory
    const newCard = await db.card.create({
        card_id: `cc-rwa-${ccCard.id.substring(0, 12)}`,
        vault_id: vault.id,
        owner_account: vault.sub_account,
        psa_cert_number: certNum,
        solana_mint: ccCard.id,
        name: ccCard.name,
        category: ccCard.category || "Pokemon",
        set_name: ccCard.name.split("PSA")[0]?.trim() || "Collector Crypt Vault",
        grade: ccCard.grade || "PSA 10 GEM MT",
        rareness_score: ccCard.rareness || 75,
        oracle_fair_value_usdc: cardPrice,
        last_sale_usdc: ccCard.costUsd || cardPrice,
        image_url: ccCard.imageUrl,
        barcode: barcode,
        population_higher: ccCard.population?.higher || 0,
        is_locked: false
    });

    return {
        status: "BRIDGED_TO_NEAR",
        card: newCard,
        vault: {
            id: vault.id,
            name: vault.name,
            sub_account: vault.sub_account,
            new_usdc_balance: vault.usdc_balance
        },
        solana_mint: ccCard.id,
        vault_custody: "Brink's Vault (Collector Crypt Sealed)",
        tx_hash: `0xnear_bridge_${Date.now()}`
    };
}

export async function seedInitialVaultsAndCards() {
    try {
        const count = await db.vault.count();
        if (count > 0) return;

        console.log("🌱 Seeding initial Autonomous Merchant Vaults and authentic Collector Crypt RWA Slabs...");

        const v1 = await db.vault.create({
            vault_id: "vault-1",
            sub_account: "vault-1.market.near",
            name: "Kanto Apex Merchant",
            owner_account: "alierkan.testnet",
            usdc_balance: 1850.0,
            strategy: "VALUE_COLLECTOR",
            tier: "CERTIFIED_MERCHANT",
            total_trades: 14,
            unique_counterparties: 8,
            pnl_percentage: 18.4,
            net_pnl_usdc: 840.0,
            guardrail_max_spend_per_trade: 500.0,
            guardrail_min_oracle_fair_value_pct: 82.0,
            avatar_color: "#ef4444",
            bio: "Specializes in Vintage & 25th Anniversary PSA 10 slabs. Patient value hunter."
        });

        const v2 = await db.vault.create({
            vault_id: "vault-2",
            sub_account: "vault-2.market.near",
            name: "Neo Shard Arbitrageur",
            owner_account: "crypto_whale.testnet",
            usdc_balance: 3200.0,
            strategy: "AGGRESSIVE_ARBITRAGE",
            tier: "WHALE_VAULT",
            total_trades: 42,
            unique_counterparties: 26,
            pnl_percentage: 34.2,
            net_pnl_usdc: 2450.0,
            guardrail_max_spend_per_trade: 1200.0,
            guardrail_min_oracle_fair_value_pct: 78.0,
            avatar_color: "#06b6d4",
            bio: "High frequency cash+card barter merchant. Exploits micro spreads across RWA slabs."
        });

        const v3 = await db.vault.create({
            vault_id: "vault-3",
            sub_account: "vault-3.market.near",
            name: "Moonbreon Syndicate",
            owner_account: "satoshi_collector.testnet",
            usdc_balance: 890.0,
            strategy: "MOMENTUM_SNIPER",
            tier: "ROOKIE",
            total_trades: 6,
            unique_counterparties: 5,
            pnl_percentage: 8.5,
            net_pnl_usdc: 190.0,
            guardrail_max_spend_per_trade: 350.0,
            guardrail_min_oracle_fair_value_pct: 85.0,
            avatar_color: "#8b5cf6",
            bio: "Modern alternative art secret rare specialist. Snipes underpriced Evolving Skies."
        });

        // Seed 10 authentic cards from the real Collector Crypt inventory
        const ccCards = getCollectorCryptInventory();
        const initialPicks = ccCards.slice(0, 10);

        for (let i = 0; i < initialPicks.length; i++) {
            const c = initialPicks[i];
            const targetVault = i % 3 === 0 ? v1 : i % 3 === 1 ? v2 : v3;
            const certNum = c.id.substring(0, 8).toUpperCase();

            await db.card.create({
                card_id: `cc-rwa-${c.id.substring(0, 12)}`,
                vault_id: targetVault.id,
                owner_account: targetVault.sub_account,
                psa_cert_number: certNum,
                solana_mint: c.id,
                name: c.name,
                category: c.category || "Pokemon",
                set_name: c.name.split("PSA")[0]?.trim() || "Collector Crypt Vault",
                grade: c.grade || "PSA 10 GEM MT",
                rareness_score: c.rareness || 80,
                oracle_fair_value_usdc: c.insuredUsd || c.costUsd || 60,
                last_sale_usdc: c.costUsd || 55,
                image_url: c.imageUrl,
                barcode: `CC-${certNum}`,
                population_higher: c.population?.higher || 0,
                is_locked: false
            });
        }

        console.log("✅ Seed completed with authentic Collector Crypt inventory!");
    } catch (err) {
        console.error("Seed error:", err.message);
    }
}
