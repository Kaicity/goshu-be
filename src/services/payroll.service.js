const PayrollModel = require('../models/payrollModel');
const EmployeeModel = require('../models/employeeModel');
const AttendanceModel = require('../models/attendanceModel');
const AttendanceStatus = require('../enums/attendanceStatus');
const { isValidObjectId } = require('mongoose');
const PayrollStatus = require('../enums/payrollStatus');
const { validateFutureSchedule } = require('../utils/scheduleValidate');
const EmployeeStatus = require('../enums/employeeStatus');
const generateRandomCode = require('../utils/digitCodeRandom');
const PerformanceModel = require('../models/performanceModel');
const PerformanceStatus = require('../enums/performanceStatus');
const PerformanceRank = require('../enums/performanceRank');
const { BONUS_RANK_A, BONUS_RANK_B } = require('../constants/bonusRate');
const getBonusRate = require('../utils/calculateBonusRate');

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
  const { employeeId, month, year, basicSalary, allowance = 0, overtime = 0, deductions = 0, triggeredBy } = createData;

  const payrollCode = generateRandomCode('LNV-');

  // Check đi trễ bao nhiêu lần, số buổi vắng( trừ lương chứ gì)
  const autoDeductions = await calculateDeductions(employeeId, month, year, basicSalary);

  // Tổng deductions = lịch công + nhập tay các khoản trừ khác
  const totalDeductions = autoDeductions + deductions;

  // Lương tổng = lương CB + phụ cấp + OT - (buổi vắng, nghỉ không phép, đi trễ, làm tổn hại vật chất công ty, đồng phục,...)
  const netSalary = Number((basicSalary + allowance + overtime - totalDeductions).toFixed(2));

  // Lấy hiệu suất làm việc của nhân viên trong tháng/năm  (bonus hoa hồng)
  const performance = await PerformanceModel.findOne({
    employeeId,
    period: `${year}-${String(month).padStart(2, '0')}`,
    status: PerformanceStatus.APPROVED,
  });

  const bonusRate = getBonusRate(performance);
  const totalSalary = netSalary + netSalary * bonusRate;

  const subDeductions = Number(totalDeductions);

  const payroll = new PayrollModel({
    employeeId,
    payrollCode,
    month,
    year,
    basicSalary,
    allowance,
    overtime,
    deductions: subDeductions,
    netSalary: totalSalary,
    triggeredBy,
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
      .populate('employeeId', 'firstname lastname employeeCode avatarUrl designation'),
  ]);

  const data = payrolls.map((item) => ({
    payroll: {
      id: item.id,
      payrollCode: item.payrollCode,
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
      designation: item.employeeId.designation,
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

  const payroll = await PayrollModel.findById(id)
    .populate('employeeId', 'employeeCode firstname lastname designation type joinDate avatarUrl status')
    .lean();

  if (!payroll) {
    const err = new Error('Payroll not found');
    err.statusCode = 404;
    throw err;
  }

  const data = {
    payroll: {
      id: payroll.id,
      payrollCode: payroll.payrollCode,
      month: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      allowance: payroll.allowance,
      overtime: payroll.overtime,
      deductions: payroll.deductions,
      netSalary: payroll.netSalary,
      status: payroll.status,
    },
    employee: {
      id: payroll.employeeId.id,
      employeeCode: payroll.employeeId.employeeCode,
      firstname: payroll.employeeId.firstname,
      lastname: payroll.employeeId.lastname,
      avatarUrl: payroll.employeeId.avatarUrl,
      designation: payroll.employeeId.designation,
      type: payroll.employeeId.type,
      joinDate: payroll.employeeId.joinDate,
      status: payroll.employeeId.status,
    },
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
const createPayrollForAllEmployeesService = async (year, month, triggeredBy) => {
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
      triggeredBy,
    };

    const payroll = await createPayrollService(createData);
    data.push(payroll.data);
  }

  return { data };
};

// SERVICE API CHỐT LƯƠNG SET STATUS CLOSE => XÓA TẤT CẢ ATTENDANCE THÁNG CŨ ( NGÀY KỂ TỪ 22 TRỞ ĐI)
const completeAllPayrollService = async () => {
  // Check payrolls
  const payrolls = await PayrollModel.find();
  if (payrolls.length === 0) {
    const err = new Error('Không thể thực hiện thao tác này vì bảng lương chưa được tạo');
    err.statusCode = 400;
    throw err;
  }
  // 1. Set status CLOSED cho toàn bộ payroll
  await PayrollModel.updateMany(
    { status: { $ne: PayrollStatus.CLOSED } },
    {
      $set: {
        status: PayrollStatus.CLOSED,
        updatedAt: new Date(),
      },
    },
  );
  // 2. Xóa toàn bộ attendance
  const deleteResult = await AttendanceModel.deleteMany({});
  const data = {
    success: true,
    deletedAttendance: deleteResult.deletedCount,
  };
  return { data };
};

module.exports = {
  createPayrollService,
  calculateDeductions,
  getAllPayrollService,
  getPayrollService,
  updatePayrollService,
  deletePayrollService,
  createPayrollForAllEmployeesService,
  completeAllPayrollService,
};
