"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const WinstonDaily = require("winston-daily-rotate-file");
const { combine, timestamp, printf } = winston.format;
const logFormat = printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});
exports.default = winston.createLogger({
    format: combine(timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), logFormat),
    transports: [
        new WinstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs/info',
            filename: `%DATE%.info.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
        new WinstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: 'logs/error',
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
});
