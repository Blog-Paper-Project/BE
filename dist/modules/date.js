"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcMs = exports.calcDays = void 0;
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs.extend(timezone);
function calcDays(days) {
    const now = dayjs().tz('Asia/Seoul');
    return now.subtract(days, 'd').format('YYYY-MM-DD HH:mm:ss');
}
exports.calcDays = calcDays;
function calcMs(time) {
    return dayjs(time).valueOf();
}
exports.calcMs = calcMs;
