import { rootFolder, app } from '../server';
import { Request, Response, NextFunction } from 'express';
import { isConnect } from '../models/mysqlPool2';

export const renderUtilMeddleware = (req: Request, res: Response, next: NextFunction) => {
    app.locals.titlePage = 'Book Shop';
    app.locals.active = (url: string) => (req.originalUrl === url) ? 'active' : '';
    next();
};

export const back = (req: Request, res: Response) => {
    let refer = req.header('Referer') || '/';
    return res.redirect(refer);
}

export const refer = (req: Request) => {
    return req.header('Referer');
}

export let errorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    try {
        await isConnect();
        if (req.app.locals.api) {
            return res.status(500).json({ status: false, message: err.message });
        }
        return res.status(500).render('error');
    } catch (error) {
        return res.status(500).render('serverNotActive');

    }
}

export let getCurrentUrl = (req: Request) => {
    let host = req.get('host');
    let protocol = req.protocol;
    let url = req.originalUrl.split('?')[0];
    let params = '';
    for (const param in req.query) {
        let paramKey = param;
        let paramValue = req.query[paramKey];
        if (params === '') params += `?${paramKey}=${paramValue}`;
        else params += `&${paramKey}=${paramValue}`;
    }

    return `${protocol}://${host}${url}${params}`;
}