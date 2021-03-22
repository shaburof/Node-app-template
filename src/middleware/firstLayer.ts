import { Request, Response, NextFunction } from 'express';
import { cartController } from '../controllers/cartController';
import { priceController } from '../controllers/priceController';

const firstLayes = (req: Request, res: Response, next: NextFunction) => {
    // res.setHeader( 'X-Powered-By', 'Awesome App v0.0.1' );
    cartController.initCart(req);

    res.app.locals.ses = function (key?: string, value?: any) {
        if (typeof key !== 'undefined') {
            if (typeof value === 'undefined') {
                if (typeof req.session![key] !== 'undefined' && req.session![key] !== '') return req.session![key];
                else return undefined;
            } else {
                req.session![key] = value;
            }
        } else {
            return req.session;
        }
    };

    // working with price in view
    req.app.locals.price = priceController;

    next();
}

export { firstLayes }