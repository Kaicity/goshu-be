const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const { checkInService, checkOutService } = require('../services/attendance.service');

const checkIn = asyncHandle(async (req, res) => {
  const result = await checkInService(req.body);

  res.status(200).json({
    message: 'Already checked in today',
    ...result,
  });
});

const checkOut = asyncHandle(async (req, res) => {
  const result = await checkOutService(req.body);

  res.status(200).json({
    message: 'Already checked out today',
    ...result,
  });
});

module.exports = { checkIn, checkOut };
