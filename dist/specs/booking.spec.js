const request = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../app');
const { authorize } = require('passport');

require('dotenv').config();

beforeAll(async () => {
  await sequelize.sync(); // 가짜 ORM 생성
});

let token;
let bookingId;

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
});

describe('예약 신청', () => {
  it('예약신청 테스트 500', (done) => {
    request(app)
      .post('api/booking')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  it('신청 성공', (done) => {
    request(app)
      .post('/api/booking/mincho1')
      .send({
        blogId: 'mincho1',
        start: 'Tue Jul 26 2022 17:11:00 GMT+0900',
        end: 'Tue Jul 26 2022 17:12:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        const { booking } = res.body;
        expect(booking.blogId).toBe('mincho');
        expect(booking.start).toBe('Tue Jul 26 2022 17:11:00 GMT+0900');
        expect(booking.end).toBe('Tue Jul 26 2022 17:12:00 GMT+0900');
        done();
      });
  });
});

afterAll(async () => {
  // 테이블을 다시 만듬 -> 기존 유저를 초기화
  await sequelize.sync({ force: true });
});
