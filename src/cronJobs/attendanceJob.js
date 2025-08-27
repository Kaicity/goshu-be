const cron = require('node-cron');
const AttendanceModel = require('../models/attendanceModel');
const EmployeeModel = require('../models/employeeModel');
const AttendanceStatus = require('../enums/attendanceStatus');
const EmployeeStatus = require('../enums/employeeStatus');
const { formatInTimeZone } = require('date-fns-tz');

const timeZone = 'Asia/Ho_Chi_Minh';

const createDailyAttendance = async () => {
  try {
    const todayVN = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd HH:mm:ss');

    const startOfDay = new Date(todayVN);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(todayVN);
    endOfDay.setHours(23, 59, 59, 999);

    // Check đã tạo cho ngày hôm nay chưa
    const exist = await AttendanceModel.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (exist) {
      console.log('Attendance records already created for today');
      return;
    }

    // Lấy tất cả nhân viên chưa nghỉ việc
    const employees = await EmployeeModel.find({
      status: { $ne: EmployeeStatus.TERMINATED },
    });

    const attendanceList = employees.map((emp) => ({
      employeeId: emp._id,
      date: startOfDay, // set date = 00:00:00 VN
      status: AttendanceStatus.ABSENT,
    }));

    await AttendanceModel.insertMany(attendanceList);
    console.log(
      `Attendance created for ${employees.length} employees, date: ${startOfDay.toISOString()} + thêm 7 tiếng ra giờ việt đó hen`,
    );
  } catch (error) {
    console.error('Error creating daily attendance:', error.message);
  }
};

// Cron chạy mỗi ngày 00:05 giờ VN
cron.schedule(
  '0 7 * * *',
  () => {
    console.log('⏰ Running daily attendance job...');
    createDailyAttendance();
  },
  {
    timezone: timeZone,
  },
);

// createDailyAttendance();
