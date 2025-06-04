
import { apiResponse } from '../../common';
import { itemModel, saleModel, stockModel } from '../../database';
import { responseMessage } from '../../helper';
import { generateInvoiceNumber } from '../../helper/utils';

const ObjectId = require("mongoose").Types.ObjectId

export const createSale = async (req, res) => {
    try {
        const {
            items,
            paymentMode,
            customerName,
            mobile,
            userId
        } = req.body;

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

            // Check stock
            const currentStock = await stockModel.findOne({ itemId: new ObjectId(item.itemId) }).sort({ createdAt: -1 }).lean();
            if (!currentStock || currentStock.totalGramItem < item.quantityGram) {
                return res.status(400).json(new apiResponse(400, responseMessage.insufficientStock, {}, {}))
            }

            // Calculate prices
            const unitPrice = itemDetails.perKgPrice / 1000; // Price per gram
            const unitCost = itemDetails.perKgCost / 1000; // Cost per gram
            item.unitPrice = unitPrice;
            item.totalPrice = unitPrice * item.quantityGram;

            total += item.totalPrice;
            totalCost += unitCost * item.quantityGram;

            // Remove stock
            await new stockModel({
                itemId: item.itemId,
                addGram: 0,
                removeGram: item.quantityGram,
                totalGramItem: currentStock.totalGramItem - item.quantityGram,
                date,
                time
            }).save();
        }

        // Calculate GST
        const cgst = total * 0.09;
        const sgst = total * 0.09;
        total += cgst + sgst;

        // Calculate profit
        const profit = total - totalCost;

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber();

        const sale = new saleModel({
            items,
            paymentMode,
            customerName,
            mobile,
            userId,
            date,
            time,
            cgst,
            sgst,
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