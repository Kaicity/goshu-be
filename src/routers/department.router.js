const Router = require('express');
const {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');

const departmentRouter = Router();

departmentRouter.post('/createDepartment', createDepartment);
departmentRouter.get('/getAll', getAllDepartments);
departmentRouter.put('/updateDepartment/:id', updateDepartment);
departmentRouter.delete('/deleteDeparment/:id', deleteDepartment);

module.exports = departmentRouter;
