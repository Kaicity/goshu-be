const { isValidObjectId } = require('mongoose');
const DepartmentModel = require('../models/departmentModel');
const EmployeeModel = require('../models/employeeModel');
const { getCurrentTime } = require('../utils/timeZone');

const createDepartmentService = async (createData) => {
  const { name, description } = createData;

  const newDepartment = new DepartmentModel({
    name,
    description,
  });

  await newDepartment.save();

  const data = {
    name: newDepartment.name,
    description: newDepartment.description,
  };

  return { data };
};

const getAllDepartmentsService = async ({ page, limit, skip, search }) => {
  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: 'i' } }];
  }

  const [total, departments] = await Promise.all([
    DepartmentModel.countDocuments(query),
    DepartmentModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
  ]);

  const data = departments.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
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

const updateDepartmentService = async (id, updateData) => {
  // Kiểm tra object id hợp lệ
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid deparment ID format');
    err.statusCode = 400;
    throw err;
  }

  const department = await DepartmentModel.findByIdAndUpdate(id, updateData);
  department.updatedAt = getCurrentTime();
  await department.save();

  const data = {
    name: department.name,
    description: department.description,
  };

  return { data };
};

const deleteDepartmentService = async (id) => {
  // Kiểm tra object id hợp lệ
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid department ID format');
    err.statusCode = 400;
    throw err;
  }

  const department = await DepartmentModel.findById(id);

  if (!department) {
    const err = new Error('Not found department');
    err.statusCode = 404;
    throw err;
  }

  //Kiểm tra nhân viên có hoạt động trong phòng ban
  const employee = await EmployeeModel.findOne({ departmentId: department._id });

  if (employee) {
    const err = new Error('Hiện không thể xóa phòng ban này vì đang có nhân viên hoạt động');
    err.statusCode = 403;
    throw err;
  }

  await DepartmentModel.findByIdAndDelete(id);
};

const getDepartmentService = async (id) => {
  if (!isValidObjectId(id)) {
    const err = new Error('Invalid department ID format');
    err.statusCode = 400;
    throw err;
  }

  const department = await DepartmentModel.findById(id);

  const data = {
    name: department.name,
    description: department.description,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };

  return { data };
};

module.exports = {
  createDepartmentService,
  getAllDepartmentsService,
  updateDepartmentService,
  deleteDepartmentService,
  getDepartmentService,
};
