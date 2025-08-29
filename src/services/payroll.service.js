const PayrollModel = require('../models/payrollModel');
const EmployeeModel = require('../models/employeeModel');
const AttendanceModel = require('../models/attendanceModel');
const AttendanceStatus = require('../enums/attendanceStatus');

/**
 * Tính deductions dựa trên Attendance
 * Quy định:
 * - 3 lần đi trễ = 1 ngày lương
 * - 1 lần vắng = 1 ngày lương
 */
const calculateDeductions = async (employeeId, month, year, basicSalary) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const attendances = await AttendanceModel.find({
    employeeId,
    date: { $gte: firstDay, $lte: lastDay },
  });

  let lateCount = 0;
  let absentCount = 0;

  attendances.forEach((att) => {
    if (att.status === AttendanceStatus.LATE) lateCount++;
    if (att.status === AttendanceStatus.ABSENT) absentCount++;
  });

  const workingDays = 22; //Ngày công không tính T7, CN
  const dailySalary = basicSalary / workingDays;

  const deductionLate = Math.floor(lateCount / 3) * dailySalary;

  const deductionAbsent = absentCount * dailySalary;

  return deductionLate + deductionAbsent;
};

const createPayrollService = async (createData) => {
  const { employeeId, month, year, basicSalary, allowance = 0, overtime = 0, deductions = 0 } = createData;

  const employee = await EmployeeModel.findById(employeeId);
  if (!employee) {
    const err = new Error('Employee not found in system');
    err.statusCode = 404;
    throw err;
  }

  // Check nhân viên này đc tạo lương tháng này chưa
  const existingPayroll = await PayrollModel.findOne({ employeeId, month, year });
  if (existingPayroll) {
    const err = new Error(`Bảng lương của nhân viên này đã được tạo trong tháng ${month}/${year}`);
    err.statusCode = 400;
    throw err;
  }

  // Check đi trễ bao nhiêu lần, số buổi vắng( trừ lương chứ gì)
  const autoDeductions = await calculateDeductions(employeeId, month, year, basicSalary);

  // tổng deductions = lịch công + nhập tay các khoản trừ khác
  const totalDeductions = autoDeductions + deductions;

  // Lương tổng = lương CB + phụ cấp + OT - (buổi vắng, nghỉ không phép, đi trễ, làm tổn hại vật chất công ty, đồng phục,...)
  const netSalary = Number((basicSalary + allowance + overtime - totalDeductions).toFixed(2));

  const payroll = new PayrollModel({
    employeeId,
    month,
    year,
    basicSalary,
    allowance,
    overtime,
    deductions,
    netSalary,
  });

  await payroll.save();

  const data = {
    employeeId: payroll.employeeId,
    month: payroll.month,
    year: payroll.year,
    basicSalary: payroll.basicSalary,
    allowance: payroll.allowance,
    overtime: payroll.overtime,
    deductions: payroll.deductions,
    netSalary: payroll.netSalary,
    createdAt: payroll.createdAt,
  };
  return { data };
};

module.exports = { createPayrollService };
