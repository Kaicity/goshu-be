const Router = require('express');
const authorizeRole = require('../middlewares/authorizeRole');
const verifyToken = require('../middlewares/verifyMiddleware');
const UserRoles = require('../enums/userRoles');
const { getAllEmployees, updateEmployee } = require('../controllers/employee.controller');

const employeeRouter = Router();

employeeRouter.get('/getAll', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), getAllEmployees);
employeeRouter.put('/updateEmployee/:id', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), updateEmployee);

module.exports = employeeRouter;
