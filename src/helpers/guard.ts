import { guardType } from '../types/enums';
import { guardOptionsInterface, guardCrudOptionsInterface } from '../types/interfaces';


class Guard {

    private static user: any;
    private static adminRole = 'ADMIN';
    private static userHas = ['name', 'email'];

    public static goGuard(user: any, type: guardType, options?: guardOptionsInterface) {
        Guard.user = user;
        if (type === guardType.AUTH) return Guard.authGuard(options);
        else if (type === guardType.CRUD) return Guard.crudGuard(options);
        else if (type === guardType.IS_ADMIN) return Guard.isAdmin();
        return false;
    }

    private static isAdmin() {
        return Guard.user ? Guard.user.role === Guard.adminRole : false;
    }

    private static crudGuard = (options?: guardOptionsInterface) => {
        if (!Guard.user) return false;

        let pass1 = Guard.checkUserFields();
        let pass2 = false;

        if (options?.adminAllow && Guard.user.role === Guard.adminRole) pass2 = true;
        else if (Guard.user.id === options!.id) pass2 = true;

        return pass1 && pass2;

    }

    private static authGuard(options?: guardOptionsInterface) {

        if (!Guard.user) return false;

        let pass1 = Guard.checkUserFields();

        if (options && options.only) {
            let pass2 = false;
            if (options.only) {
                pass2 = Guard.checkOnly(options.only);
            }
            return pass1 && pass2;
        }

        return pass1;
    }

    private static checkUserFields() {
        let pass = true;
        for (const field of Guard.userHas!) {
            if (typeof Guard.user[field] === 'undefined') pass = false;
        }

        return pass;
    }

    private static checkOnly(only: string[] | string) {
        let pass = false;

        if (only === 'ADMIN') {
            if (Guard.user.role === 'ADMIN') {

                pass = true;
            }
        }

        return pass;
    }
}

let authGuard = (user: any, options?: guardOptionsInterface) => {
    try {
        let pass = Guard.goGuard(user, guardType.AUTH, options);
        return pass;
    } catch (error) {
        console.log(error);
        return false;
    }
}

let crudGuard = (user: any, options: guardCrudOptionsInterface) => {
    try {
        if (options && !options.adminAllow && typeof options!.id === 'undefined')
            throw new Error('authCrud options paramether must contain id');

        let pass = Guard.goGuard(user, guardType.CRUD, options);
        return pass;
    } catch (error) {
        console.log(error);
        return false;
    }
}

let isAdmin = (user: any) => {
    try {
        let pass = Guard.goGuard(user, guardType.IS_ADMIN);
        return pass;
    } catch (error) {
        console.log(error);
        return false;
    }
}

let isLogin = (user: any) => {
    return user ? true : false;
}

export { authGuard, crudGuard, isAdmin, isLogin }
