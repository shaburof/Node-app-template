import { Request, Response } from 'express';
import { refer } from '../helper';

class FlashMessage {

    private _message = '';
    private _type = 'message--info';
    private _old = {};
    private _redirectPath;
    private _request: Request;
    private _response: Response;
    private _failValue = '';

    constructor(req: Request, res: Response) {
        this._request = req;
        this._response = res;
        this._redirectPath = refer(req) || '/';
    }

    public message(message: string) {
        this._message = message;
        return this;
    }

    public info(message = '') {
        message && (this._message = message);
        this._type = 'message--info';
        return this;
    }
    public warning(message = '') {
        message && (this._message = message);
        this._type = 'message--warning';
        return this;
    }
    public error(message = '') {
        message && (this._message = message);
        this._type = 'message--error';
        return this;
    }

    public withOld(withoutObject?: {without:string[]}) {
        this._old = this._request.body;
        if (withoutObject) for (const without of withoutObject.without) delete this._old[without];
        
        return this;
    }

    public withError(failValue: string) {
        this._type = 'message--error';
        this._failValue = failValue;
        return this;
    }

    public redirect(redirectPath: string) {
        this._redirectPath = redirectPath;
        return this;
    }

    public flash(): void {
        if (!this._message) throw new Error('Specify the message parameter for sendFlashMesssage.');

        if (this.isOldExists()) this.addOldToResponse();

        this._request.app.locals.flash('show_message', true);
        this._request.app.locals.flash('message_type', this._type);
        this._request.app.locals.flash('message', this._message);
        this.isFailValueExists() && this._request.app.locals.flash('errorField', this._failValue);

        return this._response.redirect(this._redirectPath);
    }

    private isOldExists() {
        return Object.keys(this._old).length > 0;
    }

    private isFailValueExists() {
        return this._failValue.trim() !== '';
    }

    private addOldToResponse() {
        Object.keys(this._old).map(key => {
            this._request.session!.old[key] = this._old[key]
        })
    }
}

export { FlashMessage }