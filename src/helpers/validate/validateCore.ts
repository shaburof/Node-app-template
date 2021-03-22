import { validateParamsType, validateDataType } from '../../types/types';
import { error } from '../error';
import { userModel3 } from '../../models/userModel3';
import { model } from '../../models/model';
import { Sanitize } from './sanitize';
import { Request } from 'express';

class validateCore {
    private model: model;
    private customMessage = '';
    protected sanitizeTypes = {};
    protected sanitizeDataResult = {};
    protected data:validateDataType;
    protected files:any;

    // constructor(protected params: validateParamsType, protected data: validateDataType) {
    constructor(protected params: validateParamsType, req:Request) {
        this.data = req.body;
        this.files = req.files;
        this.model = new model(userModel3);
    }

    protected async start() {
        for (const paramName in this.params) {
            this.extractCustomMessage(paramName);
            this.extractSanitizeTypes(paramName);

            let validatorNames = this.getValidatorNames(paramName);
            for (const validator of validatorNames) {
                this.sanitize(paramName, this.data[paramName]);
                try {
                    await this[validator](paramName, this.data[paramName]);
                } catch (err) {
                    return this.sendFailResult(err as error, paramName);
                };
            }
        }

        return this.createResultObject(true);
    }

    private extractSanitizeTypes(paramName: string) {
        let _sanitizeTypes = this.params[paramName].sanitize ? this.params[paramName].sanitize as {} : {};
        if (this.isSanitizeTypesExists(_sanitizeTypes)) this.sanitizeTypes = _sanitizeTypes;
        delete this.params[paramName].sanitize;
    }

    private isSanitizeTypesExists(sanitizeTypes: {}) {
        return typeof sanitizeTypes !== 'undefined' && Object.keys(sanitizeTypes).length > 0;
    }

    private async sanitize(paramName: string, paramValue: any) {
        if (this.isSanitizeTypesExists(this.sanitizeTypes)) {
            let result = new Sanitize(this.sanitizeTypes).start(paramName, paramValue);
            return this.addSanitizeDataResults(result.paramName, result.paramValue);
        }

        return this.addSanitizeDataResults(paramName, paramValue);
    }

    private addSanitizeDataResults(paramName: string, paramValue: any) {
        this.sanitizeDataResult[paramName] = paramValue;
    }

    private createResultObject(status: boolean, options?: { paramName?: string, message?: string }) {
        return {
            status: status,
            message: options?.message || '',
            value: options?.paramName || '',
            data: this.sanitizeDataResult
        }
    }

    private extractCustomMessage(paramName: string) {
        let customMessage = this.params[paramName].message || '';
        delete this.params[paramName].message;

        this.customMessage = customMessage;
    }

    private getValidatorNames(paramName: string) {
        return Object.keys(this.params[paramName])
    }

    private sendFailResult(err: error, paramName: string) {
        let message = this.createErrorMessage({ parameterName: paramName, err: err });
        this.showErrorOnConsole(err);

        return this.createResultObject(false, { message: message, paramName: paramName });
    }

    private createErrorMessage({ parameterName, err }: { parameterName: string, err: error }) {
        return (this.customMessage && this.customMessage !== '')
            ? this.customMessage
            : `"${parameterName}" ${err.message}`;
    }

    private showErrorOnConsole(err: error) {
        err.code !== 100 && console.log(err);
    }

    protected async getUser(searchBy: string, value: string) {
        return await this.model.findBy(searchBy, value);
    }

    protected sendError(message: string) {
        throw new error(message, 100);
    }

    protected getEmailRegexp() {
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    }

}

export { validateCore };