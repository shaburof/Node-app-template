import { Sequelize, Model, DataType } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

let user = process.env.DB_USER as string;
let password = process.env.DB_PASS as string;
export const sequelize = new Sequelize('bookshop', user, password, {
    dialect: 'mysql',
    logging: false,
});

export const isConnect = async () => {
    return await sequelize.authenticate();
}