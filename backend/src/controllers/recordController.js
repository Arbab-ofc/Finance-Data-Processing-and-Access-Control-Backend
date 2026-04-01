import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createRecord,
  deleteRecord,
  getRecordById,
  listRecords,
  updateRecord,
} from '../services/recordService.js';

export const createRecordController = asyncHandler(async (req, res) => {
  const record = await createRecord(req.body, req.user.id);
  return sendSuccess(res, 'Record created successfully', record, 201);
});

export const listRecordsController = asyncHandler(async (req, res) => {
  const { data, meta } = await listRecords(req.query);
  return sendSuccess(res, 'Records fetched successfully', data, 200, meta);
});

export const getRecordController = asyncHandler(async (req, res) => {
  const record = await getRecordById(req.params.id);
  return sendSuccess(res, 'Record fetched successfully', record);
});

export const updateRecordController = asyncHandler(async (req, res) => {
  const record = await updateRecord(req.params.id, req.body, req.user.id);
  return sendSuccess(res, 'Record updated successfully', record);
});

export const deleteRecordController = asyncHandler(async (req, res) => {
  const info = await deleteRecord(req.params.id);
  return sendSuccess(res, 'Record deleted successfully', info);
});
