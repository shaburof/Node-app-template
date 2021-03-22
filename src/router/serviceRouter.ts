import express from 'express';

import { getPage404, getErrorPage } from '../controllers/serviceController';

let router = express.Router();

router.use('/error', getErrorPage);
router.use('*', getPage404);


export default router;