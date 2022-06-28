"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
function createError(status, message, userId = null) {
    // logger.error(`${userId} - ${message}`);
    const error = new Error(message);
    error.status = status;
    error.success = false;
    return error;
}
exports.createError = createError;
