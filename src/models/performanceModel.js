const mongoose = require('mongoose');
const PerformanceStatus = require('../enums/performanceStatus');
const KpiItemSchema = require('./kpiItemModel');
const PerformanceRank = require('../enums/performanceRank');

const PerformanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  kpi: [KpiItemSchema],
  totalScore: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    enum: [PerformanceRank.A, PerformanceRank.B, PerformanceRank.C, PerformanceRank.D],
  },
  comment: {
    type: String,
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employees',
  },
  status: {
    type: String,
    enum: [PerformanceStatus.DRAFT, PerformanceStatus.SUBMITTED, PerformanceStatus.APPROVED],
    default: PerformanceStatus.DRAFT,
  },
  createdAt: { type: Date, default: Date.now },
});

const PerformanceModel = mongoose.model('performanes', PerformanceSchema);

module.exports = PerformanceModel;
