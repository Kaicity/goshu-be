const PayrollStatus = require('../enums/payrollStatus');
const PayrollModel = require('../models/payrollModel');

const getAvailablePayrollYearsService = async () => {
  const years = await PayrollModel.distinct('year', {
    status: PayrollStatus.CLOSED,
  });

  return {
    data: years.sort((a, b) => b - a),
  };
};

const getSalaryStructureByMonthService = async (year) => {
  if (!year || isNaN(year)) {
    throw new Error('Invalid year');
  }

  const data = await PayrollModel.aggregate([
    {
      $match: {
        year: Number(year),
        status: PayrollStatus.CLOSED,
      },
    },
    {
      $group: {
        _id: '$month',
        month: { $first: '$month' },
        basicSalary: { $sum: '$basicSalary' },
        allowance: { $sum: '$allowance' },
        overtime: { $sum: '$overtime' },
        deductions: { $sum: '$deductions' },
        netSalary: { $sum: '$netSalary' },
      },
    },
    {
      $project: {
        _id: 0,
        month: 1,
        basicSalary: 1,
        allowance: 1,
        overtime: 1,
        deductions: 1,
        netSalary: 1,
      },
    },
    { $sort: { month: 1 } },
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
          { name: 'basicSalary', value: '$basicSalary' },
          { name: 'allowance', value: '$allowance' },
          { name: 'overtime', value: '$overtime' },
          { name: 'deductions', value: '$deductions' },
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
  getAvailablePayrollYearsService,
  getSalaryStructureByMonthService,
  getPayrollStatusRatioService,
  getSalaryRatioService,
};
