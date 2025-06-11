import express from 'express';
import * as saleController from '../controllers/sale/sale';

const router = express.Router();

router.post('/add', saleController.createSale);
router.get('/sold-items', saleController.getSoldItems);
router.get('/collection', saleController.getCollection);
router.get('/remaining-stock', saleController.getRemainingStock);
router.get('/platform-fees-report', saleController.getPlatformFeesReport);
router.get('/cost-report', saleController.getTodayCostReport);
router.get('/profit-report', saleController.getProfitReport);
router.get('/', saleController.getSales);
router.get('/:id', saleController.getSale);

export const saleRoutes = router; 