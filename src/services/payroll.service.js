const PayrollModel = require('../models/payrollModel');
const EmployeeModel = require('../models/employeeModel');
const AttendanceModel = require('../models/attendanceModel');
const AttendanceStatus = require('../enums/attendanceStatus');
const { isValidObjectId } = require('mongoose');
const PayrollStatus = require('../enums/payrollStatus');
const { validateFutureSchedule } = require('../utils/scheduleValidate');
const EmployeeStatus = require('../enums/employeeStatus');

/**
 * Tính deductions dựa trên Attendance
 * Quy định:
 * - 3 lần đi trễ = 1 ngày lương
 * - 1 lần vắng = 1 ngày lương
 */
const calculateDeductions = async (employeeId, month, year, basicSalary) => {
  const firstDay = new Date(year, month - 1, 1);
  firstDay.setHours(0, 0, 0, 0);
  const lastDay = new Date(year, month, 0);
  lastDay.setHours(23, 59, 59, 999);

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

  const workingDays = process.env.WORKING_DAY || 22; //Ngày công không tính T7, CN
  const dailySalary = basicSalary / workingDays;

  const deductionLate = Math.floor(lateCount / 3) * dailySalary;

  const deductionAbsent = absentCount * dailySalary;

  return Number(deductionLate + deductionAbsent).toFixed(2);
};

const createPayrollService = async (createData) => {
  const { employeeId, month, year, basicSalary, allowance = 0, overtime = 0, deductions = 0 } = createData;

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

const getAllPayrollService = async (
  { page, limit, skip, search },
  { month, year, minSalary, maxSalary, status, employeeId },
) => {
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

  if (month) query.month = month;

  if (year) query.year = year;

  if (status) query.status = status;

  if (employeeId) query.employeeId = employeeId;

  if (minSalary || maxSalary) {
    query.netSalary = {};
    if (minSalary) query.netSalary.$gte = minSalary;
    if (maxSalary) query.netSalary.$lte = maxSalary;
  }

  const [total, payrolls] = await Promise.all([
    PayrollModel.countDocuments(query),
    PayrollModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'firstname lastname employeeCode avatarUrl'),
  ]);

  const data = payrolls.map((item) => ({
    payroll: {
      id: item.id,
      month: item.month,
      year: item.year,
      basicSalary: item.basicSalary,
      allowance: item.allowance,
      overtime: item.overtime,
      deductions: item.deductions,
      netSalary: item.netSalary,
      status: item.status,
    },
    employee: {
      id: item.employeeId.id,
      employeeCode: item.employeeId.employeeCode,
      firstname: item.employeeId.firstname,
      lastname: item.employeeId.lastname,
      avatarUrl: item.employeeId.avatarUrl,
    },
    createdAt: item.createdAt,
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

const getPayrollService = async (id) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid payroll ID format');
    err.statusCode = 400;
    throw err;
  }

  const payroll = await PayrollModel.findById(id);

  const data = {
    month: payroll.month,
    year: payroll.year,
    basicSalary: payroll.basicSalary,
    allowance: payroll.allowance,
    overtime: payroll.overtime,
    deductions: payroll.deductions,
    netSalary: payroll.netSalary,
    status: payroll.status,
    createdAt: payroll.createdAt,
    updatedAt: payroll.updatedAt,
  };

  return { data };
};

const updatePayrollService = async (id, updateData) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid payroll ID format');
    err.statusCode = 400;
    throw err;
  }

  const payroll = await PayrollModel.findById(id);
  if (!payroll) {
    const err = new Error('Not found payroll');
    err.statusCode = 404;
    throw err;
  }

  // Nếu status = CLOSED thì không cho update
  if (payroll.status === PayrollStatus.CLOSED) {
    const err = new Error('Lương đã được chốt định kì, không thể chỉnh sửa');
    err.statusCode = 400;
    throw err;
  }

  // cho phép update payroll những trường có thể thay đổi
  const allowedFields = ['basicSalary', 'allowance', 'overtime', 'deductions', 'status'];
  const safeUpdateData = Object.fromEntries(Object.entries(updateData).filter(([key]) => allowedFields.includes(key)));

  Object.assign(payroll, safeUpdateData); // Mapping giá trị được update

  // gọi lại calculateDeductions -> ngày nghỉ, vắng
  payroll.deductions = await calculateDeductions(payroll.employeeId, payroll.month, payroll.year, payroll.basicSalary);

  // cập nhật lại netSalary
  payroll.netSalary = Number(payroll.basicSalary + payroll.allowance + payroll.overtime - payroll.deductions).toFixed(
    2,
  );

  await payroll.save();

  const data = {
    month: payroll.month,
    year: payroll.year,
    basicSalary: payroll.basicSalary,
    allowance: payroll.allowance,
    overtime: payroll.overtime,
    deductions: payroll.deductions,
    netSalary: payroll.netSalary,
    status: payroll.status,
    updatedAt: payroll.updatedAt,
  };

  return { data };
};

const deletePayrollService = async (id) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid payroll ID format');
    err.statusCode = 400;
    throw err;
  }

  const payroll = await PayrollModel.findById(id);

  if (payroll.status !== PayrollStatus.OPEN) {
    const err = new Error('Bảng lương đang tính toán hoặc đã đóng, không thể xóa !');
    err.statusCode = 400;
    throw err;
  }

  await PayrollModel.findByIdAndDelete(id);
};

/**
 * Luồng nghiệp vụ:
 * - Dùng cho ngày 25 hàng tháng
 * - Chốt lương và xóa lịch điểm danh cũ để bắt đầu tháng mới
 */
const createPayrollForAllEmployeesService = async (year, month) => {
  // Check month, year hiện tại
  validateFutureSchedule(year, month);

  // Check lương được tạo tháng này chưa
  const payroll = await PayrollModel.find({ year, month });

  if (payroll.length > 0) {
    const err = new Error(`Bảng lương của tất cả nhân viên đã được tạo trong tháng ${month}/${year}`);
    err.statusCode = 400;
    throw err;
  }

  const employees = await EmployeeModel.find({
    status: { $ne: EmployeeStatus.TERMINATED },
  });

  if (!employees || employees.length === 0) {
    const err = new Error('Không có nhân viên nào để tạo bảng lương');
    err.statusCode = 400;
    throw err;
  }

  // Duyệt từng nhân viên để sẵn sàng tạo bảng lương
  const data = [];

  for (const emp of employees) {
    // Lấy thông tin lương bảng nhân viên
    const basicSalary = emp.basicSalary || 0;
    const allowance = emp.allowance || 0;

    const createData = {
      employeeId: emp._id,
      month,
      year,
      basicSalary,
      allowance,
    };

    const payroll = await createPayrollService(createData);
    data.push(payroll.data);
  }

  return { data };
};

// SERVICE API CHỐT LƯƠNG SET STATUS CLOSE => XÓA TẤT CẢ ATTENDANCE THÁNG CŨ ( NGÀY KỂ TỪ 22 TRỞ ĐI)

module.exports = {
  createPayrollService,
  calculateDeductions,
  getAllPayrollService,
  getPayrollService,
  updatePayrollService,
  deletePayrollService,
  createPayrollForAllEmployeesService,
};
