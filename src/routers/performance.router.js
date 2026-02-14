const express = require('express');
const { createPerformance } = require('../controllers/performance.controller');

const performanceRouter = express.Router();

performanceRouter.post('/createPerformance', createPerformance);

module.exports = performanceRouter;
