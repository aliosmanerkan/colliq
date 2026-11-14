import express from "express";
import db from "../model/model.js";
import a2aSwarm from "../services/A2ASwarmService.js";
import negotiationEngine from "../src/agents/negotiationEngine.ts";

const router = express.Router();

// Trigger an A2A trade cycle
router.post("/trigger-swarm", async (req, res) => {
    try {
        const result = await a2aSwarm.executeNegotiationCycle();
        if (result && result.status !== "SKIPPED") {
            return res.json({ status: "SWARM_EXECUTED", engine: "a2aSwarmService.js", result });
        }

        const vaults = await db.vault.findAll({
            where: { is_locked: false },
            include: [{ model: db.card, as: "inventory" }]
        });

        const eligible = vaults.filter(v => 
            v.inventory && 
            v.inventory.some(c => !c.is_hold) &&
            !v.sub_account?.includes("collectorcrypt")
        );
        if (eligible.length >= 2) {
            const shuffled = eligible.sort(() => 0.5 - Math.random());
            const vA = shuffled[0];
            const vB = shuffled[1];

            // Mutex Lock Vaults during A2A Negotiation to prevent race conditions & front-running
            await vA.update({ is_locked: true, lock_reason: "NEGOTIATING" });
            await vB.update({ is_locked: true, lock_reason: "NEGOTIATING" });

            let fallbackResult = null;
            try {
                vA._compiledPolicy = await a2aSwarm.getCompiledVaultPolicy(vA);
                vB._compiledPolicy = await a2aSwarm.getCompiledVaultPolicy(vB);
                fallbackResult = await negotiationEngine.runNegotiationRoom(vA, vB);
            } finally {
                await vA.update({ is_locked: false, lock_reason: null });
                await vB.update({ is_locked: false, lock_reason: null });
            }

            return res.json({ status: "SWARM_EXECUTED", engine: "negotiationEngine.ts", result: fallbackResult });
        }

        res.json({
            status: "SKIPPED",
            message: "Not enough unlocked vaults with available slabs"
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
            limit: 100
        });
        res.json({ trades });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
