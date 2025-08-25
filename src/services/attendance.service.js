const AttendanceStatus = require('../enums/attendanceStatus');
const AttendanceModel = require('../models/attendanceModel');
const EmployeeModel = require('../models/employeeModel');
const { formatInTimeZone } = require('date-fns-tz');

const timeZone = 'Asia/Ho_Chi_Minh';

const checkInService = async (checkInData) => {
  const { employeeId } = checkInData;

  const employee = await EmployeeModel.findById(employeeId);

  if (!employee) {
    const err = new Error('Employee not found in system');
    err.statusCode = 404;
    throw err;
  }

  //Ngày giờ thời gian hiện tại hôm nay
  const today = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss');

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

  // Set trạng thái check-in trong ngày giờ làm việc bắt đầu luôn trước 8:00 PM sáng
  const now = new Date(today);
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

  //Ngày giờ thời gian hiện tại hôm nay
  const today = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss');

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

  const now = new Date(today);

  attendance.checkOut = now;

  // Tính working hour
  const diffMs = attendance.checkOut - attendance.checkIn;
  const diffHours = diffMs / (1000 * 60 * 60);
  const workingHour = Math.round(diffHours * 100) / 100;

  attendance.workingHour = workingHour;

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
    const dateNow = formatInTimeZone(new Date(date), timeZone, 'yyyy-MM-dd HH:mm:ss');
    const startOfDay = new Date(dateNow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateNow);
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
      .populate('employeeId', 'firstname lastname employeeCode designation type avatarUrl'),
  ]);

  const data = attendances.map((item) => ({
    attendance: {
      id: item.id,
      date: item.date,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      status: item.status,
      workingHour: item.workingHour,
    },
    employee: {
      id: item.employeeId.id,
      employeeCode: item.employeeId.employeeCode,
      firstname: item.employeeId.firstname,
      lastname: item.employeeId.lastname,
      designation: item.employeeId.designation,
      type: item.employeeId.type,
      avatarUrl: item.employeeId.avatarUrl,
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
