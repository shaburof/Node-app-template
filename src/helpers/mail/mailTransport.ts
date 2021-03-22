let mailHost = process.env.MAIL_HOST;
let mailPort = +(process.env.MAIL_PORT as string);
let mailUser = process.env.MAIL_USER
let mailPass = process.env.MAIL_PASS;

import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    auth: {
        user: mailUser,
        pass: mailPass
    }
});
