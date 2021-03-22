import { Request, Response, NextFunction } from 'express';
import { File } from '../helpers/files/File';

let filesMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    req.app.locals.file = file(req)
    next();
};

function file(req: Request) {
    return (fieldName: string) => {
        return new File(req, fieldName);
    }
}

export { filesMiddleware };