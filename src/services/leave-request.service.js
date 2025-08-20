const LeaveRequestStatus = require('../enums/leaveRequestStatus');
const EmployeeModel = require('../models/employeeModel');
const LeaveRequestModel = require('../models/leaveRequestModel');
const { getCurrentTime } = require('../utils/timeZone');

const createLeaveRequestService = async (leaveRequestData) => {
  const { employeeId, startDate, endDate } = leaveRequestData;

  const employee = await EmployeeModel.findById(employeeId);
  if (!employee) {
    const err = new Error('Employee not found in system');
    err.statusCode = 404;
    throw err;
  }

  const today = getCurrentTime();
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
    status: { $ne: LeaveRequestStatus.REJECTED }, // đơn phải được reject
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
  };

  return { data };
};

module.exports = { createLeaveRequestService };
