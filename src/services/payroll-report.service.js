const PayrollStatus = require('../enums/payrollStatus');
const PayrollModel = require('../models/payrollModel');

const getSalaryStructureByMonthService = async (year) => {
  const data = await PayrollModel.aggregate([
    {
      $match: {
        year: Number(year),
        status: PayrollStatus.CLOSED, // chỉ lấy payroll đã chốt
      },
    },
    {
      $group: {
        _id: '$month',
        basicSalary: { $sum: '$basicSalary' },
        allowance: { $sum: '$allowance' },
        overtime: { $sum: '$overtime' },
        deductions: { $sum: '$deductions' },
        netSalary: { $sum: '$netSalary' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return { data };
};

const getSalaryRatioService = async (month, year) => {
  const result = await PayrollModel.aggregate([
    {
      $match: {
        month: Number(month),
        year: Number(year),
        status: PayrollStatus.CLOSED,
      },
    },
    {
      $group: {
        _id: null,
        basicSalary: { $sum: '$basicSalary' },
        allowance: { $sum: '$allowance' },
        overtime: { $sum: '$overtime' },
        deductions: { $sum: '$deductions' },
      },
    },
    {
      $project: {
        _id: 0,
        data: [
          { name: 'Basic Salary', value: '$basicSalary' },
          { name: 'Allowance', value: '$allowance' },
          { name: 'Overtime', value: '$overtime' },
          { name: 'Deductions', value: '$deductions' },
        ],
      },
    },
  ]);

  const data = result[0]?.data;

  return { data };
};

const getPayrollStatusRatioService = async (month, year) => {
  const data = await PayrollModel.aggregate([
    {
      $match: {
        month: Number(month),
        year: Number(year),
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        value: '$count',
      },
    },
  ]);

  return { data };
};

module.exports = {
  getSalaryStructureByMonthService,
  getPayrollStatusRatioService,
  getSalaryRatioService,
};
