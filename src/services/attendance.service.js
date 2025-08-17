const AttendanceStatus = require('../enums/attendanceStatus');
const AttendanceModel = require('../models/attendanceModel');
const { getCurrentTime } = require('../utils/timeZone');

const checkInService = async (checkInData) => {
  const { employeeId } = checkInData;

  const today = getCurrentTime();

  //Ngày giờ bắt đầu 0:00:00:000
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  //Ngày giờ sẽ kết thúc ở 23:59:59:999
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let attendance = await AttendanceModel.findOne({
    employeeId: employeeId,
    date: { $gte: startOfDay, $lte: endOfDay }, // Chỉ lấy thời gian trong khoảng bắt đầu và kết thúc
  });

  // Một ngày chỉ được phép check-in 1 lần
  if (attendance) {
    const err = new Error('Bạn đã check-in hôm nay');
    err.statusCode = 409;
    throw err;
  }

  // Set trạng thái check-in trong ngày
  const now = getCurrentTime();
  const workStart = new Date(today);
  workStart.setHours(8, 0, 0, 0);

  let status = AttendanceStatus.PRESENT;
  if (now > workStart) {
    status = AttendanceStatus.LATE;
  }

  attendance = new AttendanceModel({
    employeeId,
    date: now,
    checkIn: now,
    status: status,
  });

  await attendance.save();

  const data = {
    employeeId: attendance.employeeId,
    checkIn: attendance.checkIn,
  };

  return { data };
};

const checkOutService = async (checkOutData) => {
  const { employeeId } = checkOutData;

  const today = getCurrentTime();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let attendance = await AttendanceModel.findOne({
    employeeId: employeeId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (!attendance) {
    const err = new Error('No check-in record found');
    err.statusCode = 400;
    throw err;
  }

  attendance.checkOut = getCurrentTime();
  await attendance.save();

  const data = {
    employeeId: attendance.employeeId,
    checkOut: attendance.checkOut,
  };

  return { data };
};

module.exports = { checkInService, checkOutService };
