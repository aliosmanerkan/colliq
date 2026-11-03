import { DataTypes } from "sequelize";

export default (sequelize) => {
    const User = sequelize.define(
        "user",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            password: { type: DataTypes.TEXT },
            fullname: { type: DataTypes.STRING },
            name: { type: DataTypes.STRING },
            displayName: { type: DataTypes.STRING },
            photoURL: { type: DataTypes.TEXT },
            platform: { type: DataTypes.STRING, defaultValue: "web" },
            token: { type: DataTypes.TEXT },
            fcm: { type: DataTypes.TEXT },
            lang: { type: DataTypes.STRING, defaultValue: "tr" },
            type: { type: DataTypes.STRING, defaultValue: "free" },
            role: { type: DataTypes.STRING, defaultValue: "user" },
            is_suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
            user_uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: true,
                unique: true,
            },
        }
    );
    return User;
};
