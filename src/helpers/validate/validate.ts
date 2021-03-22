import { validateParamsType, validateDataType } from '../../types/types';
import { validateCore } from './validateCore';
import { Request } from 'express';

class validate extends validateCore {

    constructor(params: validateParamsType, req:Request) {
        super(params, req);
    }

    public static validate(params: validateParamsType, req:Request) {
        return new validate(params, req).start();
    }

    private async isImage(paramName: string, paramValue: any){
        let file = this.files[paramName];
        let mimeType = file.mimetype;
        let reg = new RegExp('^image\/');
        if(!reg.test(mimeType)) this.sendError('File mimeType is not image');
        return true;
    }

    private async isUserAlreadyExists(paramName: string, paramValue: any) {
        let user = await this.getUser(paramName, paramValue);
        if (!user) this.sendError('The specified email is missing');
        return true;
    }

    private async isUserNotRegistered(paramName: string, paramValue: any) {
        let user = await this.getUser(paramName, paramValue);
        if (user) this.sendError('User with this email address is already registered in the system');
        return true;
    }

    private compare(paramName: string, paramValue: any) {
        let compareWithName = this.params[paramName].compare!.compareWith;
        let compareWith = this.data[compareWithName];
        if (!compareWith || paramValue !== compareWith) this.sendError(`must match`);

    }

    private isEmail(paramName: string, paramValue: any) {
        let isEmail = this.getEmailRegexp().test(paramValue);
        if (!isEmail) this.sendError('must be email');
    }

    private require(paramName: string, paramValue: any) {
        paramName = paramName.toString().trim();
        if (!paramValue || paramValue === '') this.sendError(`is required`);

    }

    private isLength(paramName: string, paramValue: string) {
        let isLengthParams = this.params[paramName].isLength!;

        if (isLengthParams) {
            if (isLengthParams.min && paramValue.length < isLengthParams.min) this.sendError(`should be more than ${isLengthParams.min}`);
            if (isLengthParams.max && paramValue.length > isLengthParams.max) this.sendError(`should be less than ${isLengthParams.max}`);
        }
    }

    private howManyNumbersAfterDot(paramName: string, paramValue: string) {
        let numbersAfterDot = this.params[paramName].howManyNumbersAfterDot;
        if (paramValue.toString().split('.')[1]?.length > numbersAfterDot) this.sendError(`must be no more than ${numbersAfterDot} digits after the decimal point`);

    }

}

export { validate }