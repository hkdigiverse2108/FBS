import express from 'express';
import * as saleController from '../controllers/sale/sale';

const router = express.Router();

router.post('/add', saleController.createSale);
router.get('/', saleController.getSales);
router.get('/:id', saleController.getSale);

export const saleRoutes = router; 