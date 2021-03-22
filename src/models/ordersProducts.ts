import { Sequelize, Model, DataType, DataTypes } from 'sequelize';
import { sequelize } from './mysqlPool2';

const ordersProducts3 = sequelize.define('ordersProducts', {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
}, {
    freezeTableName: true,
});

export { ordersProducts3 };
