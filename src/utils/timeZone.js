function getCurrentTimeVN(date = new Date()) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000); //Gio Viet Nam + 7 tieng
}

function getCurrentTimeUTC(date = new Date()) {
  return new Date(date.getTime() - 7 * 60 * 60 * 1000);
}

module.exports = { getCurrentTimeVN, getCurrentTimeUTC };
