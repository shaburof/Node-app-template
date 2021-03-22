import { Request, Response, NextFunction } from 'express';
import { authGuard, isAdmin as _isAdmin, crudGuard, isLogin as _isLogin } from '../helpers/guard';
import { ApiGuard } from '../helpers/apiGuard';
import { guardedType } from '../types/types';

const guardedUrls: guardedType = [
    { url: '/api/v1/**', method: '*', api: true },
    { url: '/foo', method: 'POST' },
    // { url: '/bar', method: 'POST' },
    { url: '/orders', method: 'GET' },
    { url: '/cart', method: 'GET' },
    { url: '/cart', method: 'POST', redirect: '/login' },
    { url: '/orders', method: 'POST' },
    { url: '/order/download/**', method: 'GET' },
    { url: '/admin/add-product', method: 'GET' },
    { url: '/admin/store-product', method: 'POST' },
    { url: '/admin/**', only: 'ADMIN', method: 'GET', redirect: '/' },
    { url: '/admin/**', only: 'ADMIN', method: 'POST', redirect: '/' },
];
const logoffGuarded: guardedType = [
    { url: '/login' },
    { url: '/signup' },
    { url: '/resetpassword', method: 'GET' },
    { url: '/resetpassword', method: 'POST' },
    { url: '/reset', method: 'GET' },
    { url: '/reset', method: 'POST' },
];

const skipGuarded: guardedType = [
    { url: '/foo', method: 'GET' },
    { url: '/api/v1/test', method: 'GET' },
    { url: '/api/v1/auth', method: 'POST' },
    { url: '/api/v1/tokenrenew', method: 'POST' },
];

const defaultRedirect = '/';
const allowIndexUrl = true;

let guardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    req.app.locals.isAdmin = isAdmin(req);
    req.app.locals.guard = guard(req);
    req.app.locals.isLogin = isLogin(req);


    if (isSkipedUrl(req)) return next();

    let isGuarded = await isGuardedUrl(req);
    if (isGuarded?.isGuarded) return redirect({ req, res, ...isGuarded });

    let isLogoffGuarded = isLogoffGuardedUrl(req);
    if (isLogoffGuarded?.isGuarded) return redirect({ req, res, ...isLogoffGuarded });

    next();
}

export { guardMiddleware };

function isAdmin(req: Request) {
    return () => {
        let loggedUser = req.session!.user;
        return _isAdmin(loggedUser);
    }
}

function isLogin(req: Request) {
    return () => {
        let loggedUser = req.session!.user;
        return _isLogin(loggedUser);
    }
}

function guard(req: Request) {
    return (guarded_id: number, allow?: { adminAllow: boolean }) => {
        if (!isLogin(req)()) return false;

        let loggedUser = req.session!.user;
        let options: { id: number, adminAllow?: boolean } = { id: guarded_id };
        if (allow?.adminAllow === true) options.adminAllow = true;

        return crudGuard(loggedUser, options);
    }
}

function compareGuardUrlWithPLaceholders(pattern: string, url: string) {
    if (allowIndexUrl && url === '/') return false;

    let splitedPattern = pattern.split('/').splice(1, pattern.length);
    let splitedUrl = url.split('/').splice(1, url.length);
    if (splitedPattern[splitedPattern.length - 1] === '') splitedPattern.splice(splitedPattern.length - 1, 1);
    if (splitedUrl[splitedUrl.length - 1] === '') splitedUrl.splice(splitedUrl.length - 1, 1);

    if (splitedPattern.length !== splitedUrl.length && !splitedPattern.includes('**')) return false;

    let urlPassed = true;
    let patternMaskAdded = false;
    for (let index = 0; index < splitedUrl.length; index++) {
        if (splitedPattern[index] === '*') continue;
        if (splitedPattern[index] === '**') patternMaskAdded = true;

        if (splitedUrl[index] !== splitedPattern[index] && !patternMaskAdded) {
            urlPassed = false;
            break;
        }
    }
    return urlPassed;
}

function getGuardedByMethodArray(guarded: guardedType, method: string) {
    return guarded.filter(g => {
        if (typeof g.method === 'undefined' || (g.method === 'GET' && g.method === method)) {
            return true;
        } else if (g.method === '*') {
            return true;
        }
        return g.method === method;
    })
}

function isLogoffGuardedUrl(req: Request) {
    let url = req.url, user = req.session!.user;;
    for (const guard of logoffGuarded) {
        if (compareGuardUrlWithPLaceholders(guard.url, url)) {
            let isGuarded = authGuard(user);
            let redirectPath = guard.redirect ? guard.redirect : defaultRedirect;
            if (isGuarded) return { isApi: false, redirectPath, isGuarded: true };
            break;
        }
    }
}

async function isGuardedUrl(req: Request) {
    let url = req.url, method = req.method, user = req.session!.user;

    let guardedByMethod = getGuardedByMethodArray(guardedUrls, method);
    let isGuarded: boolean;

    for (const guard of guardedByMethod) {
        if (compareGuardUrlWithPLaceholders(guard.url, url)) {
            if (guard.api) {
                let { result: isGuardedApi, message } = await ApiGuard.guard(req, { only: guard.only });

                if (!isGuardedApi) return { isApi: true, message: message, isGuarded: true };
            } else {
                let redirectPath = guard.redirect ? guard.redirect : defaultRedirect;
                isGuarded = authGuard(user, { only: guard.only });
                if (!isGuarded) return { isApi: false, redirectPath, isGuarded: true };
            }
            break;
        }
    }
}

function isSkipedUrl(req: Request) {
    let url = req.url,
        method = req.method;

    let guardedByMethod = getGuardedByMethodArray(skipGuarded, method);
    for (const guard of guardedByMethod) {
        if (compareGuardUrlWithPLaceholders(guard.url, url)) {
            return true;
        }
    }
    return false;
}



function isXhrRequest(req: Request) {
    return req.xhr ? true : false;
}

function redirect({ req, res, redirectPath, isApi, message }: { req: Request, res: Response, redirectPath?: string, isApi?: boolean, message?: string }) {
    if (isApi) {
        return res.status(401).json({ status: false, message: message })
    }
    else if (isXhrRequest(req)) {
        return res.status(401).json({ status: false, message: 'not authorized', redirectTo: redirectPath });
    }
    else {
        return res.redirect(redirectPath || '/');
    }
}