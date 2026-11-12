import express from "express";
import db from "../model/model.js";
import nearService from "../services/NearService.js";
import { 
    getCollectorCryptInventory, 
    bridgeCollectorCryptCardToNearVault, 
    fetchCollectorCryptMarketplace, 
    findCollectorCryptCardById 
} from "../services/CollectorCryptService.js";

const router = express.Router();

// GET live NEAR testnet network status from RPC
router.get("/near-status", async (req, res) => {
    try {
        const status = await nearService.getNetworkStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify testnet account
router.get("/verify-account/:accountId", async (req, res) => {
    try {
        const result = await nearService.verifyAccountExists(req.params.accountId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all RWA cards currently held in NEAR Merchant Vaults
router.get("/cards", async (req, res) => {
    try {
        const cards = await db.card.findAll({
            include: [{ model: db.vault, as: "vault", attributes: ["name", "sub_account", "tier"] }],
            order: [["oracle_fair_value_usdc", "DESC"]]
        });
        res.json({ cards });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET authentic Collector Crypt inventory (170k+ Live Solana Brink's & PWCC Vaults)
router.get("/collector-crypt", async (req, res) => {
    try {
        const { 
            search, 
            category, 
            gradingCompany, 
            grade, 
            sortBy, 
            orderBy, 
            cursor, 
            limit, 
            listedOnly 
        } = req.query;

        const result = await fetchCollectorCryptMarketplace({
            search,
            category,
            gradingCompany,
            grade,
            sortBy: sortBy || orderBy,
            cursor,
            limit: limit ? parseInt(limit, 10) : 48,
            listedOnly: listedOnly === "true" || listedOnly === true
        });

        res.json(result);
    } catch (err) {
        console.error("Marketplace fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Buy Collector Crypt Card and secure into a NEAR Merchant Vault
router.post("/collector-crypt/buy", async (req, res) => {
    try {
        const { card_id, vault_id, owner_account, card_data } = req.body;
        if (!card_id || !vault_id) {
            return res.status(400).json({ error: "card_id and vault_id are required" });
        }

        const result = await bridgeCollectorCryptCardToNearVault(
            card_id, 
            vault_id, 
            owner_account || "alierkan.testnet", 
            card_data
        );
        res.json(result);
    } catch (err) {
        console.error("Buy card error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Bridge Collector Crypt Card to a NEAR Merchant Vault
router.post("/collector-crypt/bridge", async (req, res) => {
    try {
        const { card_id, vault_id, owner_account, card_data } = req.body;
        if (!card_id || !vault_id) {
            return res.status(400).json({ error: "card_id and vault_id are required" });
        }

        const result = await bridgeCollectorCryptCardToNearVault(
            card_id, 
            vault_id, 
            owner_account || "alierkan.testnet", 
            card_data
        );
        res.json(result);
    } catch (err) {
        console.error("Bridge card error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Ensures system vault exists for physical vault custody transfers
async function getOrCreateCollectorCryptVault() {
    let ccVault = await db.vault.findOne({ where: { sub_account: "collectorcrypt.colliq.testnet" } });
    if (!ccVault) {
        ccVault = await db.vault.create({
            vault_id: "v-collectorcrypt-system",
            sub_account: "collectorcrypt.colliq.testnet",
            name: "Collector Crypt Vault (PWCC / Brink's)",
            owner_account: "collectorcrypt.testnet",
            usdc_balance: 500000.0,
            strategy: "MARKET_MAKER",
            tier: "MASTER",
            guardrail_max_spend_per_trade: 50000.0,
            guardrail_min_oracle_fair_value_pct: 70.0,
            custom_rules: JSON.stringify(["Physical Slab Custodian", "PWCC / Brink's Oregon Vault"]),
            chat_history: "[]",
            access_key_public: "ed25519:collectorcryptsystemkey",
            bio: "Physical vault custodian securing 170k+ authenticated PSA/CGC slabs."
        });
    }
    return ccVault;
}

// Direct Buy with Personal Account (Manual Purchase with NEAR or USDC)
router.post("/buy-direct", async (req, res) => {
    try {
        const { card_id, buyer_account, tx_hash, payment_method, near_amount, card_data } = req.body;
        if (!card_id || !buyer_account) {
            return res.status(400).json({ error: "card_id and buyer_account are required" });
        }

        const ccCard = findCollectorCryptCardById(card_id, card_data);

        let finalCard;
        if (ccCard) {
            const certNum = ccCard.certNumber || ccCard.id.substring(0, 8).toUpperCase();
            const cardPrice = ccCard.insuredUsd || ccCard.costUsd || 50.0;
            const existingCard = await db.card.findOne({
                where: db.Sequelize.or({ solana_mint: ccCard.id }, { card_id: ccCard.id })
            });

            if (existingCard) {
                existingCard.vault_id = null;
                existingCard.owner_account = buyer_account;
                existingCard.is_locked = false;
                existingCard.oracle_fair_value_usdc = cardPrice;
                await existingCard.save();
                finalCard = existingCard;
            } else {
                finalCard = await db.card.create({
                    card_id: `cc-rwa-${ccCard.id.substring(0, 10)}-${Date.now().toString(36)}`,
                    vault_id: null,
                    owner_account: buyer_account,
                    psa_cert_number: certNum,
                    solana_mint: ccCard.id,
                    name: ccCard.name,
                    category: ccCard.category || "Pokemon",
                    set_name: ccCard.set || ccCard.name.split("PSA")[0]?.trim() || "Collector Crypt Vault",
                    grade: ccCard.grade || "PSA 10 GEM MT",
                    rareness_score: ccCard.rareness || 80,
                    oracle_fair_value_usdc: cardPrice,
                    last_sale_usdc: ccCard.costUsd || cardPrice,
                    image_url: ccCard.imageUrl,
                    barcode: `CC-${certNum}-${ccCard.gradingCompany || "PSA"}`,
                    population_higher: ccCard.population?.higher || 0,
                    is_locked: false
                });
            }
        } else {
            const existingCard = await db.card.findOne({ where: { card_id } });
            if (!existingCard) return res.status(404).json({ error: "Card not found" });
            if (existingCard.is_locked) return res.status(400).json({ error: "Card is locked in active trade" });

            existingCard.vault_id = null;
            existingCard.owner_account = buyer_account;
            existingCard.is_locked = false;
            await existingCard.save();
            finalCard = existingCard;
        }

        const networkInfo = await nearService.getNetworkStatus();
        const settledTxHash = tx_hash || nearService.generateNearReceiptHash();
        const cardPrice = Number(finalCard.oracle_fair_value_usdc || finalCard.last_sale_usdc || 50);

        // Generate cryptographically signed NEP-413 Cross-Chain RWA Acquisition Intent
        const nearIntent = nearService.createCrossChainSnipeIntent({
            signerAccount: buyer_account,
            solanaMint: finalCard.solana_mint || String(card_id),
            cardName: finalCard.name,
            usdcAmount: cardPrice,
            nearAmount: near_amount || null,
            destinationMpcAddress: nearService.deriveSolanaAddressForVault(buyer_account)
        });

        let ccVault = await getOrCreateCollectorCryptVault();
        const buyerVault = await db.vault.findOne({ where: { owner_account: buyer_account } });
        const fallbackVaultId = ccVault?.id || 1;
        const vaultAId = buyerVault ? buyerVault.id : fallbackVaultId;
        const vaultBId = ccVault ? ccVault.id : fallbackVaultId;

        const tradeId = `direct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        try {
            await db.trade.create({
                trade_id: tradeId,
                vault_a_id: vaultAId,
                vault_b_id: vaultBId,
                vault_a_name: buyer_account,
                vault_b_name: "Collector Crypt Vault (PWCC / Brink's)",
                cards_from_a: [],
                cards_from_b: [finalCard.toJSON ? finalCard.toJSON() : finalCard],
                usdc_from_a: cardPrice,
                usdc_from_b: 0.0,
                rounds_count: 1,
                negotiation_log: [
                    {
                        round: 1,
                        agent: buyer_account,
                        turn: {
                            decision: "ACCEPT",
                            public_argument: `Direct user acquisition: Secured ${finalCard.name} (${finalCard.grade || "PSA 10"}) via NEAR Intent (${nearIntent.intent_id}).`,
                            private_reasoning_for_owner: `Signed NEP-413 Cross-Chain Swap. Payment settled via ${payment_method || "NEAR"}${near_amount ? ` (${near_amount} NEAR)` : ""}. Custody: Brink's / PWCC.`,
                            near_intent: nearIntent
                        }
                    }
                ],
                status: "COMPLETED",
                protocol_fee_usdc: Math.round(cardPrice * 0.005 * 100) / 100,
                tx_hash: settledTxHash,
                near_block: networkInfo.latest_block_height
            });
        } catch (logErr) {
            console.warn("Trade log notice:", logErr.message);
        }

        const io = req.app.get("io");
        if (io) {
            io.emit("market_snipe", {
                vault: { id: null, name: buyer_account, sub_account: buyer_account, usdc_balance: 0 },
                card: finalCard,
                price: cardPrice,
                tx_hash: settledTxHash
            });
            io.emit("trade:event", {
                vaultA: buyer_account,
                vaultB: "Collector Crypt Vault (PWCC / Brink's)",
                cardTitle: finalCard.name,
                tradeId,
                txHash: settledTxHash
            });
        }

        res.json({
            status: "SUCCESS_BOUGHT",
            message: `Card successfully purchased directly by ${buyer_account} with ${payment_method || "NEAR"}`,
            card: finalCard,
            tx_hash: settledTxHash,
            payment_method: payment_method || "NEAR",
            near_amount: near_amount || null,
            block: networkInfo.latest_block_height,
            near_intent: nearIntent,
            solana_holding_address: nearService.deriveSolanaAddressForVault(buyer_account),
            explorer_url: `https://testnet.nearblocks.io/txns/${settledTxHash}`
        });
    } catch (err) {
        console.error("Direct buy error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Assign a personal card to an AI Agent for autonomous trading & barter
router.post("/assign-to-agent", async (req, res) => {
    try {
        const { card_id, target_vault_id } = req.body;
        if (!card_id || !target_vault_id) {
            return res.status(400).json({ error: "card_id and target_vault_id are required" });
        }

        const isNum = !isNaN(Number(card_id));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(card_id) } : { card_id: String(card_id) }
        });
        if (!card) return res.status(404).json({ error: "Card not found" });

        const targetVault = await db.vault.findByPk(target_vault_id);
        if (!targetVault) return res.status(404).json({ error: "Agent vault not found" });

        card.vault_id = targetVault.id;
        card.owner_account = targetVault.sub_account;
        card.is_locked = false;
        await card.save();

        req.app.get("io")?.emit("vault:updated", { vaultId: targetVault.id, action: "card_assigned" });

        res.json({
            status: "SUCCESS_ASSIGNED",
            message: `Card '${card.name}' assigned to agent ${targetVault.name} for trading!`,
            card,
            vault: {
                id: targetVault.id,
                name: targetVault.name,
                sub_account: targetVault.sub_account
            }
        });
    } catch (err) {
        console.error("Assign card error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Withdraw a card from an agent back to personal wallet
router.post("/withdraw-from-agent", async (req, res) => {
    try {
        const { card_id, user_account } = req.body;
        if (!card_id) return res.status(400).json({ error: "card_id is required" });

        const isNum = !isNaN(Number(card_id));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(card_id) } : { card_id: String(card_id) },
            include: [{ model: db.vault, as: "vault" }]
        });
        if (!card) return res.status(404).json({ error: "Card not found" });
        if (card.is_locked) return res.status(400).json({ error: "Card is locked in active trade escrow" });

        const targetOwner = user_account || card.vault?.owner_account || "alierkan.testnet";
        const prevAgentName = card.vault?.name || "Agent Vault";

        card.vault_id = null;
        card.owner_account = targetOwner;
        card.is_locked = false;
        await card.save();

        req.app.get("io")?.emit("vault:updated", { action: "card_withdrawn", cardId: card.id });

        res.json({
            status: "SUCCESS_WITHDRAWN",
            message: `Card '${card.name}' withdrawn from ${prevAgentName} to personal wallet (${card.owner_account}).`,
            card
        });
    } catch (err) {
        console.error("Withdraw card error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Instant liquidate a card for USDC cash (into Agent Treasury or Personal Balance)
router.post("/liquidate-card", async (req, res) => {
    try {
        const { card_id } = req.body;
        if (!card_id) return res.status(400).json({ error: "card_id is required" });

        const isNum = !isNaN(Number(card_id));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(card_id) } : { card_id: String(card_id) }
        });
        if (!card) return res.status(404).json({ error: "Card not found" });
        if (card.is_locked) return res.status(400).json({ error: "Card is locked in active trade escrow" });

        const cashPayout = Number(card.oracle_fair_value_usdc || 50);
        let updatedVault = null;

        if (card.vault_id) {
            const vault = await db.vault.findByPk(card.vault_id);
            if (vault) {
                vault.usdc_balance = Number(vault.usdc_balance || 0) + cashPayout;
                vault.total_trades += 1;
                vault.realized_pnl_usdc = Number(vault.realized_pnl_usdc || 0) + 15;
                await vault.save();
                updatedVault = vault;
            }
        }

        const cardTitle = card.name;
        await card.destroy();

        req.app.get("io")?.emit("vault:updated", { action: "card_liquidated" });
        req.app.get("io")?.emit("trade:event", {
            vaultA: updatedVault?.name || "Collector",
            vaultB: "Collector Crypt Liquidity Pool",
            cardTitle,
            message: `Instant Liquidation: ${cardTitle} sold for $${cashPayout} USDC.`
        });

        res.json({
            status: "SUCCESS_LIQUIDATED",
            message: `Successfully liquidated '${cardTitle}' for $${cashPayout} USDC!`,
            cash_payout_usdc: cashPayout,
            vault: updatedVault
        });
    } catch (err) {
        console.error("Liquidate card error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Protocol level metrics (AUM, Total Volume, Active Vaults)
router.get("/stats", async (req, res) => {
    try {
        const vaults = await db.vault.findAll();
        const cards = await db.card.findAll();
        const trades = await db.trade.findAll({ where: { status: "COMPLETED" } });

        const totalCash = vaults.reduce((acc, v) => acc + (v.usdc_balance || 0), 0);
        const totalCardsValue = cards.reduce((acc, c) => acc + (c.oracle_fair_value_usdc || 0), 0);
        const totalAum = Math.round(totalCash + totalCardsValue);

        const totalTradesCount = trades.length;
        const totalVolumeUsdc = trades.reduce((acc, t) => {
            const cardAVal = t.cards_from_a?.reduce?.((s, c) => s + (c.oracle_fair_value_usdc || 0), 0) || 0;
            const cardBVal = t.cards_from_b?.reduce?.((s, c) => s + (c.oracle_fair_value_usdc || 0), 0) || 0;
            return acc + cardAVal + cardBVal + (t.usdc_from_a || 0) + (t.usdc_from_b || 0);
        }, 0);

        res.json({
            total_vaults: vaults.length,
            total_cards: cards.length,
            total_aum_usdc: totalAum,
            total_usdc_treasury: Math.round(totalCash),
            total_cards_value_usdc: Math.round(totalCardsValue),
            total_completed_trades: totalTradesCount,
            total_volume_usdc: Math.round(totalVolumeUsdc),
            network: "NEAR Protocol Testnet",
            contract_standard: "NEP-171 / NEP-177 Dynamic NFTs as Accounts"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
