import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Card = sequelize.define(
        "rwa_card",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            card_id: { type: DataTypes.STRING, unique: true, allowNull: false },
            vault_id: { type: DataTypes.INTEGER, allowNull: true },
            owner_account: { type: DataTypes.STRING, defaultValue: "alierkan.testnet" },
            psa_cert_number: { type: DataTypes.STRING, defaultValue: "CERT-VAULT" },
            solana_mint: { type: DataTypes.STRING, defaultValue: "SOL-VAULT-MINT" },
            name: { type: DataTypes.STRING, defaultValue: "Physical Graded Slab" },
            category: { type: DataTypes.STRING, defaultValue: "Pokemon" },
            set_name: { type: DataTypes.STRING, defaultValue: "Authenticated Graded Vault" },
            grade: { type: DataTypes.STRING, defaultValue: "PSA 10 GEM MT" },
            rareness_score: { type: DataTypes.INTEGER, defaultValue: 85 }, // 1-100
            oracle_fair_value_usdc: { type: DataTypes.FLOAT, defaultValue: 50.0 },
            last_sale_usdc: { type: DataTypes.FLOAT, defaultValue: 50.0 },
            image_url: { type: DataTypes.TEXT, defaultValue: "https://images.pokemontcg.io/swsh4/188_hires.png" },
            barcode: { type: DataTypes.STRING, defaultValue: "CC-VAULT-BARCODE" },
            population_higher: { type: DataTypes.INTEGER, defaultValue: 0 },
            is_locked: { type: DataTypes.BOOLEAN, defaultValue: false },
            is_hold: { type: DataTypes.BOOLEAN, defaultValue: false },
            is_listed_by_agent: { type: DataTypes.BOOLEAN, defaultValue: false },
            asking_price_usdc: { type: DataTypes.FLOAT, allowNull: true },
            min_reserve_usdc: { type: DataTypes.FLOAT, allowNull: true },
            allow_barter: { type: DataTypes.BOOLEAN, defaultValue: true },
            sell_directive: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            timestamps: true,
            indexes: [
                { fields: ["vault_id"] },
                { fields: ["psa_cert_number"] },
                { fields: ["solana_mint"] }
            ]
        }
    );
    return Card;
};
