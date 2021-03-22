import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { sendMail } from '../../helpers/mail/sendMail';
import { userModel3 } from '../../models/userModel3';
import { model } from '../../models/model';
import { loginUrlType } from '../../types/enums';
import { loginController } from './loginController';

class login {
    private static emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    protected static model = new model(userModel3);
    private static resetTokenDatetimeOffsetInHours = 1;
    private static registraionConfirmDatetimeOffsetInHours = 24;
    private static loginAttempts = 3;
    private static loginAttemptsExpiredInMinutes = 1;
    private static maxApiRequests = 100;

    protected static async sendResetPasswordEmail(to: string, link: string) {
        let text = `To recover your password, follow the link below. In the form that opens, enter the password and password confirmation, then log in with a new password.`;
        sendMail.send(to, 'Reset password', text, link);
    }

    protected static async sendConfirmRegistrationEmail(to: string, link: string) {
        let text = `You have 24 hours to confirm your registration.To confirm follow the specified link. After confirming registration, log in using the specified credentials.`;
        sendMail.send(to, 'Confirm your registration', text, link);
    }

    protected static buildLink(req: Request, type: loginUrlType, reset_token: string) {
        let host = process.env.HOST;

        let urlType = type === loginUrlType.RESET ? 'reset' : 'registration';

        const url = new URL(`http://${host}/${urlType}`);
        url.port = process.env.PORT as string;
        url.protocol = 'http';
        url.searchParams.append('token', reset_token);

        return url.toString();
    }

    protected static async loginBodyValidate(req: Request, body: { [prop: string]: string }) {
        let validateResult = await req.app.locals.validate({
            email: { require: true, isEmail: true, message: 'Enter correct email address', sanitize: { normalize: true, trim: true } },
            password: { require: true, message: 'Password is required' }
        })

        if (!validateResult.status) {
            return { isValid: false, validateResultMessage: validateResult.message as string, failValue: validateResult.value, data: validateResult.data };
        }
        return { isValid: true, validateResultMessage: '', failValue: '', data: validateResult.data };
    }
    protected static async postResetPasswordValidate(req: Request, body: { [prop: string]: string }) {
        let validateResult = await req.app.locals.validate({
            email: { require: true, isEmail: true, isUserAlreadyExists: true, message: 'Incorrect email or such user is not registereduser' },
        }, body);
        if (!validateResult.status) {
            return { isValid: false, validateResultMessage: validateResult.message as string, failValue: validateResult.value };
        }
        return { isValid: true, validateResultMessage: '' };
    }

    protected static async signInBodyValidate(req: Request, body: { [prop: string]: string }) {
        let validateResult = await req.app.locals.validate({
            name: { require: true, message: 'Introduce yourself please' },
            email: { require: true, isEmail: true, isUserNotRegistered: true, message: 'The email address is incorrect or the user with this email is already registered in the system', sanitize: { normalize: true, trim: true } },
            password: { require: true, compare: { compareWith: 'password2' }, isLength: { min: 6 }, sanitize: { trim: true } },
            password2: { require: true, isLength: { min: 6 }, sanitize: { trim: true } }
        }, body);

        if (!validateResult.status) {
            return { isValid: false, validateResultMessage: validateResult.message as string, failValue: validateResult.value, data: validateResult.data };;
        }

        return { isValid: true, validateResultMessage: '', failValue: '', data: validateResult.data };;
    }

    protected static async isAccountBusyNow(email: string) {
        return await login.model.findBy('email', email);
    }

    protected static async storeUser(body: { name: string, email: string, password: string }) {
        let hash = await login.hashPassword(body.password);
        let registration_token = login.createToken(50);
        return login.model.create({
            name: body.name,
            email: body.email,
            password: hash,
            role: 'USER',
            registration_token: registration_token,
            registration_token_datetime: new Date()
        });
    }

