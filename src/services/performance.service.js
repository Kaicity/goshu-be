const PerformanceStatus = require('../enums/performanceStatus');
const PerformanceModel = require('../models/performanceModel');
const calculatePerformance = require('../utils/calculatePerformance');

const createPerformanceService = async (createData) => {
  const { employeeId, period, kpi, evaluatedBy, comment } = createData;

  const exists = await PerformanceModel.findOne({ employeeId, period });
  if (exists) {
    const err = new Error('Đã tồn tại đánh giá KPI tháng này');
    err.statusCode = 400;
    throw err;
  }

  // Tinh KPI
  const { totalScore, rank } = calculatePerformance(kpi);

  const performance = await PerformanceModel.create({
    employeeId,
    period,
    kpi,
    totalScore,
    rank,
    evaluatedBy,
    comment,
    status: PerformanceStatus.SUBMITTED,
  });

  const data = {
    employeeId: performance.employeeId,
    period: performance.period,
    totalScore: performance.totalScore,
    rank: performance.rank,
    status: performance.status,
  };

  return { data };
};

module.exports = { createPerformanceService };
