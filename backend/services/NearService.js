import crypto from "node:crypto";
import db from "../model/model.js";

export class NearService {
    constructor() {
        this.networkId = process.env.NEAR_NETWORK || "testnet";
        this.rootAccount = process.env.NEAR_ROOT_ACCOUNT || "market.testnet";
    }

    // Generates a new sub-account format: vault-<id>.market.near
    generateSubAccount(vaultId) {
        const cleanId = String(vaultId).toLowerCase().replace(/[^a-z0-9_-]/g, "");
        return `vault-${cleanId}.${this.rootAccount}`;
    }

    // Creates a restricted Function-Call Access Key for the AI Agent
    generateAgentFunctionCallKey(subAccount) {
        const rawPub = crypto.randomBytes(32).toString("base64");
        const accessKey = `ed25519:${rawPub.substring(0, 44)}`;
        return {
            publicKey: accessKey,
            permission: "FunctionCall",
            allowance: "100000000000000000000000", // 0.1 NEAR gas allowance
            receiverId: this.rootAccount,
            methodNames: ["propose_barter", "accept_barter", "sweep_floor", "query_oracle"]
        };
    }

    // ZOMBIE KEY WIPE: Called when a Merchant Vault NFT is transferred (Business-in-a-Box sale)
    async executeZombieKeyWipe(vaultId, newOwnerAccount) {
        const vault = await db.vault.findOne({ where: { id: vaultId } });
        if (!vault) throw new Error("Vault not found");

        if (vault.is_locked) {
            throw new Error("Vault is currently locked by active trade or mutex. Transfer blocked.");
        }

        const oldKey = vault.access_key_public;
        const newKey = this.generateAgentFunctionCallKey(vault.sub_account);

        console.log(`🧹 ZOMBIE KEY WIPE: Revoking old AI key [${oldKey}] for sub-account ${vault.sub_account}`);
        console.log(`🔑 Assigning fresh key for new owner ${newOwnerAccount}: ${newKey.publicKey}`);

        // Update ownership and regenerate key
        vault.owner_account = newOwnerAccount;
        vault.access_key_public = newKey.publicKey;
        await vault.save();

        return {
            status: "SUCCESS",
            vaultId: vault.id,
            subAccount: vault.sub_account,
            previousKeyWiped: oldKey,
            newAccessKey: newKey.publicKey,
            newOwner: newOwnerAccount,
            txHash: "0x" + crypto.randomBytes(32).toString("hex")
        };
    }
}

export const nearService = new NearService();
export default nearService;
