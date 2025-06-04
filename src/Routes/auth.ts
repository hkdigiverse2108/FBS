import express from 'express';
import * as authController from '../controllers/Auth/auth';

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/reset/password', authController.reset_password);

export const authRoutes = router; 