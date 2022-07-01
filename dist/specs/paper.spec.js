const request = require('supertest');
const app = require('../../app');

require('dotenv').config();

const token = process.env.JEST_TOKEN || ' ';
let postId;
let commentId;

describe('페이지 조회 테스트', () => {
  it('메인 페이지 조회', (done) => {
    request(app)
      .get('/api/paper/')
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('게시글 검색', (done) => {
    request(app)
      .get('/api/paper?keyword=abc')
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('개인 페이지 조회', (done) => {
    request(app)
      .get('/api/paper/users/1')
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('개인 페이지 조회(404)', (done) => {
    request(app)
      .get('/api/paper/users/999')
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('미니 프로필 조회', (done) => {
    request(app)
      .get('/api/paper/miniprofile')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('게시글 테스트', () => {
  it('게시글 작성', (done) => {
    request(app)
      .post('/api/paper')
      .send({ title: 'Jest 테스트 중', contents: '성공인가?' })
      .set('Authorization', token)
      .then((res) => {
        const { paper } = res.body;
        postId = paper.postId;
        expect(paper.title).toBe('Jest 테스트 중');
        expect(paper.contents).toBe('성공인가?');
        expect(res.status).toBe(200);
        done();
      });
  });

  it('게시글 수정', (done) => {
    request(app)
      .patch(`/api/paper/${postId}`)
      .send({ title: 'Jest 수정 중', contents: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        const { title, contents } = res.body;

        expect(title).toBe('Jest 수정 중');
        expect(contents).toBe('수정 성공?');
        expect(res.status).toBe(200);
        done();
      });
  });

  it('게시글 조회', (done) => {
    request(app)
      .get(`/api/paper/users/2/${postId}`)
      .then((res) => {
        const { title, contents } = res.body.paper;

        expect(title).toBe('Jest 수정 중');
        expect(contents).toBe('수정 성공?');
        expect(res.status).toBe(200);
        done();
      });
  });

  it('게시글 삭제', (done) => {
    request(app)
      .delete(`/api/paper/${postId}`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('댓글 테스트', () => {
  it('댓글 작성', (done) => {
    request(app)
      .post('/api/paper/2/comments')
      .send({ text: '성공인가?' })
      .set('Authorization', token)
      .then((res) => {
        const { comment } = res.body;
        commentId = comment.commentId;
        expect(comment.text).toBe('성공인가?');
        expect(res.status).toBe(200);
        done();
      });
  });

  it('댓글 수정', (done) => {
    request(app)
      .patch(`/api/paper/2/comments/${commentId}`)
      .send({ text: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.body.text).toBe('수정 성공?');
        expect(res.status).toBe(200);
        done();
      });
  });

  it('댓글 삭제', (done) => {
    request(app)
      .delete(`/api/paper/2/comments/${commentId}`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('좋아요 & 구독 테스트', () => {
  it('좋아요', (done) => {
    request(app)
      .post(`/api/paper/4/likes`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('구독', (done) => {
    request(app)
      .post(`/api/paper/users/2/subscription`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});
