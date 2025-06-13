"use strict"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { salesmanModel, userModel, userSessionModel } from '../../database'
import { apiResponse, ROLES } from '../../common'
import { email_verification_mail, reqInfo, responseMessage } from '../../helper'
import { config } from '../../../config'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.JWT_TOKEN_SECRET

export const signUp = async (req, res) => {
    reqInfo(req)
    try {
        let body = req.body

        let isAlready: any = await userModel.findOne({ phoneNumber: body?.phoneNumber, isDeleted: false })
        if (isAlready) return res.status(409).json(new apiResponse(409, responseMessage?.alreadyPhoneNumber, {}, {}, {}))

        if (isAlready?.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}, {}))

        if (body?.role !== ROLES.SALESMAN) {
            const salt = await bcryptjs.genSaltSync(10)
            const hashPassword = await bcryptjs.hash(body.password, salt)
            delete body.password
            body.password = hashPassword
        }

        let response: any = await new userModel(body).save()
        response = {
            _id: response?._id,
            role: response?.role,
            firstName: response?.firstName,
            lastName: response?.lastName,
            phoneNumber: response?.phoneNumber,
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}))
    }
}

export const otp_verification = async (req, res) => {
    reqInfo(req)
    let body = req.body
    try {
        body.isActive = true
        let data = await userModel.findOne(body);
        if (!data) return res.status(400).json(new apiResponse(400, responseMessage?.invalidOTP, {}, {}, {}))
        if (data.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}, {}))
        if (data) {
            let response = await userModel.findOneAndUpdate(body, { otp: null, otpExpireTime: null, isEmailVerified: true, isLoggedIn: true }, { new: true });
            const token = jwt.sign({
                _id: response._id,
                status: "Login",
                generatedOn: (new Date().getTime())
            }, jwt_token_secret)

            await new userSessionModel({
                createdBy: response._id,
            }).save()

            let result = {
                _id: response?._id,
                role: response?.role,
                firstName: response?.firstName,
                lastName: response?.lastName,
                phoneNumber: response?.phoneNumber,
                token,
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.OTPVerified, result, {}, {}))
        }

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}))
    }
}

export const login = async (req, res) => { //email or password // phone or password
    reqInfo(req)
    let body = req.body, response: any
    try {
        response = await salesmanModel.findOne({ loginId: body?.phoneNumber, isDeleted: false }).lean()
        if (!response) response = await userModel.findOne({ phoneNumber: body?.phoneNumber, isDeleted: false }).lean()

        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordPhoneNumber, {}, {}, {}))
        if (response?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}, {}))

        if (response?.role !== ROLES.SALESMAN) {
            const passwordMatch = await bcryptjs.compare(body.password, response.password)
            if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordPhoneNumber, {}, {}, {}))
        } else {
            if (body?.password !== response?.password) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordPhoneNumber, {}, {}, {}))
        }

        const token = jwt.sign({
            _id: response._id,
            role: response.role,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        response = {
            role: response?.role,
            _id: response?._id,
            firstName: response?.firstName,
            lastName: response?.lastName,
            name: response?.name,
            phoneNumber: response?.phoneNumber,
            access: response?.access,
            token,
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}))
    }
}

export const forgot_password = async (req, res) => {
    reqInfo(req);
    let body = req.body, //email or phoneNumber
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0
    try {
        body.isActive = true;
        let data = await userModel.findOne(body);

        if (!data) {
            return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail, {}, {}, {}));
        }
        if (data.isBlocked == true) {
            return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}, {}));
        }

        let response: any = { sendMail: true }
        if (response) {
            await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(new apiResponse(200, `${response}`, {}, {}, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, {}, `${response}`, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}));
    }
};

export const reset_password = async (req, res) => {
    reqInfo(req)
    let body = req.body,
        { loginId } = body;

    try {

        let response: any = await salesmanModel.findOne({ loginId: body?.loginId, isDeleted: false })
        if (!response) response = await userModel.findOne({ email: body?.loginId, isDeleted: false })

        if (response?.role === ROLES.ADMIN) {
            const salt = await bcryptjs.genSaltSync(10)
            const hashPassword = await bcryptjs.hash(body.password, salt)
            delete body.password
            delete body.id
            body.password = hashPassword
        }

        let user = await salesmanModel.findOneAndUpdate({ email: body?.loginId, isDeleted: false }, body, { new: true })
        if (!user) user = await userModel.findOneAndUpdate({ loginId: body?.loginId, isDeleted: false }, body, { new: true })

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, response, {}, {}))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.resetPasswordError, {}, {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}))
    }
}


export const adminSignUp = async (req, res) => {
    reqInfo(req)
    try {
        let body = req.body,
            otp,
            otpFlag = 1; // OTP has already assign or not for cross-verification
        let isAlready = await userModel.findOne({ email: body?.email, isActive: true, userType: 1 })
        if (isAlready) return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}, {}))

        if (isAlready?.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}, {}))

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword
        body.userType = 1  //to specify this user is admin
        let response: any = await new userModel(body).save()
        response = {
            _id: response?._id,
            email: response?.email,
        }

        let result: any = await email_verification_mail(response, otp);
        if (result) {
            await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(new apiResponse(200, `${result}`, {}, {}, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, {}, `${result}`, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}))
    }
}

export const adminLogin = async (req, res) => { //email or password // phone or password
    let body = req.body,
        response: any
    reqInfo(req)
    try {
        response = await userModel.findOneAndUpdate({ email: body?.email, userType: 1, isActive: true }, { isLoggedIn: true }).select('-__v -createdAt -updatedAt')

        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordPhoneNumber, {}, {}, {}))
        if (response?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}, {}))

        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordPhoneNumber, {}, {}, {}))
        const token = jwt.sign({
            _id: response._id,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        await new userSessionModel({
            createdBy: response._id,
        }).save()
        response = {
            isEmailVerified: response?.isEmailVerified,
            userType: response?.userType,
            _id: response?._id,
            email: response?.email,
            token,
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}))
    }
}