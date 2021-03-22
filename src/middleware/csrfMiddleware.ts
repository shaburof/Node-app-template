import { Request, Response, NextFunction } from 'express';

const allowIndexUrl = true;
const excludeUrl = [
    '/api/v1/**'
];

let csrfMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    if (isExcludeUrl(req)) return next();

    if (!req.session!.csrf) { req.session!.csrf = getToken(); }
    res.locals.csrf = req.session!.csrf;

    if (!verifyCsrf(req)) return next(new Error(`csrf not match, url: ${req.url}, method: ${req.method}`));
    else next();
}

export { csrfMiddleware };

function isExcludeUrl(req: Request) {
    let currentUrl = req.url;
    for (const url of excludeUrl) {
        return compareExcludeUrlWithPlaceholders(url, currentUrl);
    }
    return false;
}

function getToken() {
    let numbers = '1234567890';
    let specialChars = '!@#$%^&*-+';
    let chars = 'qwertyuiopasdfghjklzxcvbnm';

    let token = '';
    for (let index = 0; index < 30; index++) {
        let randomIndex = Math.floor(Math.random() * chars.length);
        let randomChar = Math.floor(Math.random() * specialChars.length);
        let randomNumber = Math.floor(Math.random() * numbers.length);
        let tokenChar = randomIndex % 2 ? chars[randomIndex].toUpperCase() : chars[randomIndex].toLowerCase() + specialChars[randomChar] + numbers[randomNumber];
        token += tokenChar;
    }

    return token;
}

function verifyCsrf(req: Request) {
    let csrfVerify = true;
    let method = req.method;
    let csrfCheckMethods = ['POST', 'PUT', 'UPDATE', 'DELETE'];
    if (csrfCheckMethods.includes(method)) {
        let csrfBody = req.body.csrf || req.headers.csrf;
        let csrfSession = req.session!.csrf;
        if (csrfBody !== csrfSession) csrfVerify = false;
    }

    return csrfVerify;
}

function compareExcludeUrlWithPlaceholders(pattern: string, url: string) {
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