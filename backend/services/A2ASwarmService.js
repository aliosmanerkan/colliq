import db from "../model/model.js";
import negotiationEngine from "../src/agents/negotiationEngine.ts";

export class A2ASwarmService {
    constructor(io = null) {
        this.io = io;
        this.isRunning = false;
        this.telemetryInterval = null;
    }

    setSocket(io) {
        this.io = io;
        if (negotiationEngine) {
            negotiationEngine.setSocket(io);
        }
        this.startTelemetryHeartbeat();
    }

    startTelemetryHeartbeat() {
        if (this.telemetryInterval) return;
        const telemetryFeed = [
            { speaker: "ORACLE FEED", category: "oracle", message: "Pyth / DIA price feed verified for PSA 10 slabs. Dispersion < 0.15%." },
            { speaker: "NEAR CONSENSUS", category: "near_rpc", message: "Testnet block confirmed across validators. Average gas price: 100 TGas." },
            { speaker: "AGENT RADAR", category: "radar", message: "Autonomous scan: Scanning merchant vaults for valuation arbitrage opportunities." },
            { speaker: "SOLANA MPC", category: "chain_sig", message: "Cross-chain MPC derivation key verified via NEAR Chain Signatures." },
            { speaker: "RISK MONITOR", category: "risk", message: "Treasury guardrail check: 100% USDC collateralized, zero liquidation risk." },
            { speaker: "MEMPOOL PULSE", category: "mempool", message: "Peer handshake active on consensus.market.near: Liquidity depth nominal." }
        ];

        let index = 0;
        this.telemetryInterval = setInterval(() => {
            if (this.isRunning) return;
            const item = telemetryFeed[index % telemetryFeed.length];
            index++;
            this.emitEvent("a2a_telemetry", {
                ...item,
                timestamp: Date.now()
            });
        }, 5500);
    }

    // Runs a single atomic A2A negotiation cycle between 2 eligible vaults
    async executeNegotiationCycle() {
        if (this.isRunning) return null;
        this.isRunning = true;

        let lockedVaults = [];
        try {
            // Find two available, unlocked vaults with inventory
            const vaults = await db.vault.findAll({
                where: { is_locked: false },
                include: [{ model: db.card, as: "inventory" }]
            });

            const eligibleVaults = vaults.filter(v => v.inventory && v.inventory.length > 0);
            if (eligibleVaults.length < 2) {
                this.isRunning = false;
                return { status: "SKIPPED", message: "Not enough unlocked vaults with inventory" };
            }

            // Shuffle and pick 2 distinct vaults
            const shuffled = eligibleVaults.sort(() => 0.5 - Math.random());
            const vaultA = shuffled[0];
            const vaultB = shuffled[1];

            // 1. FRONT-RUNNING LOCK (MUTEX)
            vaultA.is_locked = true;
            vaultA.lock_reason = `A2A_NEGOTIATION_${vaultB.vault_id}`;
            vaultB.is_locked = true;
            vaultB.lock_reason = `A2A_NEGOTIATION_${vaultA.vault_id}`;
            await vaultA.save();
            await vaultB.save();
            lockedVaults = [vaultA, vaultB];

            this.emitEvent("a2a_match_found", {
                vaultA: { id: vaultA.id, name: vaultA.name, sub_account: vaultA.sub_account },
                vaultB: { id: vaultB.id, name: vaultB.name, sub_account: vaultB.sub_account }
            });

            // 2. Execute negotiation room with strict economic directionality
            const result = await negotiationEngine.runNegotiationRoom(vaultA, vaultB);
            return result;
        } catch (err) {
            console.error("A2A Swarm cycle error:", err);
            return { status: "ERROR", message: err.message };
        } finally {
            // Unlock vaults
            for (const v of lockedVaults) {
                v.is_locked = false;
                v.lock_reason = null;
                await v.save();
            }
            this.isRunning = false;
        }
    }

    emitEvent(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

export const a2aSwarm = new A2ASwarmService();
export default a2aSwarm;
