const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const {
  checkInService,
  checkOutService,
  getAllAttendancesService,
  deleteAttendanceInMonthService,
  updateAttendanceRangeDaysService,
  generateAttendanceManualForMonthService,
} = require('../services/attendance.service');

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

const generateAttendanceManualForMonth = asyncHandle(async (req, res) => {
  const { year, month } = req.body;
  const result = await generateAttendanceManualForMonthService(year, month);

  res.status(200).json({
    message: 'Generated attendance schedule today is successfully',
    ...result,
  });
});

const deleteAttendanceInMonth = asyncHandle(async (req, res) => {
  const { year, month } = req.params;
  await deleteAttendanceInMonthService(year, month);

  res.status(200).json({
    message: 'Has deleted all attendances is successfully',
    data: {},
  });
});

const updateAttendance = asyncHandle(async (req, res) => {
  await updateAttendanceRangeDaysService(req.body);

  res.status(200).json({
    message: 'Has updated all attendances status is successfully',
    data: {},
  });
});

module.exports = {
  checkIn,
  checkOut,
  getAllAttendance,
  generateAttendanceManualForMonth,
  deleteAttendanceInMonth,
  updateAttendance,
};
