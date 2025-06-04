"use strict"
import { Router } from 'express'
import { stockRoutes } from './stock'
import { itemRoutes } from './item'
import { saleRoutes } from './sale'
import { uploadRouter } from './upload'
import { authRoutes } from './auth'
import { storeRoutes } from './store'
import { salesmanRoutes } from './salesman'
import { adminJWT } from '../helper'

const router = Router()

router.use('/auth', authRoutes)

router.use(adminJWT)
router.use('/stock', stockRoutes)
router.use('/item', itemRoutes)
router.use('/sale', saleRoutes)
router.use('/upload', uploadRouter)
router.use('/store', storeRoutes)
router.use('/salesman', salesmanRoutes)

export { router }