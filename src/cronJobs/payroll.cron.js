import cron from 'node-cron';
import { createPayrollForAllEmployeesService } from '../services/payroll.service';

// Lập lịch chạy Cron cho bảng lương lúc 23:59 và xét tháng điều kiện tháng 28 hoặc 31.
cron.schedule('59 23 28-31 * *', async () => {
  const now = new Date();

  // Chỉ chạy nếu là ngày cuối tháng
  const isLastDay = now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (!isLastDay) return;

  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  console.log(`Generating payroll for ${month}/${year}`);

  try {
    await createPayrollForAllEmployeesService(year, month);
    console.log('Payroll created successfully');
  } catch (err) {
    console.error('Payroll cron failed:', err.message);
  }
});
