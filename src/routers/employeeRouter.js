const Router = require('express');
const authorizeRole = require('../middlewares/authorizeRole');
const verifyToken = require('../middlewares/verifyMiddleware');
const UserRoles = require('../enums/userRoles');
const { getAllEmployees } = require('../controllers/employeeController');

const employeeRouter = Router();

employeeRouter.get('/getAll', verifyToken, authorizeRole(UserRoles.ADMIN, UserRoles.HR), getAllEmployees);

module.exports = employeeRouter;
