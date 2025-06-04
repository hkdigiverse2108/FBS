import express from 'express';
import { stockController } from '../controllers';

const router = express.Router();

router.post('/add', stockController.addStock);
router.post('/remove', stockController.removeStock);
router.get('/current', stockController.getCurrentStock);

export const stockRoutes = router; 