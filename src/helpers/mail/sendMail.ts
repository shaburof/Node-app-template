import nodemailer from 'nodemailer';
import { transporter } from './mailTransport';
import path from 'path';
import { rootFolder } from '../../server';
import _fs from 'fs';
let fs = _fs.promises;
import ejs from 'ejs';

class sendMail {

    private static mailFrom = process.env.MAIL_FROM;
    private static mailFromName = process.env.MAIL_FROM_NAME;
    private static transporter = transporter;
    private static template = path.join(rootFolder, 'src', 'views', 'mail', 'mailTemplate.html')

    private static async getTemplate() {
        return (await fs.readFile(sendMail.template)).toString();
    }

    private static async renderTemplate(text: string, link?: string) {
        let template = await sendMail.getTemplate();
        return ejs.render(template, { text, link });
    }

    private static async sendViaTransport(to: string, subject: string, template: string, text: string) {
        transporter.sendMail({
            from: `"${sendMail.mailFromName}" <${sendMail.mailFrom}>`,
            to: to,
            subject: subject,
            text: text,
            html: template,
            attachments: [{
                filename: 'color-logo.png',
                path: path.join(rootFolder, 'public', 'images', 'color-logo.png'),
                cid: 'logo'
            }]
        });
    }

    public static async send(to: string, subject: string, text: string, link = '') {
        let template = await this.renderTemplate(text, link);

        sendMail.sendViaTransport(to, subject, template, `${text} ${link}`);


    }

}

export { sendMail }