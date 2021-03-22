import { ProductModel3 } from './productModel3';
import { userModel3 } from './userModel3';
import { OrderModel3 } from './orderModel3';
import { ordersProducts3 } from './ordersProducts';
import { loginController } from '../controllers/login/loginController';
import { app } from '../server';

export async function createTables(force = false) {
    let tables = [
        ProductModel3,
        userModel3,
        OrderModel3,
        ordersProducts3
    ];

    for (const table of tables) {
        force ? await table.sync({ force: true }) : table.sync();
    }
    // force && loginController.addAdmin();

    if (force) {
        let admin = await loginController.addAdmin();
        app.locals.loginAdmin = { status: true, admin: admin };
        // app.locals.loginAdmin = { status: true, admin: { id: admin.id, name: admin.name, emain: admin.email } };
    }


}