import moment from 'moment';

export const friendlyDate = function (date) {
  const startOfWeek = moment().startOf('week').add(1, 'days'); // Adjust to make Monday the start of the week
  const endOfWeek = moment().endOf('week').add(1, 'days'); // Adjust to include Sunday as the end of the week
  const startOfNextWeek = moment()
    .add(1, 'week')
    .startOf('week')
    .add(1, 'days');
  const endOfNextWeek = moment().add(1, 'week').endOf('week').add(1, 'days');

  // if date is yesterday
  if (moment(date).isSame(moment().subtract(1, 'days'), 'day')) {
    return 'Yesterday';
  }
  // if date is today
  if (moment(date).isSame(moment(), 'day')) {
    return 'Today';
  }
  // if date is tomorrow
  if (moment(date).isSame(moment().add(1, 'days'), 'day')) {
    return 'Tomorrow';
  }
  // if date is this week, week starts on Monday
  if (moment(date).isBetween(startOfWeek, endOfWeek, 'day', '[]')) {
    // Inclusive check
    return moment(date).format('ddd');
  }
  // if date is next week, week starts on Monday
  if (moment(date).isBetween(startOfNextWeek, endOfNextWeek, 'day', '[]')) {
    // Inclusive check
    return `Next ${moment(date).format('ddd')}`;
  } else {
    return date;
  }
};

export const durationValidate = function (duration) {
  // Turn to lowercase
  duration = duration.toLowerCase();
  //Remove all characters except numbers, m, h, and :
  duration = duration.replace(/[^hm:\d]/g, '');
  //Remove additional characters
  duration = duration.replace(/(m|h|:)(?=\1)/g, '');
  return duration;
};
