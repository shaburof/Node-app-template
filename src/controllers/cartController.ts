import { Request } from 'express';
import { cartType, getCartType } from '../types/types';
import { priceController } from './priceController';
import { cart } from './cart';
import { ProductModel3 } from '../models/productModel3';

class cartController extends cart {

    private static _cart: { products: { [proc: string]: { count: number } }, totalPrice: number } = {
        products: {},
        totalPrice: 0
    }

    static getCart = async (req: Request) => {
        const sessionCart = req.session!.cart as cartType;

        const cart: getCartType = { products: [], totalPrice: 0, totalCount: 0 };
        try {
            if (Object.keys(sessionCart.products).length > 0) {
                for (const prod of Object.keys(sessionCart.products)) {
                    const productId = Number.parseFloat(prod);
                    const product = await ProductModel3.findOne({ where: { id: productId } }) as any;
                    const temp = {
                        id: productId,
                        title: product.title,
                        count: sessionCart.products[prod].count,
                        price: product.price,
                    }
                    cart.products.push(temp)
                }
                cart.totalPrice = sessionCart.totalPrice
                cart.totalCount = sessionCart.totalCount
            }
        } catch (err) {
            cartController.purgeAllCarts(req);
        }

        // console.log('cart: ', cart);
        return cart;
    }

    static addToCart = async (req: Request, productId: number) => {

        const product = await ProductModel3.findOne({ where: { id: productId } }) as any;
        const price = product.price;

        await cartController.add(req.session!.cart, productId, price);
    }

    public static purgeAllCarts = (req: Request) => {
        req.session!.cart = {
            products: {},
            totalPrice: 0,
            totalCount: 0
        };
    }

    public static purgeCart = async (req: Request, productId: number) => {

        const sessionCart = req.session!.cart as cartType;
        let productToDeleteFromCart = sessionCart.products[productId];
        if (typeof productToDeleteFromCart === 'undefined') return;

        let product = await ProductModel3.findOne({ where: { id: productId } }) as any;
        let cartProductCount = productToDeleteFromCart.count;
        let cartProductTotalPrice = priceController.multiple(product.price, cartProductCount);


        delete sessionCart.products[productId];
        sessionCart.totalPrice = priceController.minus(sessionCart.totalPrice, cartProductTotalPrice);
        sessionCart.totalCount -= cartProductCount;
        req.session!.cart = sessionCart;
    }

    public static removeFromCart = async (req: Request, productId: number) => {
        const product = await ProductModel3.findOne({ where: { id: productId } }) as any;
        const price = product.price;

        cartController.subtract(req.session!.cart, productId, price);
    }

    public static isInCart(req: Request, productId: number) {
        const cart = req.session!.cart.products as cartType;
        return typeof cart.products[productId] !== 'undefined';
    }

    public static isEmpty(req: Request) {
        const cart = req.session!.cart;
        return Object.keys(cart.products).length === 0;
    }




}

export { cartController };