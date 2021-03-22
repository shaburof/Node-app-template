import { Request } from 'express';
import { cartType } from '../types/types';
import { priceController } from './priceController';

class cart {

    public static initCart = (req: Request) => {
        if (typeof req.session!.cart === 'undefined')
            req.session!.cart = {
                products: {},
                totalPrice: 0,
                totalCount: 0
            };
    }

    protected static async add(cart: cartType, productId: number, price: number) {
        if (typeof cart.products[productId] === 'undefined') {
            cart.products[productId] = { count: 1 };
            cart.totalCount++;
            cart.totalPrice = priceController.plus(cart.totalPrice, price)

        } else {
            let count = cart.products[productId].count + 1;

            cart.products[productId].count = count;
            cart.totalCount++;
            cart.totalPrice = priceController.plus(cart.totalPrice, price)
        }
    }

    protected static subtract(cart: cartType, productId: number, price: number) {
        if (typeof cart !== 'undefined' && typeof cart.products[productId] !== 'undefined') {
            cart.products[productId].count -= 1
            cart.totalCount--;
            let count = cart.products[productId].count;

            cart.totalPrice = priceController.minus(cart.totalPrice, price);
            if (count <= 0) delete cart.products[productId];
            if (cart.totalCount <= 0) cart.totalPrice = 0;
        }
    }
}

export { cart };