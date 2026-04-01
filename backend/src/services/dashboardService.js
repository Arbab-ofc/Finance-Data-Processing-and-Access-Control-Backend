import { FinancialRecord } from '../models/FinancialRecord.js';
import { RECORD_TYPES } from '../constants/finance.js';

export const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const summary = result.reduce(
    (acc, item) => {
      if (item._id === RECORD_TYPES.INCOME) {
        acc.totalIncome = item.total;
      }

      if (item._id === RECORD_TYPES.EXPENSE) {
        acc.totalExpenses = item.total;
      }

      return acc;
    },
    { totalIncome: 0, totalExpenses: 0 },
  );

  return {
    ...summary,
    netBalance: summary.totalIncome - summary.totalExpenses,
  };
};

export const getCategoryBreakdown = async () => FinancialRecord.aggregate([
  {
    $group: {
      _id: { category: '$category', type: '$type' },
      total: { $sum: '$amount' },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      category: '$_id.category',
      type: '$_id.type',
      total: 1,
      count: 1,
    },
  },
  {
    $sort: {
      total: -1,
    },
  },
]);

export const getMonthlyTrends = async ({ startDate, endDate } = {}) => {
  const matchStage = {};

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) {
      matchStage.date.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.date.$lte = new Date(endDate);
    }
  }

  const pipeline = [];
  if (Object.keys(matchStage).length) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
    {
      $sort: {
        year: 1,
        month: 1,
        type: 1,
      },
    },
  );

  return FinancialRecord.aggregate(pipeline);
};

export const getRecentActivity = async (limit = 10) => FinancialRecord.find({})
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('createdBy', 'name email role')
  .populate('updatedBy', 'name email role');
