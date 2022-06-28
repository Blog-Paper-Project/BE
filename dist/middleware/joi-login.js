const Joi = require('joi');

const AuthScheam = Joi.object({
  email: Joi.string()
    .empty()
    .email()
    .required()
    .messages({ 'string.empty': '이메일을 입력해 주세요' }),
  password: Joi.string().empty().required().messages({
    'any.required': '패스워드를 입력해주세요.',
    'string.empty': '패스워드를 입력해주세요',
  }),
});

module.exports = AuthScheam;
