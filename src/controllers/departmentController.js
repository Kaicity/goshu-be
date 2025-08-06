const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const DepartmentModel = require('../models/departmentModel');

const createDepartment = asyncHandle(async (req, res) => {
  const { name, description } = req.body;

  const newDepartment = new DepartmentModel({
    name,
    description,
  });

  await newDepartment.save();

  res.status(200).json({
    message: 'Tạo phòng ban thành công',
    data: {
      name: newDepartment.name,
      description: newDepartment.description,
    },
  });
});

const getAllDepartments = asyncHandle(async (req, res) => {});

module.exports = { createDepartment, getAllDepartments };
