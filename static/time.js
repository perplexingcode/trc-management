import moment from 'moment';

export const calDuration = function (start, end) {
  start = moment(start, 'YY-MM-DD hh:mm');
  end = moment(end, 'YY-MM-DD hh:mm');
  return moment.duration(end.diff(start)).asMinutes();
};
