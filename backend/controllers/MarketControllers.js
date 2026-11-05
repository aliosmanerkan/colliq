import express from "express";
import db from "../model/model.js";

const router = express.Router();

// GET all RWA cards (inventory of all vaults or market)
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
