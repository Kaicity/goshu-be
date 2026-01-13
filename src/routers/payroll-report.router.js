const express = require('express');
const verifyToken = require('../middlewares/verifyMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const {
  getSalaryStructureByMonth,
  getPayrollStatusRatio,
  getSalaryRatio,
} = require('../controllers/payroll-report.controller');

const payrollReportRouter = express.Router();

payrollReportRouter.get('/salary-structure-by-month', verifyToken, getSalaryStructureByMonth);
payrollReportRouter.get('/salary-ratio', verifyToken, getSalaryRatio);
payrollReportRouter.get('/payroll-status-ratio', verifyToken, getPayrollStatusRatio);

module.exports = payrollReportRouter;
