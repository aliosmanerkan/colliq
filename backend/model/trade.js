import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Trade = sequelize.define(
        "trade_history",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            trade_id: { type: DataTypes.STRING, unique: true, allowNull: false },
            vault_a_id: { type: DataTypes.INTEGER, allowNull: true },
            vault_b_id: { type: DataTypes.INTEGER, allowNull: true },
            vault_a_name: { type: DataTypes.STRING },
            vault_b_name: { type: DataTypes.STRING },
            cards_from_a: { type: DataTypes.JSON, defaultValue: [] },
            cards_from_b: { type: DataTypes.JSON, defaultValue: [] },
            usdc_from_a: { type: DataTypes.FLOAT, defaultValue: 0.0 },
            usdc_from_b: { type: DataTypes.FLOAT, defaultValue: 0.0 },
            rounds_count: { type: DataTypes.INTEGER, defaultValue: 1 },
            negotiation_log: { type: DataTypes.JSON, defaultValue: [] },
            status: { 
                type: DataTypes.STRING, 
                defaultValue: "COMPLETED" // COMPLETED, REJECTED_GUARDRAIL, CANCELLED
            },
            protocol_fee_usdc: { type: DataTypes.FLOAT, defaultValue: 0.0 }, // 0.5% fee
            tx_hash: { type: DataTypes.STRING, defaultValue: "near:simulated_receipt_settlement" },
            near_block: { type: DataTypes.INTEGER, defaultValue: 118492031 },
        },
        {
            timestamps: true,
            indexes: [
                { fields: ["vault_a_id"] },
                { fields: ["vault_b_id"] },
                { fields: ["status"] }
            ]
        }
    );
    return Trade;
};
