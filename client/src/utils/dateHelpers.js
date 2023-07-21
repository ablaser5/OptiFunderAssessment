/**
 * Converts a datetime string into a time string. ex: 10:30 AM, 12:00 PM
 *
 * @param {string} datetime_string - The datetime string to be converted.
 * @returns {string} - The time extracted from the datetime string, formatted in 'en-US' locale with '2-digit' hour and minute.
 */
const dateToTime = (datetime_string) => {
  let date = new Date(datetime_string);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Returns the current date in the format MM-DD-YYYY.
 *
 * @returns {string} - The current date in the format MM-DD-YYYY.
 */
const currentDate = () => {
  let date = new Date();
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}

/**
 * Returns the current day of the week.
 *
 * @returns {string} - The current day of the week, formatted in 'en-US' locale.
 */
const currentWeekday = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

export {
  dateToTime,
  currentDate,
  currentWeekday
};