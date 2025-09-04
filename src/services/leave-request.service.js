const { isValidObjectId } = require('mongoose');
const LeaveRequestStatus = require('../enums/leaveRequestStatus');
const EmployeeModel = require('../models/employeeModel');
const LeaveRequestModel = require('../models/leaveRequestModel');
const { updateAttendanceRangeDaysService } = require('./attendance.service');
const AttendanceStatus = require('../enums/attendanceStatus');

const createLeaveRequestService = async (leaveRequestData) => {
  const { employeeId, startDate, endDate } = leaveRequestData;

  const employee = await EmployeeModel.findById(employeeId);
  if (!employee) {
    const err = new Error('Employee not found in system');
    err.statusCode = 404;
    throw err;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  const end = new Date(endDate);

  // startDate phải sau hôm nay
  if (start <= today) {
    const err = new Error('Ngày bắt đầu phải sau ngày hiện tại ít nhất 1 ngày');
    err.statusCode = 400;
    throw err;
  }

  // endDate thì tương tự phải sau startDate
  if (end < start) {
    const err = new Error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu');
    err.statusCode = 400;
    throw err;
  }

  /**
   * Logic nghiệp vụ: 1 năm chỉ cho phép nghỉ tối đa 12 ngày/năm, không cần biết tạo bao nhiêu đơn
   * Lấy số đơn nghỉ đã được duyệt trong năm
   * Công thức tính số ngày : (startDate - endDate / 1000ms * 60mi * 60s * 24h) + 1) (+ 1 vì tính luôn ngày bắt đầu xin nghỉ)
   */

  // Tính số ngày nghỉ
  const leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (leaveDays <= 0) {
    const err = new Error('Số ngày nghỉ không hợp lệ');
    err.statusCode = 400;
    throw err;
  }

  // Truy vấn tổng số ngày nghỉ trong năm
  const year = start.getFullYear();
  const leaveRequests = await LeaveRequestModel.find({
    employeeId,
    startDate: {
      $gte: new Date(year, 0, 1), // từ 01/01
      $lte: new Date(year, 11, 31), // đến 31/12
    },
    status: { $ne: LeaveRequestStatus.REJECTED }, // loại bỏ những đơn bị reject
  });

  const usedDays = leaveRequests.reduce((total, req) => {
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    return total + (Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
  }, 0);

  // Ngày phép tối đa
  if (leaveDays + usedDays > 12) {
    const err = new Error('Bạn đã vượt quá số ngày phép (12 ngày/năm)');
    err.statusCode = 400;
    throw err;
  }

  const leaveRequest = new LeaveRequestModel({
    ...leaveRequestData,
  });

  await leaveRequest.save();

  const data = {
    employeeId: leaveRequest.employeeId,
    startDate: leaveRequest.startDate,
    endDate: leaveRequest.endDate,
    reason: leaveRequest.reason,
    status: leaveRequest.status,
    note: leaveRequest.note,
    createdAt: leaveRequest.createdAt,
  };

  return { data };
};

const approveLeaveRequestService = async (id, leaveRequestData) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid leave request ID format');
    err.statusCode = 400;
    throw err;
  }

  const leaveRequestUpdated = await LeaveRequestModel.findByIdAndUpdate(id, leaveRequestData, { new: true });
  if (!leaveRequestUpdated) {
    const err = new Error('Leave request not found');
    err.statusCode = 404;
    throw err;
  }

  // Update attendance cho ngày đó
  const updateData = {
    fromDate: leaveRequestUpdated.startDate,
    toDate: leaveRequestUpdated.endDate,
    status: AttendanceStatus.ONLEAVE,
    employeeId: leaveRequestUpdated.employeeId,
  };

  await updateAttendanceRangeDaysService(updateData);

  const data = {
    employeeId: leaveRequestUpdated.employeeId,
    startDate: leaveRequestUpdated.startDate,
    endDate: leaveRequestUpdated.endDate,
    reason: leaveRequestUpdated.reason,
    status: leaveRequestUpdated.status,
    note: leaveRequestUpdated.note,
  };

  return { data };
};

const getAllLeaveRequestsService = async ({ page, limit, skip, search }, { status, employeeId }) => {
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

  if (status) query.status = status;
  if (employeeId) query.employeeId = employeeId;

  const [total, leaveRequests] = await Promise.all([
    LeaveRequestModel.countDocuments(query),
    LeaveRequestModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'firstname lastname employeeCode avatarUrl'),
  ]);

  const data = leaveRequests.map((item) => ({
    leaveRequest: {
      id: item.id,
      startDate: item.startDate,
      endDate: item.endDate,
      reason: item.reason,
      status: item.status,
      note: item.note,
    },
    employee: {
      id: item.employeeId.id,
      employeeCode: item.employeeId.employeeCode,
      firstname: item.employeeId.firstname,
      lastname: item.employeeId.lastname,
      avatarUrl: item.employeeId.avatarUrl,
    },
    updatedAt: item.updatedAt,
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

const getLeaveRequestDetailService = async (id) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid leave request ID format');
    err.statusCode = 400;
    throw err;
  }

  const leaveRequest = await LeaveRequestModel.findById(id);
  const employee = await EmployeeModel.findById(leaveRequest.employeeId);

  const data = {
    leaveRequest: {
      id: leaveRequest.id,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reason: leaveRequest.status,
      note: leaveRequest.note,
    },
    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstname: employee.firstname,
      lastname: employee.lastname,
      avatarUrl: employee.avatarUrl,
    },
    updatedAt: leaveRequest.updatedAt,
  };

  return { data };
};

const deleteLeaveRequestService = async (id) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid leave request ID format');
    err.statusCode = 400;
    throw err;
  }

  const leaveRequest = await LeaveRequestModel.findById(id);

  if (leaveRequest.status === LeaveRequestStatus.PENDING) {
    await LeaveRequestModel.findByIdAndDelete(id);
  } else {
    const err = new Error('Đơn xin nghỉ chỉ được xóa khi ở trạng thái chưa được duyệt');
    err.statusCode = 403;
    throw err;
  }
};

module.exports = {
  createLeaveRequestService,
  approveLeaveRequestService,
  getAllLeaveRequestsService,
  getLeaveRequestDetailService,
  deleteLeaveRequestService,
};
