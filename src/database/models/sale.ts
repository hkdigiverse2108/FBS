import mongoose, { Schema, Document } from 'mongoose';

interface ISaleItem {
  itemId: mongoose.Types.ObjectId;
  itemName: string;
  quantityGram: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISale extends Document {
  items: ISaleItem[];
  paymentMode: 'cash' | 'online';
  customerName: string;
  mobile: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  cgst: number;
  sgst: number;
  total: number;
  totalCost: number;
  profit: number;
  platformCharge: number;
  profitAmount: number;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema({
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'item', required: true },
    itemName: { type: String, required: true },
    quantityGram: { type: Number, required: true },
    quantity: { type: Number },
    unitPrice: { type: Number },
    totalPrice: { type: Number }
  }],
  paymentMode: { type: String, enum: ['cash', 'online'] },
  customerName: { type: String },
  mobile: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  storeId: { type: Schema.Types.ObjectId, ref: 'store' },
  date: { type: Date, default: new Date() },
  total: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  platformCharge: { type: Number, default: 0 },
  invoiceNumber: { type: String, unique: true }
}, { timestamps: true });

export const saleModel = mongoose.model<ISale>('sale', SaleSchema); 