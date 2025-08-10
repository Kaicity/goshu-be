const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const {
  createDepartmentService,
  getAllDepartmentsService,
  updateDepartmentService,
  deleteDepartmentService,
  getDepartmentService,
} = require('../services/department.service');

const createDepartment = asyncHandle(async (req, res) => {
  const result = await createDepartmentService(req.body);

  res.status(200).json({
    message: 'create new department sucessfully',
    ...result,
  });
});

const getAllDepartments = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);

  const result = await getAllDepartmentsService({ page, limit, skip, search });

  res.status(200).json({
    message: 'get list departments successfully',
    ...result,
  });
});

const updateDepartment = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await updateDepartmentService(id, req.body);

  res.status(200).json({
    message: 'Updated department sucessfully',
    ...result,
  });
});

const deleteDepartment = asyncHandle(async (req, res) => {
  const { id } = req.params;
  await deleteDepartmentService(id);

  res.status(200).json({
    message: 'Deleted department sucessfully',
    data: {},
  });
});

const getDepartment = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await getDepartmentService(id);

  res.status(200).json({
    message: 'Get department sucessfully',
    ...result,
  });
});

module.exports = { createDepartment, getAllDepartments, updateDepartment, deleteDepartment, getDepartment };
