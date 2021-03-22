import { Request, Response, NextFunction } from 'express';
import { FlashMessage } from '../helpers/flashMessage/FlashMessage';
import { GetSetFlash } from '../helpers/flashMessage/GetSetFlash';

const flashMiddleware = (req: Request, res: Response, next: NextFunction) => {

    if (!req.session!.flash) req.session!.flash = {};
    if (!req.session!.old) req.session!.old = {};

    req.app.locals.flash = getFlash(req, res);
    // req.app.locals.sendFlashMessage = sendFlashMessage(req, res);
    req.app.locals.flashMessage = new FlashMessage(req, res);
    req.app.locals.error = setErrorOnField(req, res);

    next();
}

export { flashMiddleware }

let setErrorOnField = (req: Request, res: Response) => {
    return (fieldName: string, invalidClassName?: string) => {
        invalidClassName = invalidClassName || 'invalidField';
        let errorFieldName = req.session!.flash.errorField;
        if (fieldName === errorFieldName) {
            getFlash(req, res)('errorField'); // in fail field find, remove value of "errorField" from flash session
            return invalidClassName;
        }
        return '';
    }
}

// example: req.app.locals.sendFlashMesssage('qwe',null,{title:'hello',email:'email@example.com'});
let sendFlashMessage = (req: Request, res: Response) => {
    return (message: string, type?: 'INFO' | 'WARNING' | 'ERROR', old?: {}) => {
        if (!message) throw new Error('Specify the message parameter for sendFlashMesssage.');

        let messageType = '';
        if (type === 'WARNING') messageType = 'message--warning';
        else if (type === 'ERROR') messageType = 'message--error';
        else messageType = 'message--info';

        if (old) {
            Object.keys(old).map(key => {
                req.session!.old[key] = old[key]
            })
        }

        req.app.locals.flash('show_message', true);
        req.app.locals.flash('message_type', messageType);
        req.app.locals.flash('message', message);
    }
}


let getFlash = (req: Request, res: Response) => {
    return (key: string, value?: string): string => {
        return GetSetFlash.flash(req, key, value);
    }
}