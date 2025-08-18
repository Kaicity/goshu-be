const mongoose = require('mongoose');
const { getCurrentTime } = require('../utils/timeZone');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: getCurrentTime(),
  },
  updatedAt: {
    type: Date,
    default: getCurrentTime(),
  },
});

const DepartmentModel = mongoose.model('departments', DepartmentSchema);

module.exports = DepartmentModel;
