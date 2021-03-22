import { Sequelize, Model, DataType, DataTypes } from 'sequelize';
import { sequelize } from './mysqlPool2';

const ProductModel3 = sequelize.define('products', {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DOUBLE, allowNull: false },
    file: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    bestprice: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    user_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
    freezeTableName: true,
});

export { ProductModel3 };

export const findById = async (value: string) => {
    return await ProductModel3.findOne({
        where: {
            id: value
        }
    });
}

export const findForUser = async (user: any) => {
    return await ProductModel3.findAll({
        where: { user_id: user.id }
    });
}