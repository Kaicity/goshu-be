const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const EmployeeModel = require('../models/employeeModel');
const DepartmentModel = require('../models/departmentModel');

const { isValidObjectId } = require('mongoose');

const getAllEmployees = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);
  const { department, type } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { fullname: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeCode: { $regex: search, $options: 'i' } },
    ];
  }

  if (department) query.department = department;
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

  res.status(200).json({
    message: 'get list employees successfully',
    data,
    pagination: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  });
});

const updateEmployee = asyncHandle(async (req, res) => {
  const { id } = req.params;

  // Kiểm tra object id hợp lệ
  if (!isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid employee ID format');
  }

  const employee = await EmployeeModel.findById(id);

  if (!employee) {
    res.status(404);
    throw new Error('Không tìm thấy nhân viên trong hệ thống');
  }

  //Update employee
  const updateFields = ({
    fullname,
    username,
    githubId,
    slackId,
    microsoftTeamId,
    address,
    phone,
    birthday,
    gender,
    designation,
    joinDate,
    workingDate,
    avatarUrl,
    type,
    document,
    departmentId,
  } = req.body);

  const departmentId = updateFields.departmentId;
  const username = updateFields.username;

  if (departmentId) {
    const department = await DepartmentModel.findById(updateFields.departmentId);

    if (!department) {
      res.status(404);
      throw new Error('Không tìm thấy phòng ban này');
    }
  }

  if (username && username !== employee.username) {
    const existingUsername = await EmployeeModel.findOne({ username });

    if (existingUsername) {
      res.status(409);
      throw new Error('Username đã được sử dụng');
    }

    user.email = email;
  }

  Object.assign(employee, updateFields);
  employee.updatedAt = Date.now();
  await employee.save();

  res.status(200).json({
    message: 'Cập nhật thông tin nhân viên thành công',
    data: {
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
    },
  });
});

module.exports = { getAllEmployees, updateEmployee };
