import * as Joi from 'joi';

export function validatePaper() {
  return Joi.object({
    title: Joi.string().min(2).max(30).required().messages({
      'any.required': '제목을 입력해주세요',
      'string.min': '제목은 최소 2글자 이상입니다.',
      'string.max': '제목은 최대 30글자 이하입니다.',
    }),
    contents: Joi.string().min(5).max(10000).required().messages({
      'any.required': '내용을 입력해주세요',
      'string.min': '내용은 최소 5글자 이상입니다.',
      'string.max': '내용은 최대 10000글자 이하입니다.',
    }),
  });
}

export function validateComment() {
  return Joi.object({
    text: Joi.string().min(2).max(100).required().messages({
      'any.required': '댓글을 입력해주세요',
      'string.min': '댓글은 최소 2글자 이상입니다.',
      'string.max': '댓글은 최대 100글자 이하입니다.',
    }),
  });
}

export function validateCategory() {
  return Joi.object({
    category: Joi.string().min(1).max(15).required().messages({
      'any.required': '카테고리를 입력해주세요',
      'string.min': '카테고리는 최소 1글자 이상입니다.',
      'string.max': '카테고리는 최대 15글자 이하입니다.',
    }),
    newCategory: Joi.string().min(1).max(15).required().messages({
      'any.required': '카테고리를 입력해주세요',
      'string.min': '카테고리는 최소 1글자 이상입니다.',
      'string.max': '카테고리는 최대 15글자 이하입니다.',
    }),
  });
}
