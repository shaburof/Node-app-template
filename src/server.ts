import path from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import { flashMiddleware } from './middleware//flashMiddleware';
import expressMysqlSession from 'express-mysql-session';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const session = require('express-session');
const MySQLStore = expressMysqlSession(session)
import fileUpload from 'express-fileupload';

process.env.NODE_ENV = 'development';

app.use(helmet());
app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser('secretWordForCookie$^#', {
}));

const sessionStore = new MySQLStore({
    host: '127.0.0.1',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'bookshop',
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
});

app.use(session({
    key: 'sesid',
    secret: 'someSecretWord*$@',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60, httpOnly: true, signed: true }
}));

app.use(flashMiddleware);


export { app, Request, Response, NextFunction };
export let rootFolder = path.join(__dirname, '..');

