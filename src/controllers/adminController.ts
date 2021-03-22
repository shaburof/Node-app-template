import { Request, Response, NextFunction } from 'express';
import { crudGuard, isAdmin } from '../helpers/guard';
import path from 'path';
import { app, rootFolder } from '../server';

import { ProductModel3 } from '../models/productModel3';
import { userModel3 } from '../models/userModel3';
import { OrderModel3 } from '../models/orderModel3';
import { ordersProducts3 } from '../models/ordersProducts';
import { cartController } from './cartController';
import { model } from '../models/model';
import { refer } from '../helpers/helper';
let ProductModel = new model(ProductModel3);
let UserModel = new model(userModel3);
let OrderModel = new model(OrderModel3);
let OrderProductModel = new model(ordersProducts3);

export const createDummyUser = async (req: Request, res: Response, next: NextFunction) => {
    (await UserModel.findAll()).map(async result => {
        if (result !== null && result.email !== 'admin@example.com') await result.destroy()
    });

    let _user = await UserModel.create({ name: 'Ola', email: 'ola@example.com', password: '123456', registartion_confirm: 1 });
    let [user, admin] = await Promise.all([_user]);

    return { user: user };
}

export const createDummyProducts = async (req: Request, res: Response, next: NextFunction) => {
    let { user } = await createDummyUser(req, res, next) as any;
    (await ProductModel.findAll()).map(async product => await (product as any).destroy());
    (await OrderModel.findAll()).map(async order => await order.destroy());
    (await OrderProductModel.findAll()).map(async orderProduct => await orderProduct.destroy());

    let p1 = ProductModel3.create({ user_id: user.id, title: 'First Book', description: 'first cool book', price: 12, file: '/images/books/pic1.jpg' });
    let p2 = ProductModel3.create({ user_id: user.id, title: 'Second Book', description: 'second cool book', price: 15.3, file: '/images/books/pic2.jpg' });
    let p3 = ProductModel3.create({ user_id: user.id, title: 'Third Book', description: 'third cool book', price: 19.55, file: '/images/books/pic3.jpg' });
    // let p5 = ProductModel3.create({ user_id: admin.id, title: 'Admin Book', description: 'This is book property of administrator this site', price: 19.55, file: '/images/books/pic5.jpg' });
    await Promise.all([p1, p2, p3]);
    copyDummyImage('pic1.jpg');
    copyDummyImage('pic2.jpg');
    copyDummyImage('pic3.jpg');
    // copyDummyImage('pic5.jpg');

    res.redirect('/');

    function copyDummyImage(name: string) {
        let src = path.join(rootFolder, 'src', 'images', name);
        let dst = path.join(rootFolder, 'public', 'images', 'books', name);
        req.app.locals.file(src).copy(dst);

    }
}

export const getAddProduct = async (req: Request, res: Response, next: NextFunction) => {
    res.render('admin/add-product');
}

export const postStoreProduct = async (req: Request, res: Response, next: NextFunction) => {
    let body = req.body;

    let isValid = await req.app.locals.validate({
        title: { require: true, sanitize: { trim: true } },
        description: { require: true, sanitize: { trim: true } },
        price: { require: true, howManyNumbersAfterDot: 2, sanitize: { trim: true } }
    });

    if (!isValid.status) {
        return req.app.locals.flashMessage.warning(isValid.message).withError(isValid.value).withOld().flash();
    }

    try {
        let user_id = req.session!.user.id;
        let product = {
            title: isValid.data.title, description: isValid.data.description,
            price: isValid.data.price, bestprice: !!body.bestPrice,
            user_id: user_id,
            file: '/images/books/empty.png'
        };

        if (req.files) {
            let { status, message } = await isImage(req);
            if (!status) {
                return req.app.locals.flashMessage.error(message).withOld().flash();
            }

            let upload = await req.app.locals.file('file').upload();
            product.file = upload.relativePath;
        }
        await ProductModel.create(product);
        res.redirect('/');

    } catch (error) {
        next(error);
    }
}

