import express from 'express';
import * as  shopController from '../controllers/shopController';
import { orderController } from '../controllers/orderController';

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/foo', shopController.getFoo);
router.get('/bar', shopController.getBar);
router.post('/bar', shopController.postBar);

router.get('/products', shopController.getProducts);

router.get('/products/:id', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.post('/deletecart', shopController.deleteCart);

router.post('/addcart', shopController.addCart);

router.post('/purgecart', shopController.purgecart);

router.get('/clearcart', shopController.clearcart);

router.post('/cart', shopController.postCart);

router.get('/checkout', shopController.getCheckout);

router.get('/orders', orderController.getOrders);

router.get('/orders/download/:orderId', orderController.downloadOrder);

router.get('/makeorder', orderController.makeOrder);

router.delete('/deleteorder/:id', orderController.deleteOrder);

export default router;