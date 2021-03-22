import { Request, Response, NextFunction } from 'express';

class GetSetFlash {
    private static key: string;
    private static value: any;
    private static req: Request;

    public static flash(req: Request, key: string, value?: any) {
        if (!key) throw new Error('flash must use with key parameter');

        GetSetFlash.key = key;
        GetSetFlash.value = value;
        GetSetFlash.req = req;

        if (value) return GetSetFlash.setFlash();
        return GetSetFlash.getFlash();
    }

    private static setFlash() {
        GetSetFlash.req.session!.flash[GetSetFlash.key] = GetSetFlash.value;
        return GetSetFlash.value;
    }

    private static getFlash() {
        let flash = null;
        let { firstKey, keys } = GetSetFlash.splitKey();

        if (GetSetFlash.isSplittedDotsExists() && GetSetFlash.isObjectInFlash(firstKey)) {
            flash = GetSetFlash.getObjectFromFlash({ firstKey, keys });
        } else flash = GetSetFlash.getNotObjectFromFlash();

        return flash;
    }

    private static splitKey() {
        let keys = GetSetFlash.key.split('.');
        let firstKey = keys[0];

        return { firstKey, keys };
    }

    private static isSplittedDotsExists() {
        return GetSetFlash.key.includes('.');
    }
    private static isObjectInFlash(firstKey: string) {
        return typeof GetSetFlash.req.session!.flash[firstKey] === 'object';
    }

    private static getObjectFromFlash({ keys, firstKey }) {
        let sessionElement: any;
        let flash: any;
        for (let index = 0; index < keys.length; index++) {
            const element = keys[index];
            sessionElement = !sessionElement ? GetSetFlash.req.session!.flash[element] : sessionElement[element];
        }
        flash = sessionElement;
        GetSetFlash.removeValueFromSession(firstKey);

        return flash;
    }

    private static getNotObjectFromFlash() {
        let flash = GetSetFlash.req.session!.flash[GetSetFlash.key];
        GetSetFlash.removeValueFromSession(GetSetFlash.key);

        return flash;
    }

    private static removeValueFromSession(key: string) {
        delete GetSetFlash.req.session!.flash[key];
    }
}

export { GetSetFlash };