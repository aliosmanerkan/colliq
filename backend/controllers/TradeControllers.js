import express from "express";
import db from "../model/model.js";
import a2aSwarm from "../services/A2ASwarmService.js";
import negotiationEngine from "../src/agents/negotiationEngine.ts";

const router = express.Router();

// Trigger an A2A trade cycle (stateless 5-round negotiation loop)
router.post("/trigger-swarm", async (req, res) => {
    try {
        const vaults = await db.vault.findAll({
            where: { is_locked: false },
            include: [{ model: db.card, as: "inventory" }]
        });

        const eligible = vaults.filter(v => v.inventory && v.inventory.length > 0);
        if (eligible.length >= 2) {
            const shuffled = eligible.sort(() => 0.5 - Math.random());
            const result = await negotiationEngine.runNegotiationRoom(shuffled[0], shuffled[1]);
            return res.json({ status: "SWARM_EXECUTED", engine: "negotiationEngine.ts", result });
        }

        const fallbackResult = await a2aSwarm.executeNegotiationCycle();
        res.json({
            status: "SWARM_EXECUTED",
            engine: "a2aSwarmService.js",
            result: fallbackResult
        });
    } catch (err) {
        console.error("Trade swarm error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Trigger an Autonomous Collector Crypt Market Snipe Cycle across active vaults
router.post("/trigger-sniper", async (req, res) => {
    try {
        const { search } = req.body || {};
        const result = await a2aSwarm.executeMarketSnipeCycle(search);
        res.json({
            status: "MARKET_SNIPER_EXECUTED",
            result
        });
    } catch (err) {
        console.error("Market sniper trigger error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET recent trade history & negotiation transcripts
router.get("/history", async (req, res) => {
    try {
        const trades = await db.trade.findAll({
            order: [["createdAt", "DESC"]],
            limit: 20
        });
        res.json({ trades });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
