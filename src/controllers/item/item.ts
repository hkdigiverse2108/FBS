import { apiResponse, ROLES } from "../../common";
import { itemModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";

const ObjectId = require("mongoose").Types.ObjectId

export const createItem = async (req, res) => {
    reqInfo(req);
    let body = req.body, { user } = req.headers
    try {

        let isExist = await itemModel.findOne({ name: body.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist(body.name), {}, {}));

        if (body.pricingType === "weight") {
            const pricePerGram = body.perKgPrice / 1000;
            const costPerGram = body.perKgCost / 1000;

            body.perKgPricePerGram = pricePerGram;
            body.perKgCostPerGram = costPerGram;
        }

        body.userId = new ObjectId(user?._id)
        body.storeId = new ObjectId(user?.storeId)

        const response = await new itemModel(body).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}));

        let item = await itemModel.findOne({ _id: new ObjectId(response._id), isDeleted: false }).lean()
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("item"), item, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const updateItem = async (req, res) => {
    reqInfo(req);
    let body = req.body
    try {
        let item = await itemModel.findOne({ _id: new ObjectId(body.itemId), isDeleted: false }).lean()
        if (!item) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("item"), {}, {}))

        if (body.pricingType === "weight") {
            const pricePerGram = body.perKgPrice / 1000;
            const costPerGram = body.perKgCost / 1000;

            body.perKgPricePerGram = pricePerGram;
            body.perKgCostPerGram = costPerGram;
        }

        let response = await itemModel.findOneAndUpdate({ _id: new ObjectId(body.itemId), isDeleted: false }, body, { new: true }).lean()
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError("item"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("item"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getItems = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, { user } = req.headers;
    let response: any, match: any = {};

    try {
        match.isDeleted = false;

        if (user?.userType === ROLES.ADMIN) {
            match.userId = new ObjectId(user?._id)
        }

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: 'i' } },
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


        response = await itemModel.aggregate([
            { $match: match },
            {
                $facet: facetPipeline
            }
        ]);


        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("item"), {
            item_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const getItem = async (req, res) => {
    reqInfo(req);
    let { id } = req.params
    try {
        const item = await itemModel.findOne({ _id: new ObjectId(id), isDeleted: false });
        if (!item) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("item"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("item"), item, {}))
    } catch (error: any) {
        console.log(error)
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};

export const deleteItem = async (req, res) => {
    reqInfo(req);
    try {
        const item = await itemModel.findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { isDeleted: true });
        if (!item) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("item"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("item"), {}, {}))
    } catch (error: any) {
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};
