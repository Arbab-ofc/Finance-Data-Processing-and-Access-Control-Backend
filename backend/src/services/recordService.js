import { FinancialRecord } from '../models/FinancialRecord.js';
import { ApiError } from '../utils/apiError.js';
import { buildPagination } from '../utils/pagination.js';

const buildRecordFilters = (query) => {
  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};

    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      filter.date.$lte = new Date(query.endDate);
    }
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};

    if (query.minAmount) {
      filter.amount.$gte = Number(query.minAmount);
    }

    if (query.maxAmount) {
      filter.amount.$lte = Number(query.maxAmount);
    }
  }

  return filter;
};

export const createRecord = async (payload, actorId) => {
  const record = await FinancialRecord.create({
    ...payload,
    createdBy: actorId,
    updatedBy: actorId,
  });

  return record;
};

export const listRecords = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = buildRecordFilters(query);
  const sortBy = query.sortBy || 'date';
  const order = query.order === 'asc' ? 1 : -1;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    data: records,
    meta: buildPagination({ page, limit, total }),
  };
};

export const getRecordById = async (recordId) => {
  const record = await FinancialRecord.findById(recordId)
    .populate('createdBy', 'name email role')
    .populate('updatedBy', 'name email role');

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  return record;
};

export const updateRecord = async (recordId, payload, actorId) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    recordId,
    {
      ...payload,
      updatedBy: actorId,
    },
    { returnDocument: 'after', runValidators: true },
  )
    .populate('createdBy', 'name email role')
    .populate('updatedBy', 'name email role');

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  return record;
};

export const deleteRecord = async (recordId) => {
  const record = await FinancialRecord.findByIdAndDelete(recordId);

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  return { id: record._id.toString() };
};
