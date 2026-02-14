const express = require('express');
const verifyToken = require('../middlewares/verifyMiddleware');
const { getDashboardSummary } = require('../controllers/dashboard-report.controller');

const dashboardReportRouter = express.Router();

dashboardReportRouter.get('/summary', verifyToken, getDashboardSummary);

module.exports = dashboardReportRouter;
