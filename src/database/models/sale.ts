import mongoose, { Schema, Document } from 'mongoose';

interface ISaleItem {
  itemId: mongoose.Types.ObjectId;
  quantityGram: number;
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
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema({
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantityGram: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  paymentMode: { type: String, enum: ['cash', 'online'] },
  customerName: { type: String },
  mobile: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: new Date() },
  time: { type: String, default: new Date().toLocaleTimeString() },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  invoiceNumber: { type: String, unique: true }
}, { timestamps: true });

export const saleModel = mongoose.model<ISale>('sale', SaleSchema); 