export const getClearProduct = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.app.locals.isAdmin()) return next(new Error('Your are not allow to clear products'));
    cartController.purgeAllCarts(req);

    let products = await ProductModel3.findAll() as any[];

    products.map(async product => {
        let productId = product.id;

        let orderProduct = await OrderProductModel.findBy('product_id', productId);
        if (orderProduct) {
            let orderId = orderProduct.order_id;
            let order = await OrderModel.findById(orderId)
            if (order) {
                orderProduct.destroy();
                order.destroy();
            }
        }

        if (!product.file.includes('empty.png')) {
            req.app.locals.file(product.file).deleteFromPublic();
        }
        await product.destroy();
    });

    res.redirect('/');
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    let id = +req.params.id;
    
    if (!req.app.locals.isAdmin()) return next(new Error('Your are not allowd to postDeleteProduct'));

    await cartController.purgeCart(req, id);
    let product = await ProductModel3.findOne({ where: { id: id } }) as any;

    if (!product.file.includes('empty.png')) {
        req.app.locals.file(product.file).deleteFromPublic();
    }

    product.destroy();
    return res.status(200).json({ status: true });
    res.redirect('/admin/products');
}

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let products = (isAdmin(req.session!.user))
            ? await ProductModel.perPage(3).paginate(req)
            : await ProductModel.perPage(3).params({ where: { user_id: req.session!.user.id } }).paginate(req);

        // let products = (isAdmin(req.session!.user))
        //     ? await ProductModel.findAll()
        //     : await ProductModel.findAll('user_id', req.session!.user.id);

        res.render('admin/products',
            {
                prods: products
            })
    } catch (error) {
        next(error);
    }

}

export const adminProducts = (req: Request, res: Response) => {
    res.render('admin/products')
}

export const cart = (req: Request, res: Response) => {
    res.render('shop/cart')
}

export const products = (req: Request, res: Response) => {
    res.render('admin/products')
}

export let getEditProduct = async (req: Request, res: Response, next: NextFunction) => {
    res.locals.activeLink = '/admin/products';
    let id = +req.params.id;

    try {
        let product = await ProductModel3.findOne({ where: { id: id } }) as any;

        // req.app.locals.guard(product.user_id,{ adminAllow: true })
        if (!req.app.locals.guard(product.user_id, { adminAllow: true })) return next(new Error('Your are not allowd to getEditProduct'));
        res.render('admin/edit-product', { prod: product });
    } catch (err) {
        next(err);
    }
}

export let postEditProduct = async (req: Request, res: Response, next: NextFunction) => {
    if (!isAdmin(req.session!.user)) throw new Error('only admin can update products');

    let body = req.body;
    let isValid = await req.app.locals.validate({
        title: { require: true, sanitize: { trim: true } },
        description: { require: true, sanitize: { trim: true } },
        price: { require: true, sanitize: { trim: true } },
    });
    if (!isValid.status) {
        return req.app.locals.flashMessage.warning(isValid.message).withError(isValid.value).flash();
    }

    try {
        let product = (await ProductModel3.findOne({ where: { id: +body.id } }) as any).dataValues;
        if (!req.app.locals.guard(product.id, { adminAllow: true })) return next(new Error('Your are not allowd to postEditProduct'));


        if (req.files) {
            let { status, message } = await isImage(req);
            if (!status) {
                return req.app.locals.flashMessage.error(message).withOld().flash();
            }

            let oldImageName = product.file;
            req.app.locals.file(oldImageName).deleteFromPublic();
            let upload = await req.app.locals.file('file').upload();
            product.file = upload.relativePath;
        }

        product.title = isValid.data.title;
        product.description = isValid.data.description;
        product.price = +isValid.data.price;
        product.bestprice = body.bestPrice === 'on' ? 1 : 0;
        if (body.removeImage === 'on') {
            req.app.locals.file(product.file).deleteFromPublic();
            product.file = '/images/books/empty.png';
        }

        await ProductModel3.update(product, {
            where: { id: +body.id }
        });

        return res.redirect('/admin/products');
    } catch (err) {
        throw new Error(err);
    }

}


async function isImage(req: Request): Promise<{ status: boolean, message: string }> {
    let isFileValid = await req.app.locals.validate({
        file: { isImage: true, message: 'Unsupported file type' }
    });
    return isFileValid as any;
}