import mongoose, { Schema, Document } from 'mongoose';

export interface Stock extends Document {
  itemId: mongoose.Types.ObjectId;
  addGram: number;
  removeGram: number;
  totalGramItem: number;
  date: Date;
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema: Schema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  addGram: { type: Number, default: 0 },
  removeGram: { type: Number, default: 0 },
  totalGramItem: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
}, { timestamps: true });

export const stockModel = mongoose.model<Stock>('stock', StockSchema); 