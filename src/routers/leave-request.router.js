const express = require('express');
const authorizeRole = require('../middlewares/authorizeRole');
const UserRoles = require('../enums/userRoles');
const {
  createLeaveRequest,
  approveLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestDetail,
  deleteLeaveRequest,
} = require('../controllers/leave-request.controller');

const leaveRequestRouter = express.Router();

leaveRequestRouter.post('/createLeaveRequest', createLeaveRequest);
leaveRequestRouter.put('/approveLeaveRequest/:id', authorizeRole(UserRoles.HR), approveLeaveRequest);
leaveRequestRouter.get('/getAll', authorizeRole(UserRoles.EMPLOYEE, UserRoles.HR), getAllLeaveRequests);
leaveRequestRouter.get('/getLeaveRequestDetail/:id', authorizeRole(UserRoles.HR), getLeaveRequestDetail);
leaveRequestRouter.delete('/deleteLeaveRequest/:id', authorizeRole(UserRoles.HR), deleteLeaveRequest);

module.exports = leaveRequestRouter;
