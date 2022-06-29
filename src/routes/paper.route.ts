import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { createError } from '../modules/custom_error';
import calcOneWeek from '../modules/date';
const { Paper, User, Comment } = require('../../models');
const auth = require('../middleware/Auth');

const router = express.Router();

// 메인 페이지 조회 & 게시글 검색
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword } = req.query;

    if (keyword) {
      // 키워드를 입력하면 최신 순으로 결과 출력
      const papers = await Paper.findAll({
        where: { title: { [Op.like]: `%${keyword || ''}%` } },
        order: [['createdAt', 'DESC']],
      });

      return res.json({ papers });
    }

    let papers = await Paper.findAll({ include: { model: User, as: 'Likes' } });

    papers = papers // 1주일 간 좋아요를 많이 받은 게시글 순으로 정렬
      .map((paper: Types.Paper) => {
        const { postId, userId, title, Likes } = paper;
        const likes = Likes.filter(
          (like) => new Date(like.createdAt) > calcOneWeek()
        ).length;

        return { postId, userId, title, likes };
      })
      .sort(
        (a: Types.LikesCount, b: Types.LikesCount) => b['likes'] - a['likes']
      );

    const popularUsers = await User.findAll({
      // 인기도 순으로 유저 정렬
      order: [['popularity', 'DESC']],
      limit: 10,
      attributes: ['userId', 'nickname', 'profileImage', 'popularity'],
    });

    res.json({ papers, popularUsers });
  } catch (err) {
    next(err);
  }
});

// 개인 페이지 조회
router.get(
  '/users/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const papers = await Paper.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      const user = await User.findOne({
        where: { userId },
        attributes: ['nickname', 'profileImage', 'introduction', 'popularity'],
      });

      res.json({ papers, user });
    } catch (err) {
      next(err);
    }
  }
);

// 상세 페이지 조회
router.get(
  '/users/:userId/:postId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, postId } = req.params;

      if (!+userId || !+postId) {
        return next(createError(400, '유효하지 않은 입력값'));
      }

      const papers = await Paper.findOne({ where: { userId, postId } });
      const user = await User.findOne({
        where: { userId },
        attributes: ['nickname', 'profileImage', 'introduction', 'popularity'],
      });

      if (!user || !papers) {
        return next(createError(404, 'Not Found!'));
      }

      res.json({ papers, user });
    } catch (err) {
      next(err);
    }
  }
);

// 상세 페이지 작성
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const { userId } = res.locals.user;
    const userId = 1; // 임시로 로그인 인증 기능 제거
    const { title, contents } = req.body;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await Paper.create({ title, contents, userId });

    if (!paper) {
      return next(createError(400, '게시글 생성 실패'));
    }

    res.json({ paper });
  } catch (err) {
    next(err);
  }
});

// 상세 페이지 수정
router.patch(
  '/:postId',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = res.locals.user;
      const { title, contents } = req.body;
      const { postId } = req.params;

      if (!userId) {
        return next(createError(401, '유저 인증 실패'));
      }

      const paper = await Paper.update(
        { title, contents },
        { where: { userId, postId } }
      );

      if (!paper[0]) {
        return next(createError(400, '게시글 수정 실패'));
      }

      res.json({ result: true, title, contents });
    } catch (err) {
      next(err);
    }
  }
);

// 상세 페이지 삭제
router.delete(
  '/:postId',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = res.locals.user;
      const { postId } = req.params;

      if (!userId) {
        return next(createError(401, '유저 인증 실패'));
      }

      const paper = await Paper.destroy({ where: { userId, postId } });

      if (!paper) {
        return next(createError(404, 'Not Found!'));
      }

      res.json({ result: true });
    } catch (err) {
      next(err);
    }
  }
);

// 댓글 작성
router.post(
  '/:postId/comment',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = res.locals.user;
      const { postId } = req.params;
      const { comment } = req.body;

      if (!userId) {
        return next(createError(401, '유저 인증 실패'));
      } else if (!comment) {
        return next(createError(400, '댓글 미작성'));
      }

      const paper = await Paper.findOne({ where: { postId } });

      if (!paper) {
        return next(createError(404, 'Not Found!'));
      }

      const newComment = await Comment.create({
        comment,
        userId,
        postId: +postId,
      });

      res.json({ result: true, newComment });
    } catch (err) {
      next(err);
    }
  }
);

// 댓글 수정
router.patch(
  '/:postId/comments/:commentId',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = res.locals.user;
      const { postId, commentId } = req.params;
      const { comment } = req.body;

      if (!userId) {
        return next(createError(401, '유저 인증 실패'));
      } else if (!comment) {
        return next(createError(400, '댓글 미작성'));
      }

      const paper = await Paper.findOne({ where: { postId } });

      if (!paper) {
        return next(createError(404, 'Not Found!'));
      }

      const updatedComment = await Comment.update(
        { comment },
        { where: { userId, commentId: +commentId, postId: +postId } }
      );

      if (!updatedComment[0]) {
        return next(createError(404, 'Not Found 혹은 변경사항 없음'));
      }

      res.json({ result: true, comment });
    } catch (err) {
      next(err);
    }
  }
);

// 댓글 삭제
router.delete(
  '/:postId/comments/:commentId',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = res.locals.user;
      const { postId, commentId } = req.params;

      if (!userId) {
        return next(createError(401, '유저 인증 실패'));
      }

      const paper = await Paper.findOne({ where: { postId } });

      if (!paper) {
        return next(createError(404, 'Not Found!'));
      }

      const deletedComment = await Comment.destroy({
        where: { userId, commentId: +commentId, postId: +postId },
      });

      if (!deletedComment) {
        return next(createError(404, 'Not Found'));
      }

      res.json({ result: true });
    } catch (err) {
      next(err);
    }
  }
);

// 좋아요 등록 및 취소
router.post(
  '/:postId/likes',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = res.locals.user;
      const { postId } = req.params;

      if (!userId) {
        return next(createError(401, '유저 인증 실패'));
      }

      const paper = await Paper.findOne({ where: { postId } });

      if (!paper) {
        return next(createError(404, 'Not Found!'));
      } else if (userId === paper.userId) {
        return next(createError(400, '본인 게시글에 추천 불가'));
      }

      const liked = await paper.getLikes({ where: { userId } });

      if (liked.length) {
        await paper.removeLikes(userId);

        return res.json({ result: true, message: '좋아요 취소' });
      }

      await paper.addLikes(userId);

      res.json({ result: true, message: '좋아요 완료' });
    } catch (err) {
      next(err);
    }
  }
);

// 구독 등록 및 취소
router.post(
  '/users/:userId/subscription',
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId: myId } = res.locals.user;
      const { userId: writerId } = req.params;

      if (!myId) {
        return next(createError(401, '유저 인증 실패'));
      } else if (!+myId || !+writerId) {
        return next(createError(400, '유효하지 않은 입력값'));
      } else if (+myId === +writerId) {
        return next(createError(400, '본인 구독 불가'));
      }

      const user = await User.findOne({ where: { userId: writerId } });

      if (!user) {
        return next(createError(404, 'Not Found!'));
      }

      const subbed = await user.getFollowers({ where: { userId: myId } });

      if (subbed.length) {
        await user.removeFollowers(myId);

        return res.json({ result: true, message: '구독 취소' });
      }

      await user.addFollowers(myId);

      res.json({ result: true, message: '구독 완료' });
    } catch (err) {
    
      next(err);
    }
  }
);

export = router;
