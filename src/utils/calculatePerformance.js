const PerformanceRank = require('../enums/performanceRank');

const calculatePerformance = (kpiList) => {
  if (!kpiList || kpiList.length === 0) return { totalScore: 0, rank: 'D' };

  const totalWeight = kpiList.reduce((sum, k) => sum + k.weight, 0);
  if (totalWeight !== 100) {
    throw new Error('Tổng weight KPI phải bằng 100%');
  }

  const totalScore = kpiList.reduce((sum, k) => sum + (k.weight * k.score) / 100, 0);

  let rank = PerformanceRank.D;
  if (totalScore >= 90) rank = PerformanceRank.A;
  else if (totalScore >= 75) rank = PerformanceRank.B;
  else if (totalScore >= 60) rank = PerformanceRank.C;

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    rank,
  };
};

module.exports = calculatePerformance;
