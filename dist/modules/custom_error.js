"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("./winston");
function createError(status, message, userId = null) {
    winston_1.default.error(`${userId} - ${message}`);
    const error = new Error(message);
    error.status = status;
    error.result = false;
    return error;
}
exports.default = createError;
