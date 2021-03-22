import { Request, Response, NextFunction } from 'express';
import { login } from './login';
import { messageType } from '../../types/enums';
import { loginUrlType } from '../../types/enums';

class registration extends login {

    private static async validateConfirmationRequest(user: any) {
        if (!user) throw new Error('Registration confirmation link is incorrect or expired.')
        let validDatetime = await login.checkRegistrationConfirmDatetime(user);
        
        if (!validDatetime) {
            login.model.destroy('id', user.id);
            throw new Error('Registration confirmation link is incorrect or expired.');
        }

        return user;
    }

    public static async getRegistration(req: Request, res: Response, next: NextFunction) {
        try {
            let registration_token = req.query.token;
            let user = await login.model.findBy('registration_token', registration_token);

            await registration.validateConfirmationRequest(user);

            await login.model.update({
                registration_confirm:true,
                registration_token_datetime:new Date('1970-01-01 00:00:00'),
                registration_token:''
            }, { where: { id: user.id } });

            return req.app.locals.flashMessage.info('Registration is confirmed.').redirect('/login').flash();
        } catch (error) {
            console.log(error);
            return req.app.locals.flashMessage.message('Registration confirmation link is incorrect or expired.').error().redirect('/signup').flash();
        }

    }

}

export { registration };