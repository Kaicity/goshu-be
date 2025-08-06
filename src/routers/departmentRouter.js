const Router = require('express');
const { createDepartment, getAllDepartments } = require('../controllers/departmentController');

const departmentRouter = Router();

departmentRouter.post('/createDepartment', createDepartment);
departmentRouter.get('/getAll', getAllDepartments);

module.exports = departmentRouter;
