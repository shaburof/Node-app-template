import express from 'express';
import { loginController } from '../controllers/login/loginController';
import { resetPasswordController } from '../controllers/login/resetPaswordController';
import { registration } from '../controllers/login/registration';

let router = express.Router();

router.get('/registration', registration.getRegistration);
router.get('/login', loginController.getLogin);
router.post('/login',loginController.postLogin );
router.get('/signup', loginController.getSignUp);
router.post('/signup', loginController.postSignUp);
router.get('/logoff', loginController.getLogoff);
router.get('/resetpassword', resetPasswordController.getResetPassword);
router.post('/resetpassword', resetPasswordController.postResetPassword);
router.get('/reset', resetPasswordController.getReset);
router.post('/reset', resetPasswordController.postReset);

export default router;