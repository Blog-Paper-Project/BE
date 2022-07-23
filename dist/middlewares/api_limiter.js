"use strict";
const express_rate_limit_1 = require("express-rate-limit");
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    handler(req, res) {
        res.status(429).json({ message: 'Too Many Requests' });
    },
});
module.exports = apiLimiter;
