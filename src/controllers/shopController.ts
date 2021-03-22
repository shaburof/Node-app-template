import { Request, Response, NextFunction } from 'express';

import { ProductModel3 } from '../models/productModel3';
import { cartController } from './cartController';
import { Paginate } from '../helpers/pagination/pagination';
import { model } from '../models/model';
let ProductModel = new model(ProductModel3);

export const getFoo = async (req: Request, res: Response, next: NextFunction) => {
    // req.session!.foo = 'foo in session';
    try {

        return res.render('foo');
    } catch (error) {
        next(error);
    }
}

export const getBar = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ status: true, method: 'GET' });
}

export const postBar = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    return res.status(200).json({ status: true, method: 'POST' });
}

export const getProducts = async (req: Request, res: Response) => {
    let products = await ProductModel.perPage(3).paginate(req);
    res.render('shop/product-list', {
        prods: products,
        activeShop: true,
        productCSS: true,
        showDetails: true
    });
}

export const getIndex = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let products = await ProductModel.perPage(3).paginate(req);

        res.render('shop/index', {
            prods: products
        });
    } catch (error) {
        next(error);
    }
}

export const getCart = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const cart = await cartController.getCart(req);
        const cartIsEmpty = cartController.isEmpty(req);

        res.render('shop/cart', { cart, cartIsEmpty })
    } catch (err) {
        next(err);
    }
}

export const postCart = async (req: Request, res: Response, next: NextFunction) => {
    const productId = +req.body.productId;
    try {
        await cartController.addToCart(req, productId);

        // redirect to /products if addToCart from product details
        let refer = redurectAfterPostCart(req);;

        return res.status(200).json({ status: true, redirectTo: '/products' });
        res.redirect(refer);
    } catch (err) {
        next(err);
    }

}

export const deleteCart = async (req: Request, res: Response) => {
    const productId = Number.parseFloat(req.body.id);

    await cartController.removeFromCart(req, productId);

    return res.redirect('/cart');
}

export const addCart = async (req: Request, res: Response, next: NextFunction) => {
    const productId = +req.body.id;
    try {
        await cartController.addToCart(req, productId);

        return res.redirect('/cart');
    } catch (err) {
        next(err);
    }
}

export const purgecart = async (req: Request, res: Response) => {
    const productId = Number.parseFloat(req.body.id);

    await cartController.purgeCart(req, productId);

    return res.redirect('/cart');
}

export const clearcart = (req: Request, res: Response) => {
    cartController.purgeAllCarts(req);
    return res.redirect('/cart');
}

export const getCheckout = async (req: Request, res: Response) => {
    let products = await ProductModel3.findAll() as any[];
    res.render('shop/checkout',
        {
            hasProduct: products.length > 0,
            prods: products
        }
    )
}

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    let id = +req.params.id;

    try {
        let product = await ProductModel3.findOne({ where: { id: id } }) as any

        res.locals.activeLink = '/products';
        return res.render('shop/product-detail', { product });
    } catch (err) {
        next(err);
    }
}

function redurectAfterPostCart(req: Request): string {
    return (req.header('Referer') === `${req.protocol}://${req.get('host')}/products/${req.body.productId}`)
        ? '/products'
        : req.header('Referer') || '/';
}