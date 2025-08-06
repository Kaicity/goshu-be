const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const EmployeeModel = require('../models/employeeModel');

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

module.exports = { getAllEmployees };
