const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const { checkInService, checkOutService, getAllAttendancesService } = require('../services/attendance.service');

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

const getAllAttendance = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);
  const { date, status, employeeId } = req.query;
  const result = await getAllAttendancesService({ page, limit, skip, search }, { date, status, employeeId });

  res.status(200).json({
    message: 'Get all attendance successfully',
    ...result,
  });
});

module.exports = { checkIn, checkOut, getAllAttendance };
