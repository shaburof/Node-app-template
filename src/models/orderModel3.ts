import { Sequelize, Model, DataType, DataTypes } from 'sequelize';
import { sequelize } from './mysqlPool2';

const OrderModel3 = sequelize.define('orders', {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    freezeTableName: true,
});

export { OrderModel3 };