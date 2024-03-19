import moment from 'moment';

export const cvTime = function (time) {
  try {
    time = time.toString();
    const identifier = time.replace(/\d+|^\s+|\s+$|-/g, '');
    let duration;
    switch (identifier) {
      case 'm':
        duration = moment.duration(time.replaceAll('m', ''), 'm').asMinutes();
        break;
      case 'h':
        duration = moment.duration(time.replaceAll('h', ''), 'h').asMinutes();
        break;
      case ':':
        duration = moment.duration(time).asMinutes();
        break;
      case '.':
        duration = moment.duration(time, 'd').asMinutes();
        break;
      case '':
        duration = moment.duration(time, 'd').asMinutes();
        break;
    }
    return duration / 1440;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const sumTime = function (...times) {
  try {
    //Convert arguments to array
    times = Array.from(times).flat();
    let sum = 0;
    let negative = false;
    if (times.length === 1) {
      if (times < 0) {
        negative = true;
        times = -times;
      }
      if (times < 0.0003) {
        times = 0;
      }
      sum = cvTime(times);
    } else {
      times.forEach((time) => {
        sum += cvTime(time);
      });
      if (sum < 0) {
        negative = true;
        sum = -sum;
      }
    }

    // Convert minutes to hours and minutes in hh:mm format
    let hours = Math.floor(sum * 24);
    let minutes = Math.round(((sum * 24) % 1) * 60);
    if (minutes === 60) {
      minutes = 0;
      hours += 1;
    }
    const prefix = negative ? '-' : '';
    if (minutes < 10) {
      return prefix + `${hours}:0${minutes}`;
    }
    return prefix + `${hours}:${minutes}`;
  } catch (error) {
    console.error(error);
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

export const friendlyDate = function (date) {
  // if date is yesterday
  if (moment(date).isSame(moment().subtract(1, 'days'), 'd')) {
    return 'Yesterday';
  }
  // if date is today
  if (moment(date).isSame(moment(), 'd')) {
    return 'Today';
  }
  // if date is tomorrow
  if (moment(date).isSame(moment().add(1, 'days'), 'd')) {
    return 'Tomorrow';
  }
  // if date is this week
  if (moment(date).isSame(moment(), 'week')) {
    return moment(date).format('dddd');
  }
  // if date is next week
  if (moment(date).isSame(moment().add(1, 'week'), 'week')) {
    return `Next ${moment(date).format('dddd')}`;
  } else {
    return date;
  }
};

export const createTimestamp = () => {
  return `${
    new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[TZ]/g, ' ')
      .trim()
      .split('.')[0]
  }`;
};
