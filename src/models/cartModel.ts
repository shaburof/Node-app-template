import fs from 'fs';
import path from 'path';
import { rootFolder } from '../server';
import { model } from './model';
import { ProductModel3 } from './productModel3';
// import { app } from '../server';
let ProductModel = new model(ProductModel3);


class cartModel {

    protected static _products: number[] = [];
    protected static _totalPrice: number = 0;

    protected static file = path.join(rootFolder, 'src', 'models', 'cart.txt');


    static get products() {
        return this._products;
    }

    static get totalPrice() {
        return this._totalPrice;
    }

    public static async initializeCart() {
        try {
            let cartFromDisk = await this.getCartFromDisk();
            this._products = cartFromDisk.products;
            this._totalPrice = cartFromDisk.totalPrice;
        } catch (err) {
            fs.writeFile(cartModel.file, cartModel.toString(), (err) => {
                if (err) console.log(err);
            });
        }
    }

    public static purgeCart() {
        this._products = [];
        this._totalPrice = 0;
        this.saveCartToDisk();
    }

    public static async removeProduct(id: number) {
        if (!this.isProductInCart(id)) return;

        const product = await ProductModel.findById(id);
        const price = product.price;

        let productIndex = this._products.findIndex(index => index === id)
        this._products.splice(productIndex, 1);
        this._totalPrice -= price;
        this.saveCartToDisk();
    }

    public static async addProduct(id: number) {
        if (this.isProductInCart(id)) return;

        const product = await ProductModel.findById(id);
        const price = product.price;

        this._products.push(id);
        this._totalPrice += price;
        this.saveCartToDisk();
    }

    public static async addProduct2(id: number) {
        if (this.isProductInCart(id)) return;

        const product = await ProductModel.findById(id);
        const price = product.price;

        // app.locals.ses('cart', { products: [id], totalPrice: price });
        // app.locals.ses('test', 'some value');
        // this._products.push(id);
        // this._totalPrice += price;
        // this.saveCartToDisk();
    }


    static async getCartFromDisk() {
        return new Promise<{ products: number[], totalPrice: number }>((resolve, reject) => {
            fs.readFile(this.file, (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                try {
                    let result = JSON.parse(data.toString());
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    static toString = () => {
        return JSON.stringify({ products: cartModel.products, totalPrice: cartModel.totalPrice });
    }

    static saveCartToDisk() {
        fs.writeFile(this.file, this.toString(), (err) => {
            if (err) throw new Error(err.message);
        });
    }

    public static isProductInCart(id: number) {
        return this._products.includes(id);
    }

}

export { cartModel };

