const express = require('express');
const { createPerformance, updatePerformance, approvePerformance } = require('../controllers/performance.controller');

const performanceRouter = express.Router();

performanceRouter.post('/createPerformance', createPerformance);
performanceRouter.put('/updatePerformance/:id', updatePerformance);
performanceRouter.put('/approvePerformance/:id', approvePerformance);

module.exports = performanceRouter;
