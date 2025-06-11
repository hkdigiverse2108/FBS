import { apiResponse, ROLES } from "../../common";
import { salesmanModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";

let ObjectId = require("mongoose").Types.ObjectId

export const addSalesman = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, body = req.body;
    try {

        let isExist = await salesmanModel.findOne({ phoneNumber: body.phoneNumber, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("phone number"), {}, {}, {}))

        if (user.role === ROLES.ADMIN) {
            body.userId = new ObjectId(user._id)
            body.storeId = new ObjectId(user.storeId)
        }

        body.role = ROLES.SALESMAN

        const response = await new salesmanModel(body).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}, {}));

        let newSalesman = await salesmanModel.findOne({ _id: new ObjectId(response._id), isDeleted: false }).lean()
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("salesman"), newSalesman, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}));
    }
};

export const editSalesmanById = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, body = req.body;
    try {

        let isExist = await salesmanModel.findOne({ _id: new ObjectId(body.salesmanId), isDeleted: false })
        if (!isExist) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("salesman"), {}, {}, {}))

        isExist = await salesmanModel.findOne({ phoneNumber: body.phoneNumber, userType: ROLES.SALESMAN, isDeleted: false, _id: { $ne: new ObjectId(body.salesmanId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("phone number"), {}, {}, {}))

        body.updatedBy = new ObjectId(user?._id)
        const response = await salesmanModel.findOneAndUpdate({ _id: new ObjectId(body.salesmanId), isDeleted: false }, body, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("salesman"), {}, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("salesman"), response, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}));
    }
};

export const deleteSalesmanById = async (req, res) => {
    reqInfo(req);
    let { id } = req.params;
    try {
        const response = await salesmanModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("salesman"), {}, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("salesman"), {}, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}));
    }
};

export const getAllSalesman = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, { user } = req.headers;
    let response: any, match: any = {};

    try {
        match.isDeleted = false;

        if (user?.role === ROLES.ADMIN) {
            match.storeId = new ObjectId(user?.storeId)
        }

        if (user?.userType === ROLES.SALESMAN) {
            match._id = new ObjectId(user?._id)
        }

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ]
        }

        let facetPipeline;
        if (page && limit) {
            page = Number(page);
            limit = Number(limit);
            facetPipeline = {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit }
                ],
                data_count: [{ $count: "count" }]
            }
        } else {
            facetPipeline = {
                data: [
                    { $sort: { createdAt: -1 } },
                ],
                data_count: [{ $count: "count" }]
            }
        }

        response = await salesmanModel.aggregate([
            { $match: match },
            {
                $facet: facetPipeline
            }
        ]);


        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("salesman"), {
            salesman_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}));
    }
};

export const getSalesmanById = async (req, res) => {
    reqInfo(req);
    let { id } = req.params;
    try {
        const response = await salesmanModel.findOne({ _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("salesman"), {}, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("salesman"), response, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}));
    }
};