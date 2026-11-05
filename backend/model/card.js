import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Card = sequelize.define(
        "rwa_card",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            card_id: { type: DataTypes.STRING, unique: true, allowNull: false },
            vault_id: { type: DataTypes.INTEGER, allowNull: true },
            owner_account: { type: DataTypes.STRING, allowNull: false },
            psa_cert_number: { type: DataTypes.STRING, allowNull: false },
            solana_mint: { type: DataTypes.STRING, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            category: { type: DataTypes.STRING, defaultValue: "Pokemon" },
            set_name: { type: DataTypes.STRING, allowNull: false },
            grade: { type: DataTypes.STRING, defaultValue: "PSA 10 GEM MT" },
            rareness_score: { type: DataTypes.INTEGER, defaultValue: 85 }, // 1-100
            oracle_fair_value_usdc: { type: DataTypes.FLOAT, allowNull: false },
            last_sale_usdc: { type: DataTypes.FLOAT, allowNull: false },
            image_url: { type: DataTypes.TEXT, allowNull: false },
            barcode: { type: DataTypes.STRING, allowNull: false },
            population_higher: { type: DataTypes.INTEGER, defaultValue: 0 },
            is_locked: { type: DataTypes.BOOLEAN, defaultValue: false },
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
