// import { app } from '../server';
import { Request, Response, NextFunction } from 'express';
import { loginController } from '../controllers/login/loginController';
import { userModel3 } from '../models/userModel3';
import { model } from '../models/model';
import { isAdmin, isLogin, crudGuard } from '../helpers/guard';
let Model = new model(userModel3);

let userMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    let userFromSession = req.session!.user;
    
    try {
        let user = await findUserAndStoreInSession(req, userFromSession);
        authIfUserRememberMe(req, res, user);

        res.locals.isLogin = isLogin(user);
        res.locals.isAdmin = isAdmin(user);
        res.locals.guard = guard(req);

        createAdminUserAfterInitialize(req, res);

        next();
    } catch (err) {
        req.session!.user = {};
        res.locals.isLogin = false;
        next(err);
    }
}



export { userMiddleware };

function guard(req: Request) {
    return (guarded_id: number) => {
        let loggedUser = req.session!.user;
        return crudGuard(loggedUser, { id: guarded_id });
    }
}

async function createAdminUserAfterInitialize(req: Request, res: Response) {
    if (res.app.locals.loginAdmin && res.app.locals.loginAdmin.status && res.app.locals.loginAdmin.admin) {
        await loginController.storeUserInSession(req, res.app.locals.loginAdmin.admin);
        delete res.app.locals.loginAdmin;
    }
}

async function authIfUserRememberMe(req: Request, res: Response, user: any) {
    let rememberme_token = req.signedCookies.rememberme_token;
    if (!user && typeof rememberme_token !== 'undefined' && rememberme_token !== '') {

        let user = await Model.findBy('rememberme_token', rememberme_token);
        if (user) {
            loginController.storeUserInSession(req, user);
            loginController.rememberMe(res, user)
        }
    }
}

async function findUserAndStoreInSession(req: Request, user: any) {
    if (req.session!.user && req.session!.user.id) {
        let id = req.session!.user.id;
        user = await Model.findById(id);
        loginController.storeUserInSession(req, user);
        return user;
    }
    return null;
}