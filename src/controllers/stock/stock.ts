import { apiResponse } from "../../common";
import { itemModel, stockModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = require("mongoose").Types.ObjectId

export const addStock = async (req, res) => {
    try {
        const { itemId, addGram } = req.body;
        const date = new Date();
        const time = date.toLocaleTimeString();

        // Get current stock
        const currentStock = await stockModel.findOne({ itemId }).sort({ createdAt: -1 });
        const totalGramItem = currentStock ? currentStock.totalGramItem + addGram : addGram;

        const stock = new stockModel({
            itemId,
            addGram,
            removeGram: 0,
            totalGramItem,
            date,
            time
        });

        await stock.save();

        // Check for low stock (less than 1kg)
        if (totalGramItem < 1000) {
            const item = await itemModel.findById(itemId);
            return res.status(200).json({
                success: true,
                data: stock,
                warning: `Low stock alert: ${item?.name} has only ${totalGramItem}g remaining`
            });
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("stock"), stock, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
};

export const removeStock = async (req, res) => {
    try {
        const { itemId, removeGram } = req.body;
        const date = new Date();
        const time = date.toLocaleTimeString();

        const currentStock = await stockModel.findOne({ itemId: ObjectId(itemId) }).sort({ createdAt: -1 });
        if (!currentStock || currentStock.totalGramItem < removeGram) {
            return res.status(400).json(new apiResponse(400, responseMessage.insufficientStock, {}, {}))
        }

        const totalGramItem = currentStock.totalGramItem - removeGram;

        const stock = new stockModel({
            itemId,
            addGram: 0,
            removeGram,
            totalGramItem,
            date,
            time
        });

        await stock.save();

        // Check for low stock
        if (totalGramItem < 1000) {
            const item = await itemModel.findOne({ _id: ObjectId(itemId) });
            return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("stock"), stock, {}))
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("stock"), stock, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
};

export const getCurrentStock = async (req, res) => {
    try {
        const stocks = await stockModel.aggregate([
            {
                $group: {
                    _id: '$itemId',
                    totalGramItem: { $last: '$totalGramItem' },
                    lastUpdate: { $last: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'items',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'item'
                }
            },
            {
                $unwind: '$item'
            }
        ]);

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("stocks"), stocks, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}; 