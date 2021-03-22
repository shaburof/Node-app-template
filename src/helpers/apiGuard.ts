import { Request } from 'express';
import { guardOptionsInterface } from '../types/interfaces';
import { login } from '../controllers/login/login';
import { userModel3 } from '../models/userModel3';
import { model } from '../models/model';

class ApiGuard {

    public static async guard(req: Request, options?: guardOptionsInterface): Promise<{ result: boolean, message: string }> {
        try {
            let { api_token } = req.headers;
            let result = await new ApiGuard(api_token?.toString(), options).go();

            return { result, message: '' };

        } catch (error) {
            return { result: false, message: error.message };
        }
    }

    private api_tokenFromHeader: string | undefined;
    private api_token: string;
    private model: model;
    private options?: guardOptionsInterface;

    constructor(api_token: string | undefined, options?: guardOptionsInterface) {
        this.api_tokenFromHeader = api_token;
        this.options = options;
    }

    private async go() {
        return this.tokenCheck();
    }

    private async tokenCheck() {
        if (this.isExists()) this.api_token = this.api_tokenFromHeader as string;
        else this.checkFalse();

        this.createUserModel();
        let user = await this.getUser();
        if (!user) this.checkFalse();

        let { result, message } = await login.limitLoginAttemptsApi(user);
        if (!result) this.checkFalse(message);
        if (this.isTokenExpired(user)) this.checkFalse('token is expired');

        if (!this.isRoleCorrect(user)) this.checkFalse();

        return true;
    }

    private checkFalse(message?: string) {
        throw new Error(message || 'not authorized');
    }

    private isExists() {
        return (typeof this.api_tokenFromHeader === 'string' && this.api_tokenFromHeader !== '') ? true : false;
    }

    private isRoleCorrect(user: any) {
        if (!this.options || !this.options.only) return true;

        return user.role === this.options.only;
    }

    private isTokenExpired(user: any) {
        let { api_token_expired } = user;
        let now = new Date();

        return api_token_expired < now;
    }

    private async getUser() {
        let user = await this.model.findBy('api_token', this.api_token);
        return user;
    }

    private createUserModel() {
        this.model = new model(userModel3);
    }

}

export { ApiGuard };