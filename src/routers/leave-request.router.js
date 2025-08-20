const Router = require('express');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');
const { createLeaveRequest } = require('../controllers/leave-request.controller');

const leaveRequestRouter = new Router();

leaveRequestRouter.post('/createLeaveRequest', createLeaveRequest);
leaveRequestRouter.put('/approveLeaveRequest', authorizeRole(UserRoles.ADMIN, UserRoles.HR), () => {});
leaveRequestRouter.get('/getAll', authorizeRole(UserRoles.ADMIN, UserRoles.HR), () => {});
leaveRequestRouter.get('/getLeaveRequestDetail/:id', authorizeRole(UserRoles.ADMIN, UserRoles.HR), () => {});
leaveRequestRouter.delete('/deleteLeaveRequest/:id', authorizeRole(UserRoles.ADMIN, UserRoles.HR), () => {});

module.exports = leaveRequestRouter;
