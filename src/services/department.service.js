const DepartmentModel = require('../models/departmentModel');

const createDepartmentService = async (data) => {
  const { name, description } = data;

  const newDepartment = new DepartmentModel({
    name,
    description,
  });

  await newDepartment.save();

  return newDepartment;
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

module.exports = { createDepartmentService, getAllDepartmentsService };
