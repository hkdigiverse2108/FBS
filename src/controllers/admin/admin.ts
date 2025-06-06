import { apiResponse } from "../../common";
import { itemModel, saleModel, stockModel } from "../../database";
import { responseMessage } from "../../helper";

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's sales
        const todaySales = await saleModel.find({ date: { $gte: today, $lt: tomorrow } }).lean();

        // Calculate totals
        const stats = {
            totalGramsUsed: 0,
            totalCollection: {
                cash: 0,
                online: 0,
                total: 0
            },
            totalCost: 0,
            profit: {
                total: 0,
                perKg: 0
            },
            remainingStockValue: 0,
            gstCollected: {
                cgst: 0,
                sgst: 0,
                total: 0
            }
        };

        // Calculate sales stats
        todaySales.forEach(sale => {
            // Calculate grams used
            sale.items.forEach(item => {
                stats.totalGramsUsed += item.quantityGram;
            });

            // Calculate collection
            if (sale.paymentMode === 'cash') {
                stats.totalCollection.cash += sale.total;
            } else {
                stats.totalCollection.online += sale.total;
            }
            stats.totalCollection.total += sale.total;

            // Calculate costs and profit
            stats.totalCost += sale.totalCost;
            stats.profit.total += sale.profit;

            // Calculate GST
            stats.gstCollected.cgst += sale.cgst;
            stats.gstCollected.sgst += sale.sgst;
            stats.gstCollected.total += sale.cgst + sale.sgst;
        });

        // Calculate profit per kg
        if (stats.totalGramsUsed > 0) {
            stats.profit.perKg = (stats.profit.total / stats.totalGramsUsed) * 1000;
        }

        // Calculate remaining stock value
        const stocks = await stockModel.aggregate([
            {
                $group: {
                    _id: '$itemId',
                    totalGramItem: { $last: '$totalGramItem' }
                }
            }
        ]);

        for (const stock of stocks) {
            const item = await itemModel.findOne({ _id: stock._id });
            if (item) {
                const stockValue = (stock.totalGramItem / 1000) * item.perKgCost;
                stats.remainingStockValue += stockValue;
            }
        }

        res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("dashboard stats"), stats, {}, {}));
    } catch (error: any) {
        res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error, {}));
    }
};

export const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        let groupStage: any = {
            $group: {
                _id: null,
                totalSales: { $sum: '$total' },
                totalCost: { $sum: '$totalCost' },
                totalProfit: { $sum: '$profit' },
                totalGST: { $sum: { $add: ['$cgst', '$sgst'] } },
                totalGrams: { $sum: { $sum: '$items.quantityGram' } },
                sales: { $push: '$$ROOT' }
            }
        };

        if (groupBy === 'date') {
            groupStage.$group._id = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        } else if (groupBy === 'month') {
            groupStage.$group._id = { $dateToString: { format: '%Y-%m', date: '$date' } };
        } else if (groupBy === 'year') {
            groupStage.$group._id = { $dateToString: { format: '%Y', date: '$date' } };
        }

        const report = await saleModel.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            groupStage,
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({ success: true, data: report });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const z = 0;