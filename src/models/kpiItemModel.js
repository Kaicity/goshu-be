const mongoose = require('mongoose');

const KpiItemSchema = new mongoose.Schema(
  {
    title: String, // "Hoàn thành task"
    weight: Number, // % trọng số
    score: Number, // 0-100
    note: String,
  },
  { _id: false },
);

module.exports = KpiItemSchema;
