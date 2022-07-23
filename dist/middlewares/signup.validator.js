const Joi = require('joi');

const UsersSchema = Joi.object({
  nickname: Joi.string()
    .min(3)
    .max(15)
    .empty()
    .pattern(new RegExp(/^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/)) // 닉네임은 한글,알파벳 대소문자 (a~z, A~Z), 숫자(0~9)로 구성
    .required()
    .messages({
      'string.min': '3글자 ~ 15글자 이내로 작성해주세요',
      'string.max': '3글자 ~ 15글자 이내로 작성해주세요',
      'string.empty': '닉네임 입력해주세요',
      'string.pattern.base': '한글,숫자, 알파벳 대소문자로 입력해주세요',
    }),
  blogId: Joi.string().min(2).max(15).empty().required().messages({
    'string.min': '2글자 ~ 15글자 이내로 작성해주세요',
    'string.max': '2글자 ~ 15글자 이내로 작성해주세요',
    'string.empty': '블로그 주소 아이디를 입력해주세요',
  }),
  email: Joi.string().email().empty().required().messages({
    'string.email': '이메일 형식 아닙니다',
    'string.empty': '이메일을 입력해주세요',
  }),
  password: Joi.string()
    .min(8)
    .max(20)
    .empty()
    .pattern(new RegExp(/^[a-z|A-Z|0-9]+$/)) // 알파벳 대소문자 (a~z, A~Z), 숫자(0~9)로 구성
    .required()
    .messages({
      'string.min': '8글자 ~ 20글자 이내로 작성해주세요',
      'string.max': '8글자 ~ 20글자 이내로 작성해주세요',
      'string.empty': '패스워드를 입력해주세요',
      'string.pattern.base': '숫자,알파벳 대소문자로 입력해주세요',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': '비밀번호가 일치하지 않습니다.',
  }),
  // password 일치하는지
});
module.exports = UsersSchema;
