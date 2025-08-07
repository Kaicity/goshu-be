const Router = require('express');
const authorizeRole = require('../middlewares/authorizeRole');
const verifyToken = require('../middlewares/verifyMiddleware');
const UserRoles = require('../enums/userRoles');
const { getAllEmployees, updateEmployee, getEmployee } = require('../controllers/employee.controller');

const employeeRouter = Router();

employeeRouter.get('/getAll', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), getAllEmployees);
employeeRouter.put('/updateEmployee/:id', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), updateEmployee);
employeeRouter.get(
  '/getEmployee/:id',
  verifyToken,
  authorizeRole(UserRoles.ADMIN, UserRoles.HR, UserRoles.EMPLOYEE),
  getEmployee,
);

module.exports = employeeRouter;
