const request = require('supertest');
const app = require('../../app');

const token = process.env.JEST_TOKEN || ' ';
const token1 = process.env.JEST_TOKEN1 || ' ';
require('dotenv').config();

describe('회원가입 테스트', () => {
  it('닉네임 중복검사', (done) => {
    request(app)
      .post(`/user/idcheck/${encodeURI('공백크크크크크')}`)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      })
      .catch(console.log);
  });

  it('이메일 중복검사', (done) => {
    request(app)
      .post('/user/idcheck/test1234523@naver.com')
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('회원가입', (done) => {
    request(app)
      .post('/user/signup/')
      .send({
        email: 'test123123@test.com',
        nickname: '공백123123',
        password: '12341234',
        confirmPassword: '12341234',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('회원가입 탈퇴', (done) => {
    request(app)
      .delete('/user')
      .set('Authorization', token1)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('로그인', () => {
  it('로그인', (done) => {
    request(app)
      .post('/user/login')
      .send({
        email: 'test123123@test.com',
        password: '12341234',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('마이프로필', () => {
  it('마이프로필 조회', (done) => {
    request(app)
      .get('/user/myprofile')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('마이프로필 수정', (done) => {
    request(app)
      .patch('/user/myprofile')
      .set('Authorization', token)
      .send({
        nickname: '공이크다',
        introduction: '나좀 살려줘',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('이메일 인증', () => {
  it('이메일 인증', (done) => {
    request(app)
      .post('/user/emailauth')
      .set('Authorization', token)
      .send({ email: 'mna800@naver.com' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('비밀 번호 재설정', (done) => {
    request(app)
      .patch('/user/change-password')
      .set('Authorization', token)
      .send({ password: '123456789' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});
