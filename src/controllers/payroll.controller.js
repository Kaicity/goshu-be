const asyncHandle = require('express-async-handler');
const paginate = require('../utils/paginate');
const { createPayrollService } = require('../services/payroll.service');

const createPayroll = asyncHandle(async (req, res) => {
  const result = await createPayrollService(req.body);

  res.status(200).json({
    message: 'Create payroll is successfully',
    ...result,
  });
});

const getAllPayroll = asyncHandle(async (req, res) => {});

const getPayroll = asyncHandle(async (req, res) => {});

const updatePayroll = asyncHandle(async (req, res) => {});

const deletePayroll = asyncHandle(async (req, res) => {});

module.exports = { createPayroll, getAllPayroll, getPayroll, updatePayroll, deletePayroll };
