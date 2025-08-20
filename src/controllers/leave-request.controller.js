const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const { createLeaveRequestService } = require('../services/leave-request.service');

const createLeaveRequest = asyncHandle(async (req, res) => {
  const result = await createLeaveRequestService(req.body);

  res.status(200).json({
    message: 'Created leave request is successfully',
    ...result,
  });
});

module.exports = { createLeaveRequest };
