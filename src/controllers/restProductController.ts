import { Request, Response, NextFunction } from 'express';
import { ProductModel3 } from '../models/productModel3';
import { Model } from 'sequelize';
import { model } from '../models/model';

class RestProductController {
    private static defaultLimit = 50

    public static getProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { isPresent, limit, offset } = RestProductController.getLimitOffset(req);
            let products: Model<any, any>[];

            if (isPresent) products = await RestProductController.productsModel().findPaginateLimit({ limit: limit || RestProductController.defaultLimit, offset: offset });
            else products = await RestProductController.productsModel().findAll();

            return res.status(200).json({ status: true, result: products });
        } catch (error) {
            return RestProductController.sendError(error, req, next);
        }
    }


    private static getLimitOffset(req: Request) {
        let isPresent = false;
        let offset = Number.parseInt(req.query.offset as string);
        let limit = Number.parseInt(req.query.limit as string);
        limit = limit
            ? limit > RestProductController.defaultLimit
                ? RestProductController.defaultLimit
                : limit
            : RestProductController.defaultLimit;

        if (!Number.isNaN(offset)) isPresent = true;

        return { isPresent, limit, offset };
    }

    private static productsModel = () => {
        return new model(ProductModel3);
    }

    private static sendError(error: Error, req: Request, next: NextFunction) {
        req.app.locals.api = true;
        return next(error);
    }
}

export { RestProductController };