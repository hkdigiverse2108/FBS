import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "items" },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "stores" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  date: { type: Date },
  openingStock: { type: Number, default: 0 },
  addedStock: { type: Number, default: 0 },
  removedStock: { type: Number, default: 0 },
  closingStock: { type: Number },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

export const stockModel = mongoose.model("stocks", stockSchema);