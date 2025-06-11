import { apiResponse } from "../../common";
import { platformFeeModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";

const ObjectId = require("mongoose").Types.ObjectId;

export const getPlatformFees = async (req, res) => {
    reqInfo(req);
    let { status, storeId, page = 1, limit = 10 } = req.query;
    let match: any = {};

    try {
        if (status) {
            match.status = status.toUpperCase();
        }
        if (storeId) {
            match.storeId = new ObjectId(storeId);
        }
        const fees = await platformFeeModel.find(match)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await platformFeeModel.countDocuments(match);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("platform fees"), {
            fees,
            total,
            page: Number(page),
            limit: Number(limit),
            page_limit: Math.ceil(total / limit) || 1,
        }, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
    }
}; 