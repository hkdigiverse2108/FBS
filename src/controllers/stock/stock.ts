import { apiResponse } from "../../common";
import { itemModel, stockModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";

const ObjectId = require("mongoose").Types.ObjectId;

// Helper function to get start and end of day
const getStartAndEndOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const getOrCreateTodayStock = async (itemId, user) => {
    const today = new Date();
    const { start: startOfToday, end: endOfToday } = getStartAndEndOfDay(today);

    let todayStock = await stockModel.findOne({
        itemId: new ObjectId(itemId),
        date: {
            $gte: startOfToday,
            $lte: endOfToday
        },
        isDeleted: false
    });

    if (!todayStock) {
        const yesterdayStock: any = await stockModel.findOne({
            itemId: new ObjectId(itemId),
            date: { $lt: startOfToday },
            isDeleted: false
        }).sort({ date: -1 }).lean();

        todayStock = await new stockModel({
            itemId,
            date: today,
            openingStock: yesterdayStock ? yesterdayStock.closingStock : 0,
            closingStock: yesterdayStock ? yesterdayStock.closingStock : 0,
            storeId: new ObjectId(user.storeId),
            userId: new ObjectId(user._id)
        }).save();
    }

    return todayStock;
};

export const addStock = async (req, res) => {
    reqInfo(req);
    let { itemId, addGram } = req.body, { user } = req.headers;
    try {
        const todayStock: any = await getOrCreateTodayStock(itemId, user);
        todayStock.storeId = new ObjectId(user.storeId);
        todayStock.userId = new ObjectId(user._id);
        todayStock.addedStock = Number(todayStock.addedStock) + Number(addGram);
        todayStock.closingStock = Number(todayStock.openingStock) + Number(todayStock.addedStock) - Number(todayStock.removedStock);
        await todayStock.save();

        if (todayStock.closingStock < 1000) {
            const item = await itemModel.findOne({ _id: new ObjectId(itemId), isDeleted: false });
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("stock"), todayStock, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const removeStock = async (req, res) => {
    reqInfo(req);
    let { itemId, removeGram } = req.body, { user } = req.headers;
    try {
        const todayStock: any = await getOrCreateTodayStock(itemId, user);
        todayStock.storeId = new ObjectId(user.storeId);
        todayStock.userId = new ObjectId(user._id);

        if (todayStock.closingStock < removeGram) {
            return res.status(400).json(new apiResponse(400, responseMessage.insufficientStock, {}, {}));
        }

        todayStock.removedStock = Number(todayStock.removedStock) + Number(removeGram);
        todayStock.closingStock = Number(todayStock.openingStock) + Number(todayStock.addedStock) - Number(todayStock.removedStock);
        await todayStock.save();

        if (todayStock.closingStock < 1000) {
            const item = await itemModel.findOne({ _id: new ObjectId(itemId), isDeleted: false });
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("stock"), todayStock, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getStock = async (req, res) => {
    reqInfo(req);
    let { itemId, dateFilter } = req.body, { user } = req.headers;
    try {
        const monthlyStock = await stockModel.aggregate([
            {
                $match: {
                    storeId: new ObjectId(user.storeId),
                    date: {
                        $gte: new Date(dateFilter.start),
                        $lte: new Date(dateFilter.end)
                    },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalAdded: { $sum: "$addedStock" },
                    totalRemoved: { $sum: "$removedStock" },
                    openingStock: { $first: "$openingStock" },
                    closingStock: { $last: "$closingStock" },
                    dailyRecords: { $push: "$$ROOT" }
                }
            }
        ]);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("monthly stock"), monthlyStock[0] || {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getCurrentStock = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;
    try {
        const stocks = await stockModel.aggregate([
            {
                $match: {
                    storeId: new ObjectId(user.storeId),
                    isDeleted: false
                }
            },
            {
                $sort: {
                    date: -1
                }
            },
            {
                $group: {
                    _id: "$itemId",
                    currentStock: { $first: "$closingStock" },
                    lastUpdate: { $first: "$date" }
                }
            },
            {
                $lookup: {
                    from: "items",
                    localField: "_id",
                    foreignField: "_id",
                    as: "item"
                }
            },
            {
                $unwind: "$item"
            }
        ]);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("stocks"), stocks, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};