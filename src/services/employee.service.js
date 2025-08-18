const { isValidObjectId } = require('mongoose');
const EmployeeModel = require('../models/employeeModel');
const DepartmentModel = require('../models/departmentModel');

const getAllEmployeesService = async ({ page, limit, skip, search }, { department, type }) => {
  const query = {};

  if (search) {
    query.$or = [
      { firstname: { $regex: search, $options: 'i' } },
      { lastname: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeCode: { $regex: search, $options: 'i' } },
    ];
  }

  if (department) query.departmentId = department;
  if (type) query.type = type;

  const [total, employees] = await Promise.all([
    EmployeeModel.countDocuments(query),
    EmployeeModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('departmentId', 'name'),
  ]);

  const data = employees.map((item) => ({
    avatarUrl: item.avatarUrl,
    id: item.id,
    firstname: item.firstname,
    lastname: item.lastname,
    email: item.email,
    employeeCode: item.employeeCode,
    departmentId: item.departmentId
      ? {
          id: item.departmentId.id,
          name: item.departmentId.name,
        }
      : null,
    designation: item.designation,
    type: item.type,
    status: item.status,
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

const updateEmployeeService = async (id, updateData) => {
  // Kiểm tra object id hợp lệ
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid employee ID format');
    err.statusCode = 400;
    throw err;
  }

  const employee = await EmployeeModel.findById(id);

  if (!employee) {
    const err = new Error('Không tìm thấy nhân viên trong hệ thống');
    err.statusCode = 404;
    throw err;
  }

  //Update employee
  const { username, departmentId } = updateData;

  if (departmentId) {
    const department = await DepartmentModel.findById(departmentId);

    if (!department) {
      const err = new Error('Không tìm thấy phòng ban này');
      err.statusCode = 404;
      throw err;
    }
  }

  if (username && username !== employee.username) {
    const existingUsername = await EmployeeModel.findOne({ username: username });

    if (existingUsername) {
      const err = new Error('Username đã được sử dụng');
      err.statusCode = 409;
      throw err;
    }

    employee.username = username;
  }

  // Mapping dữ liệu cũ sang dữ liệu mới
  Object.assign(employee, updateData);
  employee.updatedAt = Date.now();
  await employee.save();

  // populate lại departmentId để có name nè
  employee = await employee.populate('departmentId', 'name');

  const data = {
    // Định danh
    id: employee.id,
    firstname: employee.firstname,
    lastname: employee.lastname,
    username: employee.username,
    avatarUrl: employee.avatarUrl,

    // Liên hệ
    phone: employee.phone,
    address: employee.address,
    country: employee.country,
    internalEmail: employee.internalEmail,

    // Cá nhân
    gender: employee.gender,
    birthday: employee.birthday,
    marital: employee.marital,
    identityCard: employee.identityCard,

    // Công việc
    designation: employee.designation,
    departmentId: employee.departmentId
      ? {
          id: employee.departmentId.id.toString(),
          name: employee.departmentId.name,
        }
      : null,
    type: employee.type,
    joinDate: employee.joinDate,
    workingDate: employee.workingDate,
    status: employee.status,
    document: employee.document,

    // Tài khoản liên kết
    githubId: employee.githubId,
    slackId: employee.slackId,
    microsoftTeamId: employee.microsoftTeamId,

    // Hệ thống
    updatedAt: employee.updatedAt,
  };

  return { data };
};

const getEmployeeService = async (id) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid employee ID format');
    err.statusCode = 400;
    throw err;
  }

  const employee = await EmployeeModel.findById(id).populate('departmentId', 'name');

  if (!employee) {
    const err = new Error('Không tìm thấy nhân viên này');
    err.statusCode = 404;
    throw err;
  }

  const data = {
    // 1. Định danh nhân viên
    employeeCode: employee.employeeCode,
    firstname: employee.firstname,
    lastname: employee.lastname,
    username: employee.username,
    avatarUrl: employee.avatarUrl,
    identityCard: employee.identityCard,

    // 2. Thông tin liên hệ
    email: employee.email,
    internalEmail: employee.internalEmail,
    phone: employee.phone,
    address: employee.address,
    country: employee.country,

    // 3. Thông tin cá nhân
    gender: employee.gender,
    birthday: employee.birthday,
    marital: employee.marital,

    // 4. Thông tin công việc
    designation: employee.designation,
    departmentId: employee.departmentId
      ? {
          id: employee.departmentId.id.toString(),
          name: employee.departmentId.name,
        }
      : null,
    type: employee.type,
    joinDate: employee.joinDate,
    workingDate: employee.workingDate,
    status: employee.status,
    document: employee.document,

    // 5. Tài khoản liên kết
    githubId: employee.githubId,
    slackId: employee.slackId,
    microsoftTeamId: employee.microsoftTeamId,

    // 6. Thông tin hệ thống
    updatedAt: employee.updatedAt,
  };

  return { data };
};

module.exports = { getAllEmployeesService, updateEmployeeService, getEmployeeService };
