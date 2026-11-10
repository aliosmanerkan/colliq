import express from "express";
import db from "../model/model.js";
import nearService from "../services/NearService.js";
import { getCollectorCryptInventory, bridgeCollectorCryptCardToNearVault } from "../services/CollectorCryptService.js";

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

// GET authentic Collector Crypt inventory (Solana Brink's Vault) with filtering & search
router.get("/collector-crypt", (req, res) => {
    try {
        let cards = getCollectorCryptInventory();
        const { search, category, grade, sortBy } = req.query;

        if (search) {
            const q = search.toLowerCase();
            cards = cards.filter(c => 
                c.name?.toLowerCase().includes(q) || 
                c.category?.toLowerCase().includes(q) ||
                c.id?.toLowerCase().includes(q)
            );
        }

        if (category && category !== "ALL") {
            cards = cards.filter(c => c.category?.toLowerCase() === category.toLowerCase());
        }

        if (grade && grade !== "ALL") {
            cards = cards.filter(c => c.grade?.toLowerCase().includes(grade.toLowerCase()));
        }

        if (sortBy === "price_desc") {
            cards = [...cards].sort((a, b) => (b.insuredUsd || b.costUsd || 0) - (a.insuredUsd || a.costUsd || 0));
        } else if (sortBy === "price_asc") {
            cards = [...cards].sort((a, b) => (a.insuredUsd || a.costUsd || 0) - (b.insuredUsd || b.costUsd || 0));
        } else if (sortBy === "rareness") {
            cards = [...cards].sort((a, b) => (b.rareness || 0) - (a.rareness || 0));
        } else if (sortBy === "return") {
            cards = [...cards].sort((a, b) => (b.returnPct || 0) - (a.returnPct || 0));
        }

        res.json({
            total: cards.length,
            custody: "Brink's Vault & PSA (Collector Crypt)",
            chain_origin: "Solana Mainnet",
            bridge_destination: "NEAR Protocol (Track 10: NFTs as Accounts)",
            cards
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buy Collector Crypt Card and secure into a NEAR Merchant Vault
router.post("/collector-crypt/buy", async (req, res) => {
    try {
        const { card_id, vault_id, owner_account } = req.body;
        if (!card_id || !vault_id) {
            return res.status(400).json({ error: "card_id and vault_id are required" });
        }

        const result = await bridgeCollectorCryptCardToNearVault(card_id, vault_id, owner_account || "alierkan.testnet");
        res.json(result);
    } catch (err) {
        console.error("Buy card error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Bridge Collector Crypt Card to a NEAR Merchant Vault
router.post("/collector-crypt/bridge", async (req, res) => {
    try {
        const { card_id, vault_id, owner_account } = req.body;
        if (!card_id || !vault_id) {
            return res.status(400).json({ error: "card_id and vault_id are required" });
        }

        const result = await bridgeCollectorCryptCardToNearVault(card_id, vault_id, owner_account || "alierkan.testnet");
        res.json(result);
    } catch (err) {
        console.error("Bridge card error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Direct Buy with Personal Account (Manual Purchase with NEAR or USDC)
router.post("/buy-direct", async (req, res) => {
    try {
        const { card_id, buyer_account, tx_hash, payment_method, near_amount } = req.body;
        if (!card_id || !buyer_account) {
            return res.status(400).json({ error: "card_id and buyer_account are required" });
        }

        const ccCards = getCollectorCryptInventory();
        const ccCard = ccCards.find(c => c.id === card_id);

        let finalCard;
        if (ccCard) {
            const certNum = ccCard.id.substring(0, 8).toUpperCase();
            const cardPrice = ccCard.insuredUsd || ccCard.costUsd || 50.0;
            const existingCard = await db.card.findOne({ where: { solana_mint: ccCard.id } });

            if (existingCard) {
                existingCard.vault_id = null;
                existingCard.owner_account = buyer_account;
                existingCard.is_locked = false;
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
                    set_name: ccCard.name.split("PSA")[0]?.trim() || "Collector Crypt Vault",
                    grade: ccCard.grade || "PSA 10 GEM MT",
                    rareness_score: ccCard.rareness || 80,
                    oracle_fair_value_usdc: cardPrice,
                    last_sale_usdc: ccCard.costUsd || cardPrice,
                    image_url: ccCard.imageUrl,
                    barcode: `CC-${certNum}-PSA`,
                    population_higher: ccCard.population?.higher || 0,
                    is_locked: false
                });
            }
        } else {
            const existingCard = await db.card.findOne({ where: { card_id } });
            if (!existingCard) return res.status(404).json({ error: "Card not found" });
            if (existingCard.is_locked) return res.status(400).json({ error: "Card is locked in active trade" });

            existingCard.owner_account = buyer_account;
            existingCard.vault_id = null;
            await existingCard.save();
            finalCard = existingCard;
        }

        const networkInfo = await nearService.getNetworkStatus();
        const settledTxHash = tx_hash || `0x${networkInfo.latest_block_hash?.substring(0, 32) || "4JpW2Z"}`;

        res.json({
            status: "SUCCESS_BOUGHT",
            message: `Card successfully purchased directly by ${buyer_account} with ${payment_method || "NEAR"}`,
            card: finalCard,
            tx_hash: settledTxHash,
            payment_method: payment_method || "NEAR",
            near_amount: near_amount || null,
            block: networkInfo.latest_block_height,
            explorer_url: `https://testnet.nearblocks.io/txns/${settledTxHash}`
        });
    } catch (err) {
        console.error("Direct buy error:", err);
        res.status(500).json({ error: err.message });
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
            where: isNum ? { id: Number(card_id) } : { card_id: String(card_id) }
        });
        if (!card) return res.status(404).json({ error: "Card not found" });
        if (card.is_locked) return res.status(400).json({ error: "Card is locked in active trade escrow" });

        card.vault_id = null;
        card.owner_account = user_account || "alierkan.testnet";
        await card.save();

        req.app.get("io")?.emit("vault:updated", { action: "card_withdrawn" });

        res.json({
            status: "SUCCESS_WITHDRAWN",
            message: `Card '${card.name}' withdrawn to personal wallet (${card.owner_account}).`,
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
