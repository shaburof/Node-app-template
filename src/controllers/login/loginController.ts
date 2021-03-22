import { Request, Response, NextFunction } from 'express';
import { loginUrlType } from '../../types/enums';
import { back, refer } from '../../helpers/helper';
import { messageType } from '../../types/enums';
import { login } from './login';
import { authGuard } from '../../helpers/guard';


class loginController extends login {


    public static async getLogoff(req: Request, res: Response, next: NextFunction) {
        await loginController.removeMememberMeToken(req, res);
        req.session?.destroy(err => {
            if (err) return next(err);
            res.redirect('/');
        });
    }

    public static async getLogin(req: Request, res: Response, next: NextFunction) {
        res.render('UI/login', {
            title: 'LOGIN',
            isSignUp: false,
            action: '/login'
        });
    }

    public static async postLogin(req: Request, res: Response, next: NextFunction) {
        let body = req.body;
        let { isValid, validateResultMessage, failValue,data } = await loginController.loginBodyValidate(req, body);
        if (!isValid) return req.app.locals.flashMessage.error(validateResultMessage).withError(failValue)
            .withOld({ without: ['password'] }).flash();

        try {
            let { result, user, message } = await loginController.loginCheck(data.email, data.password);
            if (!result) {
                return req.app.locals.flashMessage.error(message).withOld({ without: ['password'] })
                    .withError('password').flash();
            }
            else {
                await loginController.storeUserInSession(req, user);
                if (body.rememberme === 'on') {
                    loginController.rememberMe(res, user);
                }
                if (refer(req)?.includes(req.url)) res.redirect('/');
                else back(req, res);
            }
        } catch (error) {
            next(error);
        }
    }

    public static getSignUp(req: Request, res: Response, next: NextFunction) {
        res.locals.activeLink = '/login';
        res.render('UI/login', {
            title: 'SIGN UP',
            isSignUp: true,
            action: '/signup'
        });
    }

    public static async postSignUp(req: Request, res: Response, next: NextFunction) {
        let body = req.body;
        let { isValid, validateResultMessage, failValue, data } = await loginController.signInBodyValidate(req, body);
        if (!isValid) return req.app.locals.flashMessage.error(validateResultMessage).
            withOld().withError(failValue).flash();

        try {
            let user = await loginController.storeUser(data);

            let url = loginController.buildLink(req, loginUrlType.LOGINCONFIRM, user.registration_token);
            loginController.sendConfirmRegistrationEmail(data.email, url);
            return req.app.locals.flashMessage.info('A letter has been sent to the indicated email address with a link to confirm registration.')
                .redirect('/login').flash();;
        } catch (error) {
            next(error);
        }
    }

    public static async storeUserInSession(req: Request, user: any) {
        req.session!.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
    }

    public static rememberMe(res: Response, user: any) {
        let token = loginController.createToken(50);
        loginController.model.update({ rememberme_token: token }, { where: { id: user.id } });
        res.cookie('rememberme_token', token, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            signed: true
        })
    }



}

export { loginController }