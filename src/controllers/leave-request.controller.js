const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const {
  createLeaveRequestService,
  approveLeaveRequestService,
  getAllLeaveRequestsService,
  getLeaveRequestDetailService,
  deleteLeaveRequestService,
} = require('../services/leave-request.service');

const createLeaveRequest = asyncHandle(async (req, res) => {
  const result = await createLeaveRequestService(req.body);

  res.status(200).json({
    message: 'Created leave request is successfully',
    ...result,
  });
});

const approveLeaveRequest = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await approveLeaveRequestService(id, req.body);

  res.status(200).json({
    message: 'Updated Approve leave request is successfully',
    ...result,
  });
});

const getAllLeaveRequests = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);
  const { status, employeeId } = req.query;
  const result = await getAllLeaveRequestsService({ page, limit, skip, search }, { status, employeeId });

  res.status(200).json({
    message: 'Get all leave request successfully',
    ...result,
  });
});

const getLeaveRequestDetail = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await getLeaveRequestDetailService(id);

  res.status(200).json({
    message: 'Get leave request detail successfully',
    ...result,
  });
});

const deleteLeaveRequest = asyncHandle(async (req, res) => {
  const { id } = req.params;
  await deleteLeaveRequestService(id);

  res.status(200).json({
    message: 'Delete leave request successfully',
    data: {},
  });
});

module.exports = { createLeaveRequest, approveLeaveRequest, getAllLeaveRequests, getLeaveRequestDetail, deleteLeaveRequest };
