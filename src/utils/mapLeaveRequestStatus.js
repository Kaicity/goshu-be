const LeaveRequestStatus = require('../enums/leaveRequestStatus');

const mapLeaveRequestStatus = (status) => {
  switch (status) {
    case LeaveRequestStatus.APPROVED:
      return 'Đã phê duyệt';
    case LeaveRequestStatus.REJECTED:
      return 'Từ chối';
    case LeaveRequestStatus.PENDING:
      return 'Đang chờ duyệt';
    default:
      return status || 'Không xác định';
  }
};

module.exports = mapLeaveRequestStatus;
