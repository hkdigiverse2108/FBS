import mongoose, { Schema, Document } from 'mongoose';
import { PRICING_TYPE } from '../../common';

export interface IItem extends Document {
  name: string;
  pricingType: 'weight' | 'fixed';
  perKgPrice: number;
  perKgCost: number;
  perBottlePrice: number;
  perBottleCost: number;
  photo: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  pricingType: { type: String, enum: Object.values(PRICING_TYPE), required: true },
  perKgPrice: { type: Number },
  perKgCost: { type: Number },
  perKgPricePerGram: { type: Number },
  perKgCostPerGram: { type: Number },
  perItemPrice: { type: Number },
  perItemCost: { type: Number },
  photo: { type: String },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'store', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

export const itemModel = mongoose.model<IItem>('item', ItemSchema); 