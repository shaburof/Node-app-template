import { app } from '../server';
import { Request, Response, NextFunction } from 'express';

app.use(renderUtilMeddleware);

function renderUtilMeddleware(req: Request, res: Response, next: NextFunction) {

    res.app.locals.url = req.url;
    res.app.locals.titlePage = 'Book Shop';

    res.locals.active = (url: string) => (req.originalUrl === url || res.locals.activeLink === url) ? 'active' : '';

    res.locals.old = (key: string) => {
        if (typeof req.session!.old !== 'undefined' && req.session!.old[key]) {
            let result = req.session!.old[key];
            delete req.session!.old[key];
            return result;
        }
        return '';
    };

    res.locals.sessionId = () => req.sessionID;

    next();
};

