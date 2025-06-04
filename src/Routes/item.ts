import express from 'express';
import * as itemController from '../controllers/item/item';

const router = express.Router();

router.post('/add', itemController.createItem);
router.post('/edit', itemController.updateItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItem);
router.delete('/:id', itemController.deleteItem);

export const itemRoutes = router; 