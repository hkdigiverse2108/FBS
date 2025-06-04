import express from 'express';
import * as adminController from '../controllers/admin/admin';

const router = express.Router();

router.get('/dashboard', adminController.getDashboardStats);
router.get('/reports', adminController.getSalesReport);

export default router; 