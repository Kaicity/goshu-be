const AttendanceStatus = require('../enums/attendanceStatus');
const AttendanceModel = require('../models/attendanceModel');
const EmployeeModel = require('../models/employeeModel');

const checkInService = async (checkInData) => {
  const { employeeId } = checkInData;

  const employee = await EmployeeModel.findById(employeeId);

  if (!employee) {
    const err = new Error('Employee not found in system');
    err.statusCode = 404;
    throw err;
  }

  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let attendance = await AttendanceModel.findOne({
    employeeId: employeeId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (!attendance) {
    const err = new Error('Bản ghi điểm danh chưa được khởi tạo cho ngày hôm nay');
    err.statusCode = 500;
    throw err;
  }

  // Một ngày chỉ được phép check-in 1 lần
  if (attendance.checkIn) {
    const err = new Error('Bạn đã check-in hôm nay');
    err.statusCode = 409;
    throw err;
  }

  // Set trạng thái check-in trong ngày
  const now = new Date();
  const workStart = new Date(today);
  workStart.setHours(8, 0, 0, 0);

  let status = AttendanceStatus.PRESENT;
  if (now > workStart) {
    status = AttendanceStatus.LATE;
  }

  attendance.checkIn = now;
  attendance.status = status;
  attendance.updatedAt = new Date();
  await attendance.save();

  const data = {
    employeeId: attendance.employeeId,
    checkIn: attendance.checkIn,
  };

  return { data };
};

const checkOutService = async (checkOutData) => {
  const { employeeId } = checkOutData;

  const employee = await EmployeeModel.findById(employeeId);

  if (!employee) {
    const err = new Error('Employee not found in system');
    err.statusCode = 404;
    throw err;
  }

  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let attendance = await AttendanceModel.findOne({
    employeeId: employeeId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (!attendance) {
    const err = new Error('Bản ghi điểm danh chưa được khởi tạo cho ngày hôm nay');
    err.statusCode = 500;
    throw err;
  }

  if (!attendance.checkIn) {
    const err = new Error('Cannot check-out without check-in');
    err.statusCode = 400;
    throw err;
  }

  if (attendance.checkOut) {
    const err = new Error('Bạn đã check-out hôm nay');
    err.statusCode = 409;
    throw err;
  }

  attendance.checkOut = new Date();
  await attendance.save();

  const data = {
    employeeId: attendance.employeeId,
    checkOut: attendance.checkOut,
  };

  return { data };
};

const getAllAttendancesService = async ({ page, limit, skip, search }, { date, status, employeeId }) => {
  const query = {};

  // Search query đến bảng employee vì trong bảng này không chưa fullname, employeeCode
  if (search) {
    const employees = await EmployeeModel.find({
      $or: [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    query.employeeId = { $in: employees.map((e) => e._id) }; // mapping id employee query
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  if (status) query.status = status;
  if (employeeId) query.employeeId = employeeId;

  const [total, attendances] = await Promise.all([
    AttendanceModel.countDocuments(query),
    AttendanceModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'firstname lastname employeeCode'),
  ]);

  const data = attendances.map((item) => ({
    attendance: {
      id: item.id,
      date: item.date,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      status: item.status,
    },
    employee: {
      id: item.employeeId.id,
      employeeCode: item.employeeId.employeeCode,
      firstname: item.employeeId.firstname,
      lastname: item.employeeId.lastname,
    },
    updatedAt: item.updatedAt,
  }));

  return {
    data,
    pagination: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
};

module.exports = { checkInService, checkOutService, getAllAttendancesService };
