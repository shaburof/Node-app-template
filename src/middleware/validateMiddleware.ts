import { Request, Response, NextFunction } from 'express';
import { validate } from '../helpers/validate/validate';
import { validateParamsType } from '../types/types';

let validateMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    // validate({password:{
    //     require: true,
    //     isLength: {
    //         min: 5,
    //         max: 7
    //     },
    //     isEmail: true,
    //     compare: {
    //         compareWith: 'password2'
    //     }
    // }},req.body);
    req.app.locals.validate = validateFunction(req, res);
    next();
}

const validateFunction = (req: Request, res: Response) => {
    return (params: validateParamsType) => {
        let result = validate.validate(params, req);
        res.locals.validate = result;

        return result;
    }
}

export { validateMiddleware };