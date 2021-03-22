import express from 'express';
import { Request, Response, NextFunction } from 'express';

import { getAddProduct, getClearProduct, getEditProduct, postEditProduct, postStoreProduct, getProducts, deleteProduct, createDummyProducts, createDummyUser } from '../controllers/adminController';

const router = express.Router();

router.get('/add-product', getAddProduct);
router.get('/clear-product', getClearProduct);
router.post('/store-product', postStoreProduct);
router.delete('/delete-product/:id', deleteProduct);
router.get('/products', getProducts);
router.get('/edit-product/:id', getEditProduct);
router.post('/edit-product', postEditProduct);
router.get('/create-dummy-products', createDummyProducts);
router.get('/create-dummy-user', createDummyUser);

export default router;