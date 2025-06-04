import { Router } from 'express';
import { storeAccessMiddleware } from '../middleware/storeAccess';

import { adminJWT } from '../helper';
import { storeController } from '../controllers';

const router = Router();

router.use(adminJWT);

router.post('/add', storeController.addStore);
// router.get('/', storeController.getStores);
router.get('/:id', storeController.getStoreById);
// router.put('/:id', storeController.updateStore);
// router.delete('/:id', storeController.deleteStore);

export const storeRoutes = router; 