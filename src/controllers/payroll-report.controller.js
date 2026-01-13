const asyncHandle = require('express-async-handler');
const {
  getSalaryStructureByMonthService,
  getSalaryRatioService,
  getPayrollStatusRatioService,
} = require('../services/payroll-report.service');

const getSalaryStructureByMonth = asyncHandle(async (req, res) => {
  const { year } = req.query;

  const result = await getSalaryStructureByMonthService(year);

  res.status(200).json({
    message: 'Get report payroll is successfully',
    ...result,
  });
});

const getSalaryRatio = asyncHandle(async (req, res) => {
  const { month, year } = req.query;

  const result = await getSalaryRatioService(month, year);

  res.status(200).json({
    message: 'Get report payroll is successfully',
    ...result,
  });
});

const getPayrollStatusRatio = asyncHandle(async (req, res) => {
  const { month, year } = req.query;

  const result = await getPayrollStatusRatioService(month, year);

  res.status(200).json({
    message: 'Get report payroll is successfully',
    ...result,
  });
});

module.exports = { getSalaryStructureByMonth, getSalaryRatio, getPayrollStatusRatio };
