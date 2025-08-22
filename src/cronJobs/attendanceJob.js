const cron = require('node-cron');
const AttendanceModel = require('../models/attendanceModel');
const EmployeeModel = require('../models/employeeModel');
const AttendanceStatus = require('../enums/attendanceStatus');
const EmployeeStatus = require('../enums/employeeStatus');

const createDailyAttendance = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check đã tạo cho ngày hôm nay chưa
    const exist = await AttendanceModel.findOne({ date: today });
    if (exist) {
      console.log('Attendance records already created for today');
      return;
    }

    const employees = await EmployeeModel.find({
      status: { $ne: EmployeeStatus.TERMINATED }, // Lấy tất cả nhân viên có status KHÁC TERMINATED
    });

    const attendanceList = employees.map((emp) => ({
      employeeId: emp._id,
      date: today,
      status: AttendanceStatus.ABSENT, // mặc định là vắng
    }));

    await AttendanceModel.insertMany(attendanceList);
    console.log(`Attendance created for ${employees.length} employees`);
  } catch (error) {
    console.error('Error creating daily attendance:', error.message);
  }
};

// Lên lịch chạy mỗi ngày lúc 00:05
cron.schedule('17 17 * * *', () => {
  console.log('⏰ Running daily attendance job...');
  createDailyAttendance();
});
