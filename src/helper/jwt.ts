import jwt from 'jsonwebtoken'
// import { userModel } from '../database'
import mongoose from 'mongoose'
import {  apiResponse, userStatus } from '../common'
import { Request, response, Response } from 'express'
import { responseMessage } from './response'
import { config } from '../../config'
import { salesmanModel, userModel } from '../database'

const ObjectId = require("mongoose").Types.ObjectId
const jwt_token_secret = config.JWT_TOKEN_SECRET;

export const adminJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)

            result = await userModel.findOne({ _id: new ObjectId(isVerifyToken._id), isDeleted: false })
            if (!result) result = await salesmanModel.findOne({ _id: new ObjectId(isVerifyToken._id), isDeleted: false })
            if (result?.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}, {}));
            if (result?.isDeleted == false) {
                // Set in Header Decode Token Information
                req.headers.user = result
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, responseMessage?.invalidToken, {}, {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, responseMessage?.differentToken, {}, {}, {}))
            console.log(err)
            return res.status(401).json(new apiResponse(401, responseMessage.invalidToken, {}, {}, {}))
        }
    } else {
        return res.status(401).json(new apiResponse(401, responseMessage?.tokenNotFound, {}, {}, {}))
    }
}