    public static async addAdmin() {
        let hash = await login.hashPassword('111111');
        return await login.model.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: hash,
            role: 'ADMIN',
            registration_confirm: true
        });
    }

    protected static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                err && reject(err);
                bcrypt.hash(password, salt, (err, hash) => {
                    err && reject(err);
                    resolve(hash);
                });
            });
        });
    }

    public static async limitLoginAttemptsApi(user: any): Promise<{ result: boolean, message: string }> {
        let message = '';
        let result = true;
        if (!user) {
            message = 'Wrong email or password';
            result = false;
        } else {
            let login_attempts = ++user.login_attempts;
            let expired_login_attempts = user.expired_login_attempts;
            let now = new Date();

            if (expired_login_attempts < now) {
                now.setMinutes(now.getMinutes() + login.loginAttemptsExpiredInMinutes);
                login_attempts = 0;
                expired_login_attempts = now;
            }
            if (login_attempts >= login.maxApiRequests) {
                message = `the maximum size of requests has been exceeded. Try it in ${login.loginAttemptsExpiredInMinutes} minute.`;
                result = false;
            } else {
                login.model.update({ login_attempts, expired_login_attempts }, { where: { id: user.id } });
            }
        }

        return { result: result, message: message };
    }

    private static async limitLoginAttempts(email: string): Promise<{ result: boolean, user: any, message: string }> {
        let message = '';
        let result = true;
        let user = await login.model.findBy('email', email);
        if (!user) {
            message = 'Wrong email or password';
            result = false;
        } else {
            let login_attempts = ++user.login_attempts;
            let expired_login_attempts = user.expired_login_attempts;
            let now = new Date();

            if (expired_login_attempts < now) {
                now.setMinutes(now.getMinutes() + login.loginAttemptsExpiredInMinutes);
                login_attempts = 0;
                expired_login_attempts = now;
            }
            if (login_attempts >= login.loginAttempts) {
                message = `The login attempts limit has been reached. Try it in ${login.loginAttemptsExpiredInMinutes} minute.`;
                result = false;
            } else {
                login.model.update({ login_attempts, expired_login_attempts }, { where: { id: user.id } });
            }
        }

        return { result: result, user: user, message: message };
    }

    protected static loginCheck(email: string, password: string): Promise<{ result: boolean, user: any, message: string }> {
        return new Promise(async (resolve, reject) => {
            let { result, user, message } = await login.limitLoginAttempts(email);

            if (!result || !user) return resolve({ result: false, user: null, message: message });
            if (!user.registration_confirm) return resolve({ result: false, user: null, message: 'Registration not confirm' });

            bcrypt.compare(password, user.password, function (err, result) {
                err && reject(err);
                if (!result) message = 'Wrong email or password';
                else login.model.update({ login_attempts: 0, expired_login_attempts: '1970-01-01 00:00:00' }, { where: { id: user.id } });

                return resolve({ result, user, message: message });
            });

        });
    }

    protected static async removeMememberMeToken(req: Request, res: Response) {
        let user = (await login.model.findById(req.session!.user.id)).dataValues;
        user.rememberme_token = '';
        await login.model.update(user, { where: { id: user.id } })
        res.clearCookie('rememberme_token');
    }

    protected static createToken(length: number) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    protected static async generateUserToken(user: any) {
        let token = (user.id + login.createToken(20)).toString();

        return token;
    }

    protected static async storeToken(user: any) {
        let reset_token = await login.generateUserToken(user);
        let dateTime = new Date();

        user = user.dataValues;
        user.reset_token = reset_token;
        user.reset_token_datetime = dateTime;

        await login.model.update(user, { where: { id: user.id } });
        return reset_token;
    }

    protected static async removeResetToken(user: any) {
        user = user.dataValues;
        user.reset_token = '';
        user.reset_token_datetime = '1970-01-01 00:00:00';
        login.model.update(user, { where: { id: user.id } });
    }

    protected static async storeUpdatedPassword(user: any, password: string) {
        let hash = await login.hashPassword(password);
        login.model.update({
            password: hash,
            reset_token: '',
            reset_token_datetime: new Date('1970-01-01 00:00:00')
        }, { where: { id: user.id } });
    }

    protected static async getUser(email: string) {
        let user = await login.model.findBy('email', email);

        return user;
    }

    protected static async findUserByResetToken(reset_token: string) {
        if (!reset_token) throw new Error('reset_token missing');
        return login.model.findBy('reset_token', reset_token);
    }

    protected static async checkResetTokenDatetime(user: any) {
        if (!user) throw new Error('user missing');

        let dateTime = user.reset_token_datetime as Date;

        let now = new Date();
        now.setHours(now.getHours() - login.resetTokenDatetimeOffsetInHours);

        if (dateTime < now) {
            await login.removeResetToken(user);
            return false;
        }
        return true;
    }

    protected static async checkRegistrationConfirmDatetime(user: any) {
        if (!user) throw new Error('user missing');

        let dateTime = user.registration_token_datetime as Date;

        let now = new Date();
        now.setHours(now.getHours() - login.registraionConfirmDatetimeOffsetInHours);

        if (dateTime < now) {
            await login.removeResetToken(user);
            return false;
        }
        return true;
    }

    protected static async resetPasswordValidate(req: Request, body: { [prop: string]: string }) {
        let { status, message, value } = await req.app.locals.validate({
            password: { require: true, compare: { compareWith: 'password2' }, isLength: { min: 6 }, },
            password2: { require: true },
        }, body);
        if (!status) {
            return { isValid: false, message: message as string, failField: value };
        }
        return { isValid: true, message: '', failField: '' };
    }
}

export { login }