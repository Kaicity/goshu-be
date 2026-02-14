const asyncHandle = require('express-async-handler');
const { createPerformanceService } = require('../services/performance.service');

const createPerformance = asyncHandle(async (req, res) => {
  const result = await createPerformanceService(req.body);

  res.status(200).json({
    message: 'create new performance sucessfully',
    ...result,
  });
});

module.exports = { createPerformance };
