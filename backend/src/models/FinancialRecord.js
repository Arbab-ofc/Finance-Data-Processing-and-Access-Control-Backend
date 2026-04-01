import mongoose from 'mongoose';

import { RECORD_TYPE_VALUES, RECORD_CATEGORIES } from '../constants/finance.js';

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      required: true,
      enum: RECORD_TYPE_VALUES,
    },
    category: {
      type: String,
      required: true,
      enum: RECORD_CATEGORIES,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);
