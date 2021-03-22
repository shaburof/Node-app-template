import { rootFolder } from '../../server';
import { orderPdfType, typePdfGenerate, generatePdfType } from '../../types/types';
import ejs from 'ejs';
import htmlPdf from 'html-pdf';
import path from 'path';
import { promisify } from 'util';
import _fs from 'fs';
import { Stream } from 'nodemailer/lib/xoauth2';
import dotenv from 'dotenv';
let fs = _fs.promises;
dotenv.config()


class Pdf {
    private template = path.join(rootFolder, 'src', 'views', 'pdf', 'pdfTemplate.ejs')
    private order: orderPdfType;
    // TODO add helper to generate options.base
    private options: htmlPdf.CreateOptions = {
        format: "Letter",
        type: 'pdf',
        quality: "75",
        base: 'http://127.0.0.1:8080'
    };
    private filePath: string = '';

    constructor(order: orderPdfType) {
        this.order = order;
    }

    public static async generate<T extends string | Buffer | NodeJS.ReadableStream>(params: generatePdfType): Promise<T> {

        return new Pdf(params.order).createPdf(params.type, params.filePath);
    }

    public async createPdf(type: typePdfGenerate, filePath?: string) {
        this.filePath = filePath ? filePath : '';
        let html = await this.getHtml();

        let createdPdf = htmlPdf.create(html, this.options);

        try {
            let result = await this[type](type, createdPdf);
            return result;
        } catch (error) {
            return error;
        }
    }

    private toFile(type: string, createdPdf: htmlPdf.CreateResult) {
        return new Promise((resolve, reject) => {
            if (this.isValid()) reject(new Error('Specify the correct path to create a pdf file'));
            createdPdf.toFile(this.filePath, (err: any, result: any) => {
                err && reject(err);
                resolve(result);
            });
        });
    }

    private isValid() {
        return !this.filePath || this.filePath === '';
    }

    private toBuffer(type: string, createdPdf: htmlPdf.CreateResult) {
        return new Promise((resolve, reject) => {
            createdPdf.toBuffer((err: any, result: any) => {
                err && reject(err);
                resolve(result);
            });
        });
    }

    private toStream(type: string, createdPdf: htmlPdf.CreateResult) {
        return new Promise((resolve, reject) => {
            createdPdf.toStream((err: any, result: any) => {
                err && reject(err);
                resolve(result);
            });
        });
    }

    private async getHtml() {
        let template = await this.getTemplate();
        return ejs.render(template, { order: this.order });
    }

    private async getTemplate() {
        return (await fs.readFile(this.template)).toString();
    }

    private getBaseOptions() {
        let host = process.env.HOST;
        let protocol = process.env.PROTOCOL;
        let port = (process.env.PORT === '80') ? '' : `:${process.env.PORT}`;

        return `${protocol}://${host}${port}`;
    }
}

export { Pdf };