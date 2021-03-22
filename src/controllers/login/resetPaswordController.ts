import { Request, Response, NextFunction } from 'express';
import { login } from './login';
import { messageType } from '../../types/enums';
import { loginUrlType } from '../../types/enums';

class resetPasswordController extends login {

    public static getResetPassword(req: Request, res: Response, next: NextFunction) {
        res.render('UI/resetpassword', {
            type: 'email',
            title: 'Forgot your password?',
            action: '/resetpassword'
        });
    }

    public static async postResetPassword(req: Request, res: Response, next: NextFunction) {
        let body = req.body;
        let {isValid, validateResultMessage,failValue} = await login.postResetPasswordValidate(req,body);
        if(!isValid) return req.app.locals.flashMessage.error(validateResultMessage).withError(failValue).flash();
        
        let user = await resetPasswordController.getUser(body.email);
        let reset_token = await resetPasswordController.storeToken(user);

        let url = resetPasswordController.buildLink(req, loginUrlType.RESET, reset_token);
        resetPasswordController.sendResetPasswordEmail(body.email, url);
        
        return req.app.locals.flashMessage.message('An email has been sent to the specified email with instructions for password recovery').flash();
    }

    public static async getReset(req: Request, res: Response, next: NextFunction) {
        let reset_token = req.query.token as string;
        let user = await resetPasswordController.findUserByResetToken(reset_token);
        if (!user) { 
            return req.app.locals.flashMessage.error('Wrong token. Try again.').redirect('/resetpassword').flash();
         }

        res.render('UI/resetpassword', {
            type: 'password',
            title: 'Change password',
            action: '/reset',
            reset_token: reset_token,
            userId: user.id
        });
    }

    public static async postReset(req: Request, res: Response, next: NextFunction) {
        let reset_token = req.body.reset_token;
        let userId = req.body.userId;
        let validDatetime: boolean;
        let {isValid, message,failField} = await resetPasswordController.resetPasswordValidate(req,req.body);
        if(!isValid) return req.app.locals.flashMessage.error(message).withOld().withError(failField).redirect(`/reset?token=${reset_token}`).flash();

        try {
            if (!reset_token) throw new Error('reset_token mission in GET request');

            let user = await login.model.findById(userId);
            if (!user) throw new Error('user not found');
            if (reset_token !== user.reset_token) throw new Error('wrong reset_token for user');


            validDatetime = await resetPasswordController.checkResetTokenDatetime(user);
            if (!validDatetime) throw new Error('reset_token time expired');

            await resetPasswordController.storeUpdatedPassword(user, req.body.password);

            return req.app.locals.flashMessage.info('Your password has been successfully changed.').redirect('/login').flash();
        } catch (error) {
            console.log(error);
            return req.app.locals.flashMessage.error('Email not found or password reset link expired. Try again.').redirect('/resetpassword').flash();
        }
    }

}

export { resetPasswordController };
