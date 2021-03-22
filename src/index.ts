console.clear();
console.log('---------------------------');

import path from 'path';
import { app, rootFolder } from './server';
import serviceRouter from './router/serviceRouter';
import adminRouter from './router/adminRoute';
import shopRouter from './router/shopRoute';
import apiRouter from './router/apiRouter';
import cors from 'cors';
import './helpers/serviceLayer';
import { firstLayes } from './middleware/firstLayer';
import { errorHandler } from './helpers/helper';
import { userMiddleware } from './middleware/userMiddleware';
import { createTables } from './models/createTables';
import { guardMiddleware } from './middleware/guardMiddleware';
import { csrfMiddleware } from './middleware/csrfMiddleware';
import { validateMiddleware } from './middleware/validateMiddleware';
import { filesMiddleware } from './middleware/fileMiddleware';
import loginRouter from './router/loginRouter';
import dotenv from 'dotenv';
dotenv.config()

app.use(cors({
    origin: [`${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // enable set cookie
}));


app.set('views', path.join(rootFolder, 'src', './views'));
app.set('view engine', 'ejs');

app.use(firstLayes);
app.use(userMiddleware);
app.use(csrfMiddleware);
app.use(validateMiddleware);
app.use(guardMiddleware);
app.use(filesMiddleware);

app.use('/api/v1', apiRouter);
app.use('/admin', adminRouter);
app.use(shopRouter);
app.use(loginRouter);

app.use(serviceRouter);

app.use(errorHandler);

(async () => {
    try {
        // await createTables(true);
        await createTables();
        app.listen(process.env.PORT, () => console.log(`Listen ${process.env.PORT} port...`));
    } catch (error) {
        console.log(error);
    }
})();


(async () => {


})();
