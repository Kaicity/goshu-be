const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const {
  createPayrollService,
  getAllPayrollService,
  getPayrollService,
  updatePayrollService,
  deletePayrollService,
  createPayrollForAllEmployeesService,
  completeAllPayrollService,
} = require('../services/payroll.service');

const createPayroll = asyncHandle(async (req, res) => {
  const result = await createPayrollService(req.body);

  res.status(200).json({
    message: 'Create payroll is successfully',
    ...result,
  });
});

const createPayrollForAllEmployees = asyncHandle(async (req, res) => {
  const { year, month } = req.body;
  const result = await createPayrollForAllEmployeesService(year, month);

  res.status(200).json({
    message: 'Create payroll for all employees is successfully',
    ...result,
  });
});

const getAllPayroll = asyncHandle(async (req, res) => {
  const { page, limit, skip, search } = paginate(req);
  const { month, year, minSalary, maxSalary, status, employeeId } = req.query;

  const result = await getAllPayrollService(
    { page, limit, skip, search },
    { month, year, minSalary, maxSalary, status, employeeId },
  );

  res.status(200).json({
    message: 'Get all payrolls is successfully',
    ...result,
  });
});

const getPayroll = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await getPayrollService(id);

  res.status(200).json({
    message: 'Get payroll is successfully',
    ...result,
  });
});

const updatePayroll = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await updatePayrollService(id, req.body);

  res.status(200).json({
    message: 'Updated payroll is successfully',
    ...result,
  });
});

const deletePayroll = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await deletePayrollService(id);

  res.status(200).json({
    message: 'Deleted payroll is successfully',
    ...result,
  });
});

const completeAllPayroll = asyncHandle(async (req, res) => {
  const result = await completeAllPayrollService();

  res.status(200).json({
    message: 'Complete payroll is successfully and delete old attendance',
    ...result,
  });
});

module.exports = {
  createPayroll,
  getAllPayroll,
  getPayroll,
  updatePayroll,
  deletePayroll,
  createPayrollForAllEmployees,
  completeAllPayroll,
};
