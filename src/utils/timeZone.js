function eachDayOfMonthUTC(year, month) {
  const days = [];

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  for (let d = start; d <= end; ) {
    days.push(new Date(d)); // clone tránh mutate
    // tăng ngày theo UTC để không lệch timezone
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  }

  return days;
}

module.exports = { eachDayOfMonthUTC };
