const Router = require('express');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');
const {
  createLeaveRequest,
  approveLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestDetail,
  deleteLeaveRequest,
} = require('../controllers/leave-request.controller');

const leaveRequestRouter = new Router();

leaveRequestRouter.post('/createLeaveRequest', createLeaveRequest);
leaveRequestRouter.put('/approveLeaveRequest/:id', authorizeRole(UserRoles.ADMIN, UserRoles.HR), approveLeaveRequest);
leaveRequestRouter.get('/getAll', authorizeRole(UserRoles.ADMIN, UserRoles.HR), getAllLeaveRequests);
leaveRequestRouter.get('/getLeaveRequestDetail/:id', authorizeRole(UserRoles.ADMIN, UserRoles.HR), getLeaveRequestDetail);
leaveRequestRouter.delete('/deleteLeaveRequest/:id', authorizeRole(UserRoles.ADMIN, UserRoles.HR), deleteLeaveRequest);

module.exports = leaveRequestRouter;
