const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');

const { getAllEmployeesService, updateEmployeeService } = require('../services/employee.service');

const getAllEmployees = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);
  const { department, type } = req.query;

  const result = await getAllEmployeesService({ page, limit, skip, search }, { department, type });

  res.status(200).json({
    message: 'get list employees successfully',
    ...result,
  });
});

const updateEmployee = asyncHandle(async (req, res) => {
  const { id } = req.params;

  const result = await updateEmployeeService(id, req.body);

  res.status(200).json({
    message: 'Cập nhật thông tin nhân viên thành công',
    ...result,
  });
});

module.exports = { getAllEmployees, updateEmployee };
