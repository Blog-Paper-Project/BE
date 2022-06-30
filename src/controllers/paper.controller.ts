import { Request, Response, NextFunction } from 'express';
import { loggers } from 'winston';
import { createError } from '../modules/custom_error';
import calcOneWeek from '../modules/date';
import * as paperService from '../services/paper.service';
const { Paper } = require('../../models');

export const readMain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword } = req.query as { keyword: string };

    if (keyword) {
      // 키워드를 입력하면 최신 순으로 결과 출력
      const papers = await paperService.findPostsBy(keyword);

      return res.json({ papers });
    }

    let papers = await paperService.findAllPosts();

    papers = papers // 1주일 간 좋아요를 많이 받은 게시글 순으로 정렬
      .map((paper: Types.Paper) => {
        const { postId, userId, title, Likes } = paper;
        const likes = Likes.filter(
          (like) => new Date(like.createdAt) > calcOneWeek()
        ).length;

        return { postId, userId, title, likes };
      })
      .sort((a: Types.LikesCount, b: Types.LikesCount) => b['likes'] - a['likes']);

    const popularUsers = await paperService.findBestUsers();

    res.json({ papers, popularUsers });
  } catch (err) {
    next(err);
  }
};

export const readBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!+userId) {
      return next(createError(400, '유효하지 않은 입력값'));
    }

    const papers = await paperService.findUserPosts(userId);
    const user = await paperService.findUser(userId);

    res.json({ papers, user });
  } catch (err) {
    next(err);
  }
};

export const readPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, postId } = req.params;

    if (!+userId || !+postId) {
      return next(createError(400, '유효하지 않은 입력값'));
    }

    const papers = await paperService.findUserPost(postId, userId);
    const user = await paperService.findUser(userId);

    if (!user || !papers) {
      return next(createError(404, 'Not Found!'));
    }

    res.json({ papers, user });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const userId = +res.locals?.user?.userId;
    const userId = 1; // 임시로 로그인 인증 기능 제거
    const { title, contents } = req.body;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await paperService.createPost(title, contents, userId);

    if (!paper) {
      return next(createError(400, '게시글 생성 실패'));
    }

    res.json({ paper });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = res.locals.user;
    const { title, contents } = req.body;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await paperService.updatePost(title, contents, userId, postId);

    if (!paper[0]) {
      return next(createError(400, '게시글 수정 실패'));
    }

    res.json({ result: true, title, contents });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await paperService.destroyPost(userId, postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    res.json({ result: true });
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
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

    const newComment = await paperService.createComment(comment, userId, postId);

    res.json({ result: true, newComment });
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    if (!+userId) {
      return next(createError(401, '유저 인증 실패'));
    } else if (!comment) {
      return next(createError(400, '댓글 미작성'));
    }

    const paper = await paperService.findUserPost(postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    const updatedComment = await paperService.updateComment(
      comment,
      commentId,
      userId,
      postId
    );

    if (!updatedComment[0]) {
      return next(createError(404, 'Not Found 혹은 변경사항 없음'));
    }

    res.json({ result: true, comment });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await paperService.findUserPost(postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    const deletedComment = await paperService.destroyComment(commentId, userId, postId);

    if (!deletedComment) {
      return next(createError(404, 'Not Found'));
    }

    res.json({ result: true });
  } catch (err) {
    next(err);
  }
};

export const createLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await paperService.findUserPost(postId);

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
};

export const createSubs = async (req: Request, res: Response, next: NextFunction) => {
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

    const user = await paperService.findUser(writerId);

    if (!user) {
      return next(createError(404, 'Not Found!'));
    }
    console.log(user);
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
};
