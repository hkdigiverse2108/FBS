"use strict"
import { Router } from 'express'
import { responseMessage } from '../helper';
import { config } from '../../config';
import { apiResponse } from '../common';

const router = Router()

router.post("", (req: any, res: any) => {
    let file = req.file
    let imageUrl = config.BACKEND_URL + `/images/${file.filename}`;
    return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("Image"), imageUrl, {}));
})

export const uploadRouter = router