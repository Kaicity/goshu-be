/**
 * Kiểm tra không cho phép tạo lịch cho năm/tháng đã qua
 * @param year Năm cần kiểm tra
 * @param month Tháng cần kiểm tra (1-12)
 */
export function validateFutureSchedule(year, month) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    const err = new Error('Không được phép tạo lịch cho năm đã qua');
    err.statusCode = 400;
    throw err;
  }

  if (year === currentYear && month < currentMonth) {
    const err = new Error('Không được phép tạo lịch cho tháng đã qua');
    err.statusCode = 400;
    throw err;
  }
}
