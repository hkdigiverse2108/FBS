import mongoose, { Schema, Document } from 'mongoose';
import { ROLES } from '../../common';

export interface Salesman extends Document {
    name: string;
    phoneNumber: number;
    password: string;
    role: 'super_admin';
    storeId?: mongoose.Types.ObjectId;
    isDeleted: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SalesmanSchema: Schema = new Schema({
    name: { type: String },
    phoneNumber: { type: Number },
    password: { type: String },
    loginId: { type: String },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.SALESMAN },
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
    access: { type: Array, default: [] },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

export const salesmanModel = mongoose.model<Salesman>('salesman', SalesmanSchema);