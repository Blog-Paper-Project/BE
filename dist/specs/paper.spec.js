const request = require('supertest');
const { sequelize } = require('../../models');
const app = require('../../app');

let token;
let postId;
let commentId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('회원가입 및 로그인 후 토큰 발급', () => {
  it('회원가입', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'testbot@naver.com',
        nickname: '테스트봇',
        blogId: 'testbot',
        password: 'test1234',
        confirmPassword: 'test1234',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('회원가입(구독 테스트용)', (done) => {
    request(app)
      .post('/user/signup')
      .send({
        email: 'testbot1@naver.com',
        nickname: '테스트봇1',
        blogId: 'testbot1',
        password: 'test1234',
        confirmPassword: 'test1234',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

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
      .get('/api/paper')
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

  it('마이 피드 조회', (done) => {
    request(app)
      .get('/api/paper/myfeed')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('게시글 테스트', () => {
  it('게시글 작성 실패 - 제목 없음', (done) => {
    request(app)
      .post('/api/paper')
      .set('Authorization', token)
      .send({
        contents: '성공인가?',
        category: 'sports',
        tags: ['tag1', 'tag2'],
      })
      .then((res) => {
        expect(res.text).toContain('제목을 입력해주세요');
        expect(res.status).toBe(500);
        done();
      });
  });

  it('게시글 작성 실패 - 내용 없음', (done) => {
    request(app)
      .post('/api/paper')
      .set('Authorization', token)
      .send({
        title: 'Jest 테스트 중',
        category: 'sports',
        tags: ['tag1', 'tag2'],
      })
      .then((res) => {
        expect(res.text).toContain('내용을 입력해주세요');
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

  it('게시글 수정 실패 - 잘못된 게시글 번호', (done) => {
    request(app)
      .patch('/api/paper/abc')
      .send({ title: 'Jest 수정 중', contents: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(400);
        done();
      });
  });

  it('게시글 수정 실패 - 제목 글자수 미달', (done) => {
    request(app)
      .patch(`/api/paper/${postId}`)
      .send({ title: '?', contents: '수정 성공?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.text).toContain('제목은 최소 2글자 이상입니다.');
        expect(res.status).toBe(500);
        done();
      });
  });

  it('게시글 수정 실패 - 게시글 없음', (done) => {
    request(app)
      .patch('/api/paper/9999999')
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

  it('게시글 조회 실패 - 게시글 없음', (done) => {
    request(app)
      .get('/api/paper/testbot/999999')
      .set('userId', 1)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('게시글 조회', (done) => {
    request(app)
      .get(`/api/paper/testbot/${postId}`)
      .set('userId', 1)
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
  it('개인 페이지 조회 실패 - 유저 없음', (done) => {
    request(app)
      .get('/api/paper/testbot999999')
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('개인 페이지 조회', (done) => {
    request(app)
      .get('/api/paper/testbot')
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('개인 카테고리 조회', (done) => {
    request(app)
      .get('/api/paper/categories')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('개인 카테고리 수정 실패 - 카테고리 없음', (done) => {
    request(app)
      .patch('/api/paper/categories/travel')
      .send({ newCategory: '스포츠' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('개인 카테고리 수정 실패 - 카테고리 글자수 초과', (done) => {
    request(app)
      .patch('/api/paper/categories/travel')
      .send({ newCategory: 'EPL PREMIER LEAGUE 2022' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.text).toContain('카테고리는 최대 15글자 이하입니다.');
        expect(res.status).toBe(500);
        done();
      });
  });

  it('개인 카테고리 수정', (done) => {
    request(app)
      .patch('/api/paper/categories/sports')
      .send({ newCategory: '스포츠' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('댓글 테스트', () => {
  it('댓글 작성 실패 - 게시글 없음', (done) => {
    request(app)
      .post('/api/paper/999999/comments')
      .send({ text: '성공인가?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('댓글 작성 실패 - 내용 없음', (done) => {
    request(app)
      .post(`/api/paper/${postId}/comments`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.text).toContain('댓글을 입력해주세요');
        expect(res.status).toBe(500);
        done();
      });
  });

  it('댓글 작성 실패 - 내용 글자수 미달', (done) => {
    request(app)
      .post(`/api/paper/${postId}/comments`)
      .send({ text: '?' })
      .set('Authorization', token)
      .then((res) => {
        expect(res.text).toContain('댓글은 최소 2글자 이상입니다.');
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

  it('댓글 수정 실패 - 댓글 없음', (done) => {
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

  it('댓글 삭제 실패 - 댓글 없음', (done) => {
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
  it('좋아요 실패 - 게시글 없음', (done) => {
    request(app)
      .post(`/api/paper/999999/likes`)
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('구독 실패 - 유저 없음', (done) => {
    request(app)
      .post('/api/paper/testbot2/subscription')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
        done();
      });
  });

  it('구독', (done) => {
    request(app)
      .post('/api/paper/testbot1/subscription')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(200);
        done();
      });
  });
});

describe('게시글 삭제', () => {
  it('게시글 삭제 실패 - 게시글 없음', (done) => {
    request(app)
      .delete('/api/paper/999999')
      .set('Authorization', token)
      .then((res) => {
        expect(res.status).toBe(404);
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

afterAll(async () => {
  await sequelize.sync({ force: true });
});
