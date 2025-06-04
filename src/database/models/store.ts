import mongoose, { Schema, Document } from 'mongoose';
import { STORE_PLATFORM_CHARGE_TYPE } from '../../common';

export interface Store extends Document {
    name: string;
    address: string;
    gstNumber: string;
    platformCharge: {
        type: 'percentage' | 'fixed';
        value: number;
    };
    logo: string;
    isDeleted: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StoreSchema: Schema = new Schema({
    name: { type: String },
    address: { type: String },
    gstNumber: { type: String },
    platformCharge: {
        type: { type: String, enum: Object.values(STORE_PLATFORM_CHARGE_TYPE), default: STORE_PLATFORM_CHARGE_TYPE.PERCENTAGE },
        value: { type: Number, default: 0 }
    },
    logo: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

export const storeModel = mongoose.model<Store>('store', StoreSchema); 