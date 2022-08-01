const request = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../app');

//require('dotenv').config();

beforeAll(async () => {
  await sequelize.sync({ force: true }); // 가짜 ORM 생성
});

describe('회원가입 테스트', () => {
  it('호스트 회원가입 성공', (done) => {
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

  it('게스트 회원가입 성공', (done) => {
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

  it('게스트2 회원가입 성공', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'c@c.com',
        nickname: 'mincho2',
        blogId: 'mincho2',
        password: 'asdf1234',
        confirmPassword: 'asdf1234',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('호스트 로그인', (done) => {
    request(app)
      .post('/user/login')
      .send({ email: 'a@a.com', password: 'asdf1234' })
      .then((res) => {
        token = 'Bearer ' + res.body.token;
        userId = res.body.userId;
        blogId = res.body.blogId;
        expect(res.status).toBe(200);
        done();
      });
  });

  it('게스트 로그인', (done) => {
    request(app)
      .post('/user/login')
      .send({ email: 'b@b.com', password: 'asdf1234' })
      .then((res) => {
        atoken = 'Bearer ' + res.body.token;
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
        setPoint: 1,
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
  it('신청 성공', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 05 2022 13:00:00 GMT+0900',
        end: 'Tue Aug 05 2022 14:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 실패- 지나간 시간 예약', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 01 2022 08:00:00 GMT+0900',
        end: 'Tue Aug 01 2022 09:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        expect(res.text).toContain('이미 지나간 시간대에는 예약할 수 없습니다.');
        expect(res.status).toBe(400);
        done();
      });
  });
  it('나뭇잎 수정 성공- 상대방보다 더 많은 나뭇잎 보유', (done) => {
    request(app)
      .patch(`/api/booking/leaf/${userId}`)
      .send({
        setPoint: 60,
      })
      .set('Authorization', token)
      .then((res) => {
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 실패- 나뭇잎부족', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 04 2022 08:00:00 GMT+0900',
        end: 'Tue Aug 04 2022 09:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        expect(res.text).toContain('보유한 나뭇잎이 부족합니다.');
        expect(res.status).toBe(400);
        done();
      });
  });
});

describe('예약신청 실패 - 신청횟수 10개 초과', () => {
  it('나뭇잎 수정 성공', (done) => {
    request(app)
      .patch(`/api/booking/leaf/${userId}`)
      .send({
        setPoint: 0,
      })
      .set('Authorization', atoken)
      .then((res) => {
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-1', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 03 2022 08:00:00 GMT+0900',
        end: 'Tue Aug 03 2022 09:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-2', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho2',
        start: 'Tue Aug 04 2022 15:00:00 GMT+0900',
        end: 'Tue Aug 04 2022 16:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-3', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 04 2022 16:00:00 GMT+0900',
        end: 'Tue Aug 04 2022 17:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-4', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 01 2022 17:00:00 GMT+0900',
        end: 'Tue Aug 01 2022 18:00:00 GMT+0900',
      })
      .set('Authorization', token)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-5', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho1',
        start: 'Tue Aug 04 2022 18:00:00 GMT+0900',
        end: 'Tue Aug 04 2022 19:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-6', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 04 2022 19:00:00 GMT+0900',
        end: 'Tue Aug 04 2022 20:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-7', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 02 2022 09:00:00 GMT+0900',
        end: 'Tue Aug 02 2022 10:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-8', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 02 2022 10:00:00 GMT+0900',
        end: 'Tue Aug 02 2022 11:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-9', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 02 2022 12:00:00 GMT+0900',
        end: 'Tue Aug 02 2022 13:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-10', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 02 2022 13:00:00 GMT+0900',
        end: 'Tue Aug 02 2022 14:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 성공-11', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 02 2022 14:00:00 GMT+0900',
        end: 'Tue Aug 02 2022 15:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        hostId = res.body.bookingResult.hostId;
        bookingId = res.body.bookingResult.bookingId;
        guestId = res.body.bookingResult.guestId;
        expect(res.body.result).toBe(true);
        expect(res.status).toBe(200);
        done();
      });
  });
  it('신청 실패 - 호스트 예약갯수 10개 초과', (done) => {
    request(app)
      .post(`/api/booking/${blogId}`)
      .send({
        blogId: 'mincho',
        start: 'Tue Aug 03 2022 16:00:00 GMT+0900',
        end: 'Tue Aug 03 2022 17:00:00 GMT+0900',
      })
      .set('Authorization', atoken)
      .then((res) => {
        expect(res.text).toContain('예약 받을 수 있는 횟수를 초과하였습니다');
        expect(res.status).toBe(400);
        done();
      });
  });
});

// describe('예약실패2', () => {});
// it('신청 실패 - 호스트 예약신청 10개 초과', (done) => {
//   request(app)
//     .post(`/api/booking/${blogId}`)
//     .send({
//       blogId: 'mincho2',
//       start: 'Tue Aug 07 2022 08:00:00 GMT+0900',
//       end: 'Tue Aug 07 2022 09:00:00 GMT+0900',
//     })
//     .set('Authorization', atoken)
//     .then((res) => {
//       hostId = res.body.bookingResult.hostId;
//       bookingId = res.body.bookingResult.bookingId;
//       guestId = res.body.bookingResult.guestId;
//       expect(res.text).toContain('예약 받을 수 있는 횟수를 초과하였습니다.');
//       expect(res.status).toBe(400);
//       done();
//     });
// });

// describe('예약조회', () => {
//   it('조회 성공', (done) => {
//     request(app)
//       .get('/api/booking')
//       .set('Authorization', token)
//       .then((res) => {
//         expect(res.body.result).toBe(true);
//         expect(res.status).toBe(200);
//         done();
//       });
//   });
// });

// describe('호스트 예약 수락', () => {
//   it('수락 성공', (done) => {
//     request(app)
//       .patch(`/api/booking/${hostId}/${bookingId}`)
//       .set('Authorization', token)
//       .then((res) => {
//         expect(res.body.result).toBe(true);
//         expect(res.status).toBe(200);
//         done();
//       });
//   });
// });

// describe('호스트 예약 취소', () => {
//   it('호스트 취소 성공', (done) => {
//     request(app)
//       .delete(`/api/booking/host/${hostId}/${bookingId}`)
//       .set('Authorization', token)
//       .then((res) => {
//         expect(res.body.result).toBe(true);
//         expect(res.status).toBe(200);
//         done();
//       });
//   });
// });

// describe('게스트 예약 취소', () => {
//   it('게스트 예약 취소 성공', (done) => {
//     request(app)
//       .delete(`/api/booking/guest/${guestId}/${bookingId}`)
//       .set('Authorization', atoken)
//       .then((res) => {
//         expect(res.body.result).toBe(true);
//         expect(res.status).toBe(200);
//         done();
//       });
//   });
// });

afterAll(async () => {
  // 테이블을 다시 만듬 -> 기존 유저를 초기화
  await sequelize.sync({ force: true });
});
