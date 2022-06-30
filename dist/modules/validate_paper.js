"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaper = void 0;
const Joi = require("joi");
function validatePaper() {
    return Joi.object({
        title: Joi.string().min(2).max(20).required().messages({
            'string.min': '제목은 최소 2글자입니다.',
            'string.max': '제목은 최대 20글자입니다.',
        }),
        contents: Joi.string().min(5).max(10000).required().messages({
            'string.min': '내용은 최소 5글자입니다.',
            'string.max': '내용은 최대 10000글자입니다.',
        }),
    });
}
exports.validatePaper = validatePaper;
