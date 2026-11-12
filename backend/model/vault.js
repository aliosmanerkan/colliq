import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Vault = sequelize.define(
        "merchant_vault",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            vault_id: { type: DataTypes.STRING, unique: true, allowNull: false },
            sub_account: { type: DataTypes.STRING, unique: true, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            owner_account: { type: DataTypes.STRING, allowNull: false },
            usdc_balance: { type: DataTypes.FLOAT, defaultValue: 500.0 },
            strategy: { 
                type: DataTypes.STRING, 
                defaultValue: "BALANCED_TRADER" // AGGRESSIVE_ARBITRAGE, VALUE_COLLECTOR, BALANCED_TRADER, MOMENTUM_SNIPER
            },
            tier: { 
                type: DataTypes.STRING, 
                defaultValue: "ROOKIE" // ROOKIE, CERTIFIED_MERCHANT, WHALE_VAULT, LEGENDARY_DECK
            },
            total_trades: { type: DataTypes.INTEGER, defaultValue: 0 },
            unique_counterparties: { type: DataTypes.INTEGER, defaultValue: 0 },
            pnl_percentage: { type: DataTypes.FLOAT, defaultValue: 0.0 },
            net_pnl_usdc: { type: DataTypes.FLOAT, defaultValue: 0.0 },
            is_locked: { type: DataTypes.BOOLEAN, defaultValue: false }, // Mutex for active trade / transfer
            lock_reason: { type: DataTypes.STRING, allowNull: true },
            is_listed_for_sale: { type: DataTypes.BOOLEAN, defaultValue: false },
            sale_price_usdc: { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
            guardrail_max_spend_per_trade: { type: DataTypes.FLOAT, defaultValue: 300.0 },
            guardrail_min_oracle_fair_value_pct: { type: DataTypes.FLOAT, defaultValue: 80.0 }, // Reject deals < 80% fair value
            access_key_public: { type: DataTypes.STRING, defaultValue: "ed25519:4JpW2Z...vLt" },
            reputation_score: { type: DataTypes.INTEGER, defaultValue: 100 },
            avatar_color: { type: DataTypes.STRING, defaultValue: "#6366f1" },
            bio: { type: DataTypes.STRING, defaultValue: "Autonomous Merchant Vault trading high-grade PSA slabs." },
            custom_rules: { type: DataTypes.TEXT, defaultValue: "[]" },
            system_prompt: { 
                type: DataTypes.TEXT, 
                defaultValue: "You are an autonomous AI trading agent managing this NEAR Merchant Vault. Follow your owner's custom directives strictly." 
            },
            chat_history: { type: DataTypes.TEXT, defaultValue: "[]" },
        },
        {
            timestamps: true,
            indexes: [
                { fields: ["vault_id"] },
                { fields: ["owner_account"] },
                { fields: ["sub_account"] }
            ]
        }
    );
    return Vault;
};
