import moment from 'moment';

export const cvTime = function (time) {
  try {
    time = time.toString();
    const identifier = time.replace(/\d+|^\s+|\s+$/g, '');
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
    return duration;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const sumTime = function (...times) {
  try {
    //Convert arguments to array
    times = Array.from(times).flat();
    let sum = 0;
    if (times.length === 1) {
      sum = cvTime(times);
    } else {
      times.forEach((time) => {
        sum += cvTime(time);
      });
    }
    // Convert minutes to hours and minutes in hh:mm format
    const hours = Math.floor(sum / 60);
    const minutes = Math.round(sum % 60);
    if (minutes < 10) {
      return `${hours}:0${minutes}`;
    }
    return `${hours}:${minutes}`;
  } catch (error) {
    console.log(error);
  }
};
