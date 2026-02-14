const asyncHandle = require('express-async-handler');
const { getDashboardSummaryService } = require('../services/dashboard-report.service');

const getDashboardSummary = asyncHandle(async (req, res) => {
  const { month, year } = req.query;

  const result = await getDashboardSummaryService(month, year);

  res.status(200).json({
    message: 'Get dashboard report summary',
    ...result,
  });
});

module.exports = { getDashboardSummary };
