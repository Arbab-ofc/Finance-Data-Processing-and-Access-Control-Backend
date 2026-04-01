import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getSummary,
} from '../services/dashboardService.js';

export const summaryController = asyncHandler(async (req, res) => {
  const data = await getSummary();
  return sendSuccess(res, 'Dashboard summary fetched successfully', data);
});

export const categoryBreakdownController = asyncHandler(async (req, res) => {
  const data = await getCategoryBreakdown();
  return sendSuccess(res, 'Category breakdown fetched successfully', data);
});

export const trendsController = asyncHandler(async (req, res) => {
  const data = await getMonthlyTrends(req.query);
  return sendSuccess(res, 'Trends fetched successfully', data);
});

export const recentActivityController = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const data = await getRecentActivity(limit);
  return sendSuccess(res, 'Recent activity fetched successfully', data);
});
