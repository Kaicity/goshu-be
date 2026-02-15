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
    kpi: performance.kpi,
    totalScore: performance.totalScore,
    rank: performance.rank,
    comment: performance.comment,
    evaluatedBy: performance.evaluatedBy,
    status: performance.status,
  };

  return { data };
};

const updatePerformanceService = async (id, updateData) => {
  const performance = await PerformanceModel.findById(id);
  if (!performance) {
    const err = new Error('Không tìm thấy đánh giá');
    err.statusCode = 400;
    throw err;
  }

  if (performance.status === PerformanceStatus.APPROVED) {
    const err = new Error('Không thể sửa vì đánh giá đã được duyệt');
    err.statusCode = 400;
    throw err;
  }

  const { kpi, comment } = updateData;
  const { totalScore, rank } = calculatePerformance(kpi);

  performance.kpi = kpi;
  performance.comment = comment;
  performance.totalScore = totalScore;
  performance.rank = rank;

  await performance.save();

  const data = {
    employeeId: performance.employeeId,
    period: performance.period,
    kpi: performance.kpi,
    totalScore: performance.totalScore,
    rank: performance.rank,
    comment: performance.comment,
    evaluatedBy: performance.evaluatedBy,
    status: performance.status,
  };

  return { data };
};

const approvePerformanceService = async (id) => {
  const performance = await PerformanceModel.findById(id);
  if (!performance) {
    const err = new Error('Không tìm thấy đánh giá');
    err.statusCode = 404;
    throw err;
  }

  performance.status = PerformanceStatus.APPROVED;
  await performance.save();
};

module.exports = { createPerformanceService, updatePerformanceService, approvePerformanceService };
