import { apiResponse, ROLES } from "../../common";
import { itemModel, saleModel, stockModel } from "../../database";
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
    console.log('Start and End of Today:', { startOfToday, endOfToday });
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

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("stock"), todayStock, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
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
            return res.status(400).json(new apiResponse(400, responseMessage.insufficientStock, {}, {}, {}));
        }

        todayStock.removedStock = Number(todayStock.removedStock) + Number(removeGram);
        todayStock.closingStock = Number(todayStock.openingStock) + Number(todayStock.addedStock) - Number(todayStock.removedStock);
        await todayStock.save();

        if (todayStock.closingStock < 1000) {
            const item = await itemModel.findOne({ _id: new ObjectId(itemId), isDeleted: false });
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("stock"), todayStock, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
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

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("monthly stock"), monthlyStock[0] || {}, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
    }
};

export const getCurrentStock = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { search } = req.query;
    try {
        let match: any = {};

        if (user.role === ROLES.ADMIN || user.role === ROLES.SALESMAN) {
            match.storeId = new ObjectId(user.storeId);
        }

        if (search) {
            match.$or = [
                { "item.name": { $regex: search, $options: 'i' } },
            ]
        }

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

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("stocks"), stocks, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
    }
};

export const editStock = async (req, res) => {
    reqInfo(req);
    let { stockId, addedStock, removedStock } = req.body, { user } = req.headers;
    try {
        const stock = await stockModel.findOne({ _id: new ObjectId(stockId), isDeleted: false });
        if (!stock) {
            return res.status(400).json(new apiResponse(400, responseMessage.getDataNotFound("stock"), {}, {}, {}));
        }

        // Update stock values
        if (addedStock !== undefined) {
            stock.addedStock = Number(addedStock);
        }
        if (removedStock !== undefined) {
            stock.removedStock = Number(removedStock);
        }

        // Recalculate closing stock
        stock.closingStock = Number(stock.openingStock) + Number(stock.addedStock) - Number(stock.removedStock);

        // Update subsequent days' opening and closing stocks
        const subsequentStocks = await stockModel.find({
            itemId: stock.itemId,
            date: { $gt: stock.date },
            isDeleted: false
        }).sort({ date: 1 });

        let previousClosingStock = stock.closingStock;
        for (const subsequentStock of subsequentStocks) {
            subsequentStock.openingStock = previousClosingStock;
            subsequentStock.closingStock = Number(subsequentStock.openingStock) +
                Number(subsequentStock.addedStock) -
                Number(subsequentStock.removedStock);
            previousClosingStock = subsequentStock.closingStock;
            await subsequentStock.save();
        }

        await stock.save();

        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("stock"), stock, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
    }
};

export const deleteStock = async (req, res) => {
    reqInfo(req);
    let { stockId } = req.params, { user } = req.headers;
    try {
        const stock = await stockModel.findOne({ _id: new ObjectId(stockId), isDeleted: false });
        if (!stock) {
            return res.status(400).json(new apiResponse(400, responseMessage.getDataNotFound("stock"), {}, {}, {}));
        }

        // Soft delete the stock entry
        stock.isDeleted = true;
        await stock.save();

        // Update subsequent days' opening and closing stocks
        const subsequentStocks = await stockModel.find({
            itemId: stock.itemId,
            date: { $gt: stock.date },
            isDeleted: false
        }).sort({ date: 1 });

        // Get the previous valid stock entry
        const previousStock = await stockModel.findOne({
            itemId: stock.itemId,
            date: { $lt: stock.date },
            isDeleted: false
        }).sort({ date: -1 });

        let previousClosingStock = previousStock ? previousStock.closingStock : 0;
        for (const subsequentStock of subsequentStocks) {
            subsequentStock.openingStock = previousClosingStock;
            subsequentStock.closingStock = Number(subsequentStock.openingStock) +
                Number(subsequentStock.addedStock) -
                Number(subsequentStock.removedStock);
            previousClosingStock = subsequentStock.closingStock;
            await subsequentStock.save();
        }

        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess("stock"), {}, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
    }
};

export const checkStockAvailability = async (req, res) => {
    reqInfo(req);
    let { id } = req.params, { user } = req.headers;
    try {
        const today = new Date();
        const { start: startOfToday, end: endOfToday } = getStartAndEndOfDay(today);

        const todayStock = await stockModel.findOne({
            itemId: new ObjectId(id),
            date: {
                $gte: startOfToday,
                $lte: endOfToday
            },
            isDeleted: false
        });

        const item = await itemModel.findOne({ _id: new ObjectId(id), isDeleted: false });

        if (!item) {
            return res.status(400).json(new apiResponse(400, responseMessage.getDataNotFound("item"), {}, {}, {}));
        }

        let stockInfo = {
            isAvailable: false,
            availableQuantity: todayStock ? todayStock.closingStock : 0,
            itemId: id,
            pricingType: item.pricingType,
            stockDetails: {},
            date: today
        };

        if (item.pricingType === 'weight') {
            stockInfo.stockDetails = {
                availableInGrams: todayStock ? todayStock.closingStock : 0,
                availableInKg: todayStock ? (todayStock.closingStock / 1000).toFixed(2) : "0.00",
                perKgPrice: item.perKgPrice,
                perKgCost: item.perKgCost
            };
            stockInfo.isAvailable = todayStock ? todayStock.closingStock > 0 : false;
        } else {
            stockInfo.stockDetails = {
                availableUnits: todayStock ? todayStock.closingStock : 0,
                perItemPrice: item.perItemPrice,
                perItemCost: item.perItemCost
            };
            stockInfo.isAvailable = todayStock ? todayStock.closingStock > 0 : false;
        }

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("today's stock availability"), stockInfo, {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error, {}));
    }
};