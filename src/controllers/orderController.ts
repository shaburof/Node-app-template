import { Request, Response, NextFunction } from 'express';
import { cartController } from './cartController';
import { OrderModel3 } from '../models/orderModel3';
import { ordersProducts3 } from '../models/ordersProducts';
import { model } from '../models/model';
import { ProductModel3 } from '../models/productModel3';
import { priceController } from './priceController';
import { crudGuard } from '../helpers/guard';
let OrderModel = new model(OrderModel3);
let OrderProductsModel = new model(ordersProducts3);
let ProductModel = new model(ProductModel3);
import { Pdf } from '../helpers/pdf/pdf';
import stream from 'stream';


class orderController {

    public static async makeOrder(req: Request, res: Response, next: NextFunction) {
        let user = req.session!.user;

        let { products } = await cartController.getCart(req);

        let order_id = await OrderModel.create({ user_id: user.id }) as any;
        for (const product of products) {
            OrderProductsModel.create({ order_id: order_id.id, product_id: product.id, quantity: product.count });
        }
        cartController.purgeAllCarts(req);

        res.redirect('/orders');
    }

    public static async getOrders(req: Request, res: Response, next: NextFunction) {
        let user = req.session!.user;
        if (!user) return next(new Error('you are not authontificated'));
        try {
            let _orders = await OrderModel.findAll('user_id', user.id);
            let orders: { orderNo: number, products: any, total: number, date: string }[] = [];
            if (_orders.length > 0) {
                for (const order of _orders as any) {
                    orders.push(await orderController.createOrder(order));
                }
            }

            return res.render('shop/orders', { orders: orders });
        } catch (error) {
            next(error);
        }

    }

    public static async downloadOrder(req: Request, res: Response, next: NextFunction) {
        try {
            let orderId = +req.params.orderId;
            let order = await OrderModel.findById(orderId);

            let isValid = orderController.isOrderValid(req, order);
            if (!isValid.status) return next(new Error(isValid.message));

            let builtOrder = await orderController.createOrder(order);
            let pdfResult = await Pdf.generate<NodeJS.ReadableStream>({ order: builtOrder, type: 'toStream' });

            orderController.setDownloadPdfHeaders({ res, orderId });
            return orderController.createPdfFileStream({ res, pdfStream: pdfResult });

        } catch (error) {
            next(error);
        }
    }

    public static async createOrder(order: any) {
        let products: any[] = [];
        let total = 0;
        let _products = await OrderProductsModel.findAll('order_id', order.id);
        for (const _product of _products) {
            let product = await ProductModel.findById(_product.product_id);
            if (!product) continue;
            product.quantity = _product.quantity;
            products.push(product);
            total = priceController.plus(total, priceController.multiple(product.price, _product.quantity));
        }
        let date = order.createdAt.toDateString().split(' ').splice(0, 3).join(' ');
        return { orderNo: order.id, products: products, total: total, date: date };
    }

    public static async deleteOrder(req: Request, res: Response, next: NextFunction) {
        let user = req.session!.user;
        let id = +req.params.id;

        let order = await OrderModel.findById(id);

        if (!crudGuard(user, { id: order.user_id })) {
            console.log('orderController deleteOrder not permission for current user delete order');
            return next('orderController deleteOrder not permission for current user delete order');
        }

        OrderProductsModel.destroy('order_id', id);
        order.destroy();

        return res.status(200).json({ status: true });
        res.redirect('/orders');
    }

    private static createPdfFileStream = ({ res, pdfStream }: { res: Response, pdfStream: NodeJS.ReadableStream }) => {
        return stream.pipeline(pdfStream, res, err => {
            if (err) throw new Error(err.message);
        });
    }

    private static setDownloadPdfHeaders({ res, orderId }: { res: Response, orderId: number }) {
        res.set('Content-Disposition', 'attachment; filename=' + `invoce${orderId}.pdf`);
        res.set('Content-Type', 'application/pdf');
    }

    private static isOrderValid(req: Request, order: any) {
        let result = { status: true, message: '' };
        if (!order) {
            result.status = false;
            result.message = 'order not found';
        }
        else if (!req.app.locals.guard(order.user_id)) {
            result.status = false;
            result.message = 'permission download order deny';
        }

        return result;
    }

}

export { orderController };