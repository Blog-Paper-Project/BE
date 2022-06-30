"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
const winston_1 = require("./winston");
function createError(status, message, userId = null) {
    winston_1.logger.error(`${userId} - ${message}`);
    const error = new Error(message);
    error.status = status;
    error.success = false;
    return error;
}
exports.createError = createError;
