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

// Direct Buy with Personal Account (Manual Purchase)
router.post("/buy-direct", async (req, res) => {
    try {
        const { card_id, buyer_account } = req.body;
        if (!card_id || !buyer_account) {
            return res.status(400).json({ error: "card_id and buyer_account are required" });
        }

        const ccCards = getCollectorCryptInventory();
        const ccCard = ccCards.find(c => c.id === card_id);

        let finalCard;
        if (ccCard) {
            const certNum = ccCard.id.substring(0, 8).toUpperCase();
            const cardPrice = ccCard.insuredUsd || ccCard.costUsd || 50.0;
            finalCard = await db.card.create({
                card_id: `cc-rwa-${ccCard.id.substring(0, 12)}`,
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

        res.json({
            status: "SUCCESS_BOUGHT",
            message: `Card successfully purchased directly by ${buyer_account}`,
            card: finalCard,
            tx_hash: `0x${networkInfo.latest_block_hash?.substring(0, 32) || "4JpW2Z"}`,
            block: networkInfo.latest_block_height
        });
    } catch (err) {
        console.error("Direct buy error:", err);
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
