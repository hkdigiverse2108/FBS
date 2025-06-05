import { apiResponse } from '../../common';
import { itemModel, saleModel, stockModel } from '../../database';
import { reqInfo, responseMessage } from '../../helper';
import { generateInvoiceNumber } from '../../helper/utils';

const ObjectId = require("mongoose").Types.ObjectId

// Helper function to get start and end of day
const getStartAndEndOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// Helper function to get or create today's stock entry
const getOrCreateTodayStock = async (itemId) => {
    const today = new Date();
    const { start: startOfToday, end: endOfToday } = await getStartAndEndOfDay(today);

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
            closingStock: yesterdayStock ? yesterdayStock.closingStock : 0
        }).save();
    }

    return todayStock;
};

export const createSale = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { items, paymentMode, customerName, mobile } = req.body;
    try {
        const date = new Date();
        const time = date.toLocaleTimeString();

        // Calculate totals and validate stock
        let total = 0;
        let totalCost = 0;

        for (const item of items) {
            const itemDetails = await itemModel.findOne({ _id: new ObjectId(item.itemId) }).lean();
            if (!itemDetails) {
                return res.status(400).json(new apiResponse(400, responseMessage.getDataNotFound("item"), {}, {}))
            }

            // Get today's stock
            const todayStock: any = await getOrCreateTodayStock(item.itemId);
            // Check if sufficient stock is available
            if (todayStock.closingStock < item.quantityGram) {
                return res.status(400).json(new apiResponse(400, responseMessage.insufficientStock, {}, {}))
            }

            // Calculate prices
            const unitPrice = itemDetails.perKgPrice / 1000;
            const unitCost = itemDetails.perKgCost / 1000;

            total += unitPrice * item.quantityGram;
            totalCost += unitCost * item.quantityGram;

            // Update stock
            todayStock.removedStock = Number(todayStock.removedStock) + Number(item.quantityGram);
            todayStock.closingStock = Number(todayStock.openingStock) + Number(todayStock.addedStock) - Number(todayStock.removedStock);
            await todayStock.save();
        }

        const profit = total - totalCost;
        const invoiceNumber = await generateInvoiceNumber();

        const sale = new saleModel({
            items,
            paymentMode,
            customerName,
            mobile,
            storeId: new ObjectId(user.storeId),
            userId: new ObjectId(user._id),
            date,
            time,
            total,
            totalCost,
            profit,
            invoiceNumber
        });

        await sale.save();

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("sale"), sale, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
};

export const getSales = async (req, res) => {
    let { startDate, endDate, userId } = req.query;
    try {
        const query: any = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        if (userId) query.userId = userId;
        
        const sales = await saleModel.find(query).populate('userId', 'name').populate('items.itemId', 'name');

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("sales"), sales, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
};

export const getSale = async (req, res) => {
    try {
        const sale = await saleModel.findOne({ _id: new ObjectId(req.params.id) }).lean()
            .populate('userId', 'name')
            .populate('items.itemId', 'name');

        if (!sale) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("sale"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("sale"), sale, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}; 