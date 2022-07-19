import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export function calcDays(days: number) {
  const now = dayjs().tz('Asia/Seoul');

  return now.subtract(days, 'd').format('YYYY-MM-DD HH:mm:ss');
}

export function calcMs(time: string) {
  return dayjs(time).valueOf();
}
