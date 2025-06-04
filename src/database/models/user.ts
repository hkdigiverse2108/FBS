import mongoose, { Schema, Document } from 'mongoose';
import { ROLES } from '../../common';

export interface User extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: number;
  password: string;
  role: 'super_admin' | 'admin' | 'salesman';
  storeId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: Number },
  password: { type: String },
  role: { type: String, enum: Object.values(ROLES) },
  storeId: { type: Schema.Types.ObjectId, ref: 'store' },
  access: { type: Array, default: [] },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

export const userModel = mongoose.model<User>('user', UserSchema);