const request = require('supertest');
const app = require('../../app');

require('dotenv').config();

let token;

test('로그인', () => {
  return request(app)
    .post('/user/login')
    .send({ email: 'test1235@naver.com', password: '12345678' })
    .then((res) => {
      token = 'Bearer ' + res.body.token;
      expect(res.status).toBe(200);
    });
});

// describe('review', () => {
//   it('리뷰작성', () => {
//     return request(app)
//       .post('/api/review/2')
//       .send({ review: '굿굿', rate: 1 })
//       .set('Authorization', token)
//       .then((req, res) => {
//         const { reviews } = req.body;
//         // expect(reviews.review).toBe('굿굿');
//         //expect(reviews.rate).toBe(1);
//         expect(res.status).toBe(200);
//       });
//   });
// });
