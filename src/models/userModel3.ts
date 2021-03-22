import { Sequelize, Model, DataType, DataTypes, ModelCtor } from 'sequelize';
import { sequelize } from './mysqlPool2';

const userModel3 = sequelize.define('users', {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM, values: ['ADMIN', 'USER'], allowNull: false, defaultValue: 'USER' },
    rememberme_token: { type: DataTypes.STRING, defaultValue: '' },
    reset_token: { type: DataTypes.STRING, defaultValue: '' },
    reset_token_datetime: { type: DataTypes.DATE, defaultValue: '1970-01-01 00:00:00' },
    registration_confirm: { type: DataTypes.BOOLEAN, defaultValue: false },
    registration_token: { type: DataTypes.STRING, defaultValue: '' },
    registration_token_datetime: { type: DataTypes.DATE, defaultValue: '1970-01-01 00:00:00' },
    login_attempts: { type: DataTypes.TINYINT, defaultValue: 0, },
    expired_login_attempts: { type: DataTypes.DATE, defaultValue: '1970-01-01 00:00:00' },
    api_token: { type: DataTypes.STRING, defaultValue: '' },
    api_reset_token: { type: DataTypes.STRING, defaultValue: '' },
    api_token_expired: { type: DataTypes.DATE, defaultValue: '1970-01-01 00:00:00' },
}, {
    freezeTableName: true,
});

export const findByEmail = async (value: string) => {
    return await userModel3.findOne({
        where: {
            email: value
        }
    });
}

export const findById = async (value: string) => {
    return await userModel3.findOne({
        where: {
            id: value
        }
    });
}

export { userModel3 };