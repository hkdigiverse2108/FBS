import express from 'express';
import * as saleController from '../controllers/sale/sale';
import { salesmanController } from '../controllers';

const router = express.Router();

router.post('/add', salesmanController.addSalesman);
router.post('/edit', salesmanController.editSalesmanById);
router.delete('/:id', salesmanController.deleteSalesmanById);
router.get('/', salesmanController.getAllSalesman);
router.get('/:id', salesmanController.getSalesmanById);

export const salesmanRoutes = router; 