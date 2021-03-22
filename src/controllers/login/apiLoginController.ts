import { Request, Response, NextFunction } from 'express';
import { login } from './login';
import { userModel3 } from '../../models/userModel3';
import { model } from '../../models/model';


class apiLoginController extends login {

    public static auth = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { isValid, validateResultMessage, failValue, data } = await apiLoginController.loginBodyValidate(req, req.body);
            if (!isValid) throw new Error(validateResultMessage);

            let { result, user, message } = await apiLoginController.loginCheck(data.email, data.password);
            if (!result) throw new Error(message);

            let { api_token, api_reset_token, api_token_expired } = await apiLoginController.setApiToken(user);

            return res.status(200).json({ status: true, api_token, api_reset_token, api_token_expired });
        } catch (error) {
            return apiLoginController.sendError(error, req, next);
        }
    }

    public static tokenRenew = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { api_reset_token:_api_reset_token } = req.headers;
            if(!_api_reset_token) throw new Error('renew faild');

            let Model = apiLoginController.createModel();
            let user = await Model.findBy('api_reset_token',_api_reset_token)
            if(!user) throw new Error('renew faild');

            let { api_token, api_reset_token, api_token_expired } = await apiLoginController.setApiToken(user);
            return res.status(200).json({ status: true, api_token, api_reset_token, api_token_expired });
        } catch (error) {
            apiLoginController.sendError(error,req,next);
        }
    }

    private static setApiToken = async (user: any) => {
        let Model = apiLoginController.createModel();
        let api_token = await login.generateUserToken(user);
        let api_reset_token = await login.generateUserToken(user);
        let api_token_expired = new Date();
        api_token_expired.setHours(api_token_expired.getHours() + 1);

        Model.update({ api_token, api_reset_token, api_token_expired }, {
            where: { id: user.id }
        });

        return { api_token, api_reset_token, api_token_expired };
    }

    private static createModel() {
        return new model(userModel3);
    }

    private static sendError(error: Error, req: Request, next: NextFunction) {
        req.app.locals.api = true;
        return next(error);
    }

}

export { apiLoginController };