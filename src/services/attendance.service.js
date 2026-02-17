const AttendanceStatus = require('../enums/attendanceStatus');
const AttendanceModel = require('../models/attendanceModel');
const EmployeeModel = require('../models/employeeModel');
const LeaveRequestModel = require('../models/leaveRequestModel');
const { formatInTimeZone } = require('date-fns-tz');
const { getIO } = require('../configs/socket');
const EmployeeStatus = require('../enums/employeeStatus');
const LeaveRequestStatus = require('../enums/leaveRequestStatus');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { cosineSimilarity } = require('../utils/cosinSimilarity');
const FaceProfileModel = require('../models/faceProfileModel');

const timeZone = 'Asia/Ho_Chi_Minh';
const BASE_URL = process.env.EXACT_FACE_ID_PORT;

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
    const err = new Error('Check-in chưa được khởi tạo hôm nay, thử lại sau!');
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

  // Gửi socket checkin
  const io = getIO();
  io.emit('attendance:update', {
    type: 'Check-in',
    employeeCode: employee.employeeCode,
    fullname: `${employee.lastname} ${employee.firstname}`,
    checkIn: attendance.checkIn,
    status: attendance.status,
  });

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
    const err = new Error('Chưa có dữ liệu Check-in hoặc Check-out được tạo');
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

  // Gửi socket checkout
  const io = getIO();
  io.emit('attendance:update', {
    type: 'Check-out',
    employeeCode: employee.employeeCode,
    fullname: `${employee.lastname} ${employee.firstname}`,
    checkOut: attendance.checkOut,
    workingHour: attendance.workingHour,
  });

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
    query.date = new Date(date);
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
    createdAt: item.createdAt,
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

const generateAttendanceManualForMonthService = async (year, month) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    const err = new Error('Không được phép tạo lịch cho năm đã qua');
    err.statusCode = 400;
    throw err;
  }

  if (year === currentYear && month < currentMonth) {
    const err = new Error('Không được phép tạo lịch cho tháng đã qua');
    err.statusCode = 400;
    throw err;
  }

  // ============= HỢP LỆ THÁNG NĂM TƯƠNG LAI =============
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  const employees = await EmployeeModel.find({
    status: { $ne: EmployeeStatus.TERMINATED },
  });

  const leaveRequests = await LeaveRequestModel.find({
    status: LeaveRequestStatus.APPROVED,
    startDate: { $lte: endOfMonth }, // Tránh overlap khi qua tháng mới => bao quát tháng
    endDate: { $gte: startOfMonth },
  });

  const attendanceList = [];

  // Duyệt qua từng ngày trong tháng
  for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay(); // 0: CN, 6: T7
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // bỏ thứ 7, CN

    const startOfDay = new Date(d);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    // Check nếu đã tạo attendance cho ngày này chưa
    const existAttendance = await AttendanceModel.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (existAttendance) continue;

    employees.forEach((emp) => {
      // Mặc định Absent
      let status = AttendanceStatus.ABSENT;

      const hasLeave = leaveRequests.some(
        (lr) => lr.employeeId.toString() === emp._id.toString() && lr.startDate <= endOfDay && lr.endDate >= startOfDay,
      );

      if (hasLeave) {
        status = AttendanceStatus.ONLEAVE;
      }

      attendanceList.push({
        employeeId: emp._id,
        date: startOfDay,
        status,
      });
    });
  }

  if (attendanceList.length === 0) {
    const err = new Error('Lịch điểm danh đã được tạo trong tháng này');
    err.statusCode = 400;
    throw err;
  }

  const attendanceSchedules = await AttendanceModel.insertMany(attendanceList);

  const data = attendanceSchedules.map((item) => ({
    employeeId: item.employeeId,
    date: item.date,
    status: item.status,
    createdAt: item.createdAt,
  }));

  return { data };
};

const deleteAttendanceInMonthService = async (year, month) => {
  const startOfMonth = new Date(year, month - 1, 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(year, month, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const result = await AttendanceModel.deleteMany({
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  if (result.deletedCount === 0) {
    const err = new Error(`Không tìm thấy bản ghi nào trong ${month}/${year}`);
    err.statusCode = 404;
    throw err;
  }
};

const updateAttendanceRangeDaysService = async (updateData) => {
  const { fromDate, toDate, status, employeeId } = updateData;

  const isFromDate = new Date(fromDate);
  isFromDate.setHours(0, 0, 0, 0);

  const isEndDate = new Date(toDate);
  isEndDate.setHours(23, 59, 59, 999);

  const query = { date: { $gte: isFromDate, $lte: isEndDate } };

  if (employeeId) {
    query.employeeId = employeeId;
  }

  const result = await AttendanceModel.updateMany(query, { $set: { status } });

  if (result.deletedCount === 0) {
    const err = new Error(`Không tìm thấy bản ghi nào trong ${fromDate} - ${toDate}`);
    err.statusCode = 404;
    throw err;
  }
};

const checkInByFaceService = async (employeeId, imagePath) => {
  try {
    // ----------------LOGIC EXACT FACE--------------------
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    const aiRes = await axios.post(`${BASE_URL}/api/v1/extract-face-ID`, form, {
      headers: form.getHeaders(),
    });

    const inputEmbedding = aiRes.data.embedding;

    // Tìm khuôn mặt với ID này
    const profile = await FaceProfileModel.findOne({ employeeId });

    if (!profile) {
      const err = new Error('Bạn chưa đăng ký khuôn mặt');
      err.statusCode = 400;
      throw err;
    }

    // Hàm so sánh tọa độ vector khuôn mặt
    const score = cosineSimilarity(inputEmbedding, profile.embedding);

    if (score < 0.7) {
      const err = new Error('Khuôn mặt không khớp');
      err.statusCode = 401;
      throw err;
    }

    // -------------LOGIC CHECKIN---------------------
    const employee = await EmployeeModel.findById(employeeId);

    //Ngày giờ thời gian hiện tại hôm nay
    const today = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss');

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await AttendanceModel.findOne({
      employeeId: employee._id.toString(),
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      const err = new Error('Check-in chưa được khởi tạo hôm nay, thử lại sau!');
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

    // Gửi socket checkin
    const io = getIO();
    io.emit('attendance:update', {
      type: 'Check-in',
      employeeCode: employee.employeeCode,
      fullname: `${employee.lastname} ${employee.firstname}`,
      checkIn: attendance.checkIn,
      status: attendance.status,
    });

    const data = {
      employee: {
        employeeCode: employee.employeeCode,
        fullname: `${employee.last} ${employee.firstname}`,
      },
      confidence: score,
    };

    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      const e = new Error(err.response.data?.detail || 'Ảnh không hợp lệ');
      e.statusCode = 400;
      throw e;
    }
    throw err;
  }
};

module.exports = {
  checkInService,
  checkOutService,
  checkInByFaceService,
  getAllAttendancesService,
  generateAttendanceManualForMonthService,
  deleteAttendanceInMonthService,
  updateAttendanceRangeDaysService,
};
