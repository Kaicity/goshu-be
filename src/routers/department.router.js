const express = require('express');
const {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartment,
} = require('../controllers/department.controller');

const departmentRouter = express.Router();

departmentRouter.post('/createDepartment', createDepartment);
departmentRouter.get('/getAll', getAllDepartments);
departmentRouter.put('/updateDepartment/:id', updateDepartment);
departmentRouter.delete('/deleteDepartment/:id', deleteDepartment);
departmentRouter.get('/getDepartment/:id', getDepartment);

module.exports = departmentRouter;
