const { isValidObjectId } = require('mongoose');
const EmployeeModel = require('../models/employeeModel');
const DepartmentModel = require('../models/departmentModel');

const getAllEmployeesService = async ({ page, limit, skip, search }, { department, type }) => {
  const query = {};

  if (search) {
    query.$or = [
      { fullname: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeCode: { $regex: search, $options: 'i' } },
    ];
  }

  if (department) query.departmentId = department;
  if (type) query.type = type;

  const [total, employees] = await Promise.all([
    EmployeeModel.countDocuments(query),
    EmployeeModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
  ]);

  const data = employees.map((item) => ({
    id: item.id,
    fullname: item.fullname,
    email: item.email,
    employeeCode: item.employeeCode,
    departmentId: item.departmentId,
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
    const existingUsername = await EmployeeModel.findOne({ username });

    if (existingUsername) {
      const err = new Error('Username đã được sử dụng');
      err.statusCode = 409;
      throw err;
    }

    user.email = email;
  }

  // Mapping dữ liệu cũ sang dữ liệu mới
  Object.assign(employee, updateData);
  employee.updatedAt = Date.now();
  await employee.save();

  const data = {
    id: employee.id,
    fullname: employee.fullname,
    username: employee.username,
    githubId: employee.githubId,
    slackId: employee.slackId,
    microsoftTeamId: employee.microsoftTeamId,
    address: employee.address,
    phone: employee.phone,
    birthday: employee.birthday,
    gender: employee.gender,
    designation: employee.designation,
    joinDate: employee.joinDate,
    workingDate: employee.workingDate,
    avatarUrl: employee.avatarUrl,
    type: employee.type,
    document: employee.document,
    departmentId: employee.departmentId,
    status: employee.status,
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

  const employee = await EmployeeModel.findById(id);

  if (!employee) {
    const err = new Error('Không tìm thấy nhân viên này');
    err.statusCode = 404;
    throw err;
  }

  const data = {
    employeeCode: employee.employeeCode,
    fullname: employee.fullname,
    username: employee.username,
    email: employee.email,
    githubId: employee.githubId,
    slackId: employee.slackId,
    microsoftTeamId: employee.microsoftTeamId,
    address: employee.address,
    phone: employee.phone,
    birthday: employee.birthday,
    gender: employee.gender,
    designation: employee.designation,
    joinDate: employee.joinDate,
    workingDate: employee.workingDate,
    avatarUrl: employee.avatarUrl,
    type: employee.type,
    document: employee.document,
    departmentId: employee.departmentId,
    status: employee.status,
    updatedAt: employee.updatedAt,
  };

  return { data };
};

module.exports = { getAllEmployeesService, updateEmployeeService, getEmployeeService };
