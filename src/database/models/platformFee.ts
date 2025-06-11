import mongoose from "mongoose";

const platformFeeSchema = new mongoose.Schema({
    date: { type: Date },
    amount: { type: Number },
    status: { type: String, enum: ["PAID", "DUE"], default: "DUE" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const platformFeeModel = mongoose.model("platform-fee", platformFeeSchema); 