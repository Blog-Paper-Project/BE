const request = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../app');

//require('dotenv').config();

beforeAll(async () => {
  await sequelize.sync({ force: true }); // 가짜 ORM 생성
});

describe('회원가입 테스트', () => {
  it('회원가입 성공', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'a@a.com',
        nickname: 'mincho',
        blogId: 'mincho',
        password: 'asdf1234',
        confirmPassword: 'asdf1234',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('회원가입2', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'b@b.com',
        nickname: 'mincho1',
        blogId: 'mincho1',
        password: 'asdf1234',
        confirmPassword: 'asdf1234',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('로그인', (done) => {
    request(app)
      .post('/user/login')
      .send({ email: 'b@b.com', password: 'asdf1234' })
      .then((res) => {
        token = 'Bearer ' + res.body.token;
        userId = res.body.userId;
        blogId = res.body.blogId;
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('나뭇잎 수정', () => {
  it('수정 성공', (done) => {
    request(app)
      .patch(`/api/booking/leaf/${userId}`)
      .send({
        setPoint: 2,
      })
      .set('Authorization', token)
      .then((res) => {
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('예약신청', () => {
  it('로그인', (done) => {
    request(app)
      .post('/user/login')
      .send({ email: 'a@a.com', password: 'asdf1234' })
      .then((res) => {
        token = 'Bearer ' + res.body.token;
        userId = res.body.userId;
        expect(res.status).toBe(200);
        done();
      });
  });

  it('신청 성공', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Jul 29 2022 17:00:00 GMT+0900',
        end: 'Tue Jul 29 2022 18:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        console.log(res);
        // expect(res.body.result).toBe(true);
        // expect(res.status).toBe(200);
        // done();
      });
  });
});

afterAll(async () => {
  // 테이블을 다시 만듬 -> 기존 유저를 초기화
  await sequelize.sync({ force: true });
});
