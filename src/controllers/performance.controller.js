const asyncHandle = require('express-async-handler');
const {
  createPerformanceService,
  updatePerformanceService,
  approvePerformanceService,
} = require('../services/performance.service');

const createPerformance = asyncHandle(async (req, res) => {
  const result = await createPerformanceService(req.body);

  res.status(200).json({
    message: 'create new performance sucessfully',
    ...result,
  });
});

const updatePerformance = asyncHandle(async (req, res) => {
  const { id } = req.params;
  const result = await updatePerformanceService(id, req.body);

  res.status(200).json({
    message: 'updated performance sucessfully',
    ...result,
  });
});

const approvePerformance = asyncHandle(async (req, res) => {
  const { id } = req.params;
  await approvePerformanceService(id);

  res.status(200).json({
    message: 'performance has been approved',
  });
});

module.exports = { createPerformance, updatePerformance, approvePerformance };
