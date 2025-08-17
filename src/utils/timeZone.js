function getCurrentTime(date = new Date()) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000); //Gio Viet Nam + 7 tieng
}

module.exports = { getCurrentTime };
