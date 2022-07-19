const request = require('supertest');
const app = require('../../app');

let token;
let postId;
let commentId;

describe('로그인 후 토큰 발급', () => {
  it('로그인', (done) => {
    request(app)
      .post('/user/login')
      .send({ email: 'testbot@naver.com', password: 'test1234' })
      .then((res) => {
        token = 'Bearer ' + res.body.token;
        expect(res.status).toBe(200);
        done();
      });
  });
});

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
  it('게시글 작성 500', (done) => {
    request(app)
      .post('/api/paper')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  it('게시글 작성', (done) => {
    request(app)
      .post('/api/paper')
      .send({
        title: 'Jest 테스트 중',
        contents: '성공인가?',
        category: 'sports',
        tags: ['tag1', 'tag2'],
      })
      .set('Authorization', token)
      .then((res) => {
        const { paper } = res.body;
        postId = paper.postId;
        expect(paper.title).toBe('Jest 테스트 중');
        expect(paper.contents).toBe('성공인가?');
        expect(paper.category).toBe('sports');
        expect(res.status).toBe(200);
        done();
      });
  });

  it('게시글 수정 400', (done) => {
    request(app)
      .patch(`/api/paper/abc`)
      .send({ title: 'Jest 수정 중', contents: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('게시글 수정 500', (done) => {
    request(app)
      .patch(`/api/paper/${postId}`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  it('게시글 수정 404', (done) => {
    request(app)
      .patch(`/api/paper/9999999`)
      .send({ title: 'Jest 수정 중', contents: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
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
      .get(`/api/paper/testbot/999999`)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('게시글 조회', (done) => {
    request(app)
      .get(`/api/paper/testbot/${postId}`)
      .then((res) => {
        const { title, contents } = res.body.paper;

        expect(title).toBe('Jest 수정 중');
        expect(contents).toBe('수정 성공?');
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('개인 페이지 테스트', () => {
  it('개인 페이지 조회 404', (done) => {
    request(app)
      .get('/api/paper/testbot9999999')
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('개인 페이지 조회', (done) => {
    request(app)
      .get('/api/paper/testbot')
      .then((res) => {
        console.log(res.body);
        expect(res.status).toBe(200);
        done();
      });
  });

  it('개인 페이지 카테고리 수정 404', (done) => {
    request(app)
      .patch('/api/paper/testbot/categories/travel')
      .send({ newCategory: '스포츠' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('개인 페이지 카테고리 수정', (done) => {
    request(app)
      .patch('/api/paper/testbot/categories/sports')
      .send({ newCategory: '스포츠' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('댓글 테스트', () => {
  it('댓글 작성 500', (done) => {
    request(app)
      .post(`/api/paper/${postId}/comments`)
      .send({ text: '1' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(500);
        done();
      });
  });

  it('댓글 작성', (done) => {
    request(app)
      .post(`/api/paper/${postId}/comments`)
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

  it('댓글 수정 404', (done) => {
    request(app)
      .patch(`/api/paper/${postId}/comments/9999999`)
      .send({ text: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('댓글 수정', (done) => {
    request(app)
      .patch(`/api/paper/${postId}/comments/${commentId}`)
      .send({ text: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.body.text).toBe('수정 성공?');
        expect(res.status).toBe(200);
        done();
      });
  });

  it('댓글 삭제 404', (done) => {
    request(app)
      .delete(`/api/paper/${postId}/comments/9999999`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('댓글 삭제', (done) => {
    request(app)
      .delete(`/api/paper/${postId}/comments/${commentId}`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('좋아요 & 구독 테스트', () => {
  it('좋아요 400', (done) => {
    request(app)
      .post(`/api/paper/${postId}/likes`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('구독 400', (done) => {
    request(app)
      .post(`/api/paper/testbot1/subscription`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });
});

describe('게시글 삭제', () => {
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
