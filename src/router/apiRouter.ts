import express from 'express';
import { RestProductController } from '../controllers/restProductController';
import { apiLoginController } from '../controllers/login/apiLoginController';

const router = express.Router();

router.post('/auth', apiLoginController.auth);
router.post('/tokenrenew', apiLoginController.tokenRenew);

router.get('/get_products', RestProductController.getProducts);

router.get('/test', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let data = { status: true, data: 'test', method: req.method };
    return res.status(200).json(data);
});

router.post('/test', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let data = { status: true, data: 'test', method: req.method };
    return res.status(200).json(data);
});

router.use('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    return res.status(500).json({ status: false, message: 'wrong request' });
})

export default router;