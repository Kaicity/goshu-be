const { BONUS_RANK_A, BONUS_RANK_B } = require('../constants/bonusRate');
const PerformanceRank = require('../enums/performanceRank');

const getBonusRate = (performance) => {
  let bonusRate = 0;

  if (performance) {
    if (performance.rank === PerformanceRank.A) bonusRate = BONUS_RANK_A;
    if (performance.rank === PerformanceRank.B) bonusRate = BONUS_RANK_B;
  }

  return bonusRate;
};

module.exports = getBonusRate;
