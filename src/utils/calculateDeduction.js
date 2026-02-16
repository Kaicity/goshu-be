const AttendanceModel = require('../models/attendanceModel');
const AttendanceStatus = require('../enums/attendanceStatus');

/**
 * Tính deductions dựa trên Attendance
 * Quy định:
 * - 3 lần đi trễ = 1 ngày lương
 * - 1 lần vắng = 1 ngày lương
 * @param {string} employeeId - ID của nhân viên
 * @param {number} month - Tháng (1-12)
 * @param {number} year - Năm
 * @param {number} basicSalary - Lương cơ bản của nhân viên
 * @returns {string} Tổng số tiền khấu trừ, làm tròn đến 2 chữ số thập phân
 */
const calculateDeductions = async (employeeId, month, year, basicSalary) => {
  // Tạo ngày đầu và cuối tháng
  const firstDay = new Date(year, month - 1, 1);
  firstDay.setHours(0, 0, 0, 0);
  const lastDay = new Date(year, month, 0);
  lastDay.setHours(23, 59, 59, 999);

  // Lấy danh sách chấm công trong tháng
  const attendances = await AttendanceModel.find({
    employeeId,
    date: { $gte: firstDay, $lte: lastDay },
  });

  // Đếm số lần đi trễ và vắng
  let lateCount = 0;
  let absentCount = 0;

  attendances.forEach((att) => {
    if (att.status === AttendanceStatus.LATE) lateCount++;
    if (att.status === AttendanceStatus.ABSENT) absentCount++;
  });

  // Số ngày làm việc trong tháng (mặc định 22, không tính T7 CN)
  const workingDays = process.env.WORKING_DAY || 22;
  // Lương ngày
  const dailySalary = basicSalary / workingDays;

  // Khấu trừ do đi trễ: mỗi 3 lần trễ = 1 ngày lương
  const deductionLate = Math.floor(lateCount / 3) * dailySalary;

  // Khấu trừ do vắng: mỗi lần vắng = 1 ngày lương
  const deductionAbsent = absentCount * dailySalary;

  // Trả về tổng khấu trừ, làm tròn đến 2 chữ số thập phân
  return Number(deductionLate + deductionAbsent).toFixed(2);
};

module.exports = calculateDeductions;
