const request = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../app');

require('dotenv').config();

let token;

beforeAll(async () => {
  jest.setTimeout(20000);
  await sequelize.sync({ force: true }); // 가짜 ORM 생성
});

describe('회원가입 테스트', () => {
  it('회원가입 성공', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'mna801@naver.com',
        nickname: '공백13',
        blogId: 'serqweqwe',
        password: '123456789',
        confirmPassword: '123456789',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
  it('회원가입(중복 검사용)', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'mna701@naver.com',
        nickname: '염라대왕',
        blogId: 'serq',
        password: '123456789',
        confirmPassword: '123456789',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('회원가입 실패', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'mna800@naver.com',
        nickname: '공백13',
        blogId: 'serqweqwe',
        password: '12341234',
        confirmPassword: '12341234',
      })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });
});

describe('중복검사', () => {
  it('닉네임 중복검사 사용가능', (done) => {
    request(app)
      .post('/user/idcheck')
      .send({ nickname: '공백크' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('닉네임 중복검사 이미 사용중', (done) => {
    request(app)
      .post('/user/idcheck')
      .send({ nickname: '공백13' })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('blogId 중복검사 사용가능', (done) => {
    request(app)
      .post('/user/blogid')
      .send({ blogId: 'zxcvasd' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('blogId 중복검사 이미 사용중', (done) => {
    request(app)
      .post('/user/blogid')
      .send({ blogId: 'serqweqwe' })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('이메일 중복검사 사용가능', (done) => {
    request(app)
      .post('/user/idcheck')
      .send({ email: 'mna999@test.com' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('이메일 중복검사 이미 사용중', (done) => {
    request(app)
      .post('/user/idcheck')
      .send({ email: 'mna801@naver.com' })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });
});
describe('로그인', () => {
  it('로그인 성공', (done) => {
    request(app)
      .post('/user/login')
      .send({
        email: 'mna801@naver.com',
        password: '123456789',
      })
      .then((res) => {
        token = 'Bearer ' + res.body.token;
        expect(res.status).toBe(200);
        done();
      });
  });

  it('로그인 실패', (done) => {
    request(app)
      .post('/user/login')
      .send({
        email: 'mna800@naver.com',
        password: '123456789',
      })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });
});

describe('계정', () => {
  it('계정 탈퇴', (done) => {
    request(app)
      .patch('/user/delete')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('계정 복구', (done) => {
    request(app)
      .patch('/user/restore')
      .send({
        email: 'mna801@naver.com',
        password: '123456789',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('계정 복구 실패', (done) => {
    request(app)
      .patch('/user/restore')
      .send({
        email: 'mna800@naver.com',
        password: '123456789',
      })
      .then((res) => {
        expect(res.status).toBe(400);
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
        nickname: '염라크대왕',
        introduction: '지옥에서 돌아왔다.',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
  it('마이프로필 수정 실패(닉네임)', (done) => {
    request(app)
      .patch('/user/myprofile')
      .set('Authorization', token)
      .send({
        nickname: '염라대왕',
        introduction: '지옥에서 돌아왔다.',
      })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });
});

describe('비로그인시 이메일 인증', () => {
  it('이메일 인증', (done) => {
    request(app)
      .post('/user/emailauth')
      .send({ email: 'mna800@naver.com' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  // it('이메일 인증체크(성공시)', (done) => {
  //   request(app)
  //     .post('/user/check-emailauth')
  //     .send({ email: 'mna800@naver.com', emailAuth: emailAuthch })
  //     .then((res) => {
  //       expect(res.status).toBe(400);
  //       done();
  //     });
  // });

  it('이메일 인증체크(실패시)', (done) => {
    request(app)
      .post('/user/check-emailauth')
      .send({ email: 'mna800@naver.com', emailAuth: '1234' })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('비밀 번호 재설정', (done) => {
    request(app)
      .patch('/user/change-password')
      .send({ email: 'mna800@naver.com', password: '1234567890' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('로그인시 이메일 인증', () => {
  it('이메일 인증', (done) => {
    request(app)
      .post('/user/login/emailauth')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  // it('이메일 인증체크(성공시)', (done) => {
  //   request(app)
  //     .post('/user/login/check-emailauth')
  //     .set('Authorization', token)
  //     .send({ emailAuth: emailAuthch })
  //     .then((res) => {
  //       expect(res.status).toBe(400);
  //       done();
  //     });
  // });

  it('이메일 인증체크(실패시)', (done) => {
    request(app)
      .post('/user/login/check-emailauth')
      .set('Authorization', token)
      .send({ emailAuth: '1234' })
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('비밀 번호 재설정', (done) => {
    request(app)
      .patch('/user/login/change-password')
      .set('Authorization', token)
      .send({ password: '1234567890' })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('로그아웃', () => {
  it('로그아웃', (done) => {
    request(app)
      .post('/user/logout')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

// afterAll(async () => {
//   // 테이블을 다시 만듬 -> 기존 유저를 초기화
//   await sequelize.sync({ force: true });
// });
