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

const getAllDepartments = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);

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

  res.status(200).json({
    message: 'get list departments successfully',
    data,
    pagination: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  });
});

module.exports = { createDepartment, getAllDepartments };
