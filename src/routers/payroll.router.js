const express = require('express');
const verifyToken = require('../middlewares/verifyMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const { createPayroll, getAllPayroll, getPayroll, updatePayroll, deletePayroll } = require('../controllers/payroll.controller');

const payrollRouter = express.Router();

payrollRouter.post('/createPayroll', verifyToken, createPayroll);
payrollRouter.get('/getAll', verifyToken, getAllPayroll);
payrollRouter.get('/getPayroll/:id', verifyToken, getPayroll);
payrollRouter.put('/updatePayroll/:id', verifyToken, updatePayroll);
payrollRouter.delete('/deletePayroll/:id', verifyToken, deletePayroll);

module.exports = payrollRouter;
