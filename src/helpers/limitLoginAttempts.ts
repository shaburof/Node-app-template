import { Request, Response, NextFunction } from 'express';

const limitLoginAttempts = (req: Request, res: Response, next: NextFunction) => {


    console.log(req.url);
    next();
}

export { limitLoginAttempts }