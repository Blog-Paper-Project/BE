import { Request, Response, NextFunction } from 'express';
import { createError } from '../modules/custom_error';
import calcOneWeek from '../modules/date';
import * as paperService from '../services/paper.service';
import { validatePaper, validateComment } from '../modules/validate_paper';
const { Paper } = require('../../models');

// 메인 페이지 조회 & 게시글 검색
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

// 개인 페이지 조회
export const readBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!+userId) {
      return next(createError(400, '유효하지 않은 입력값'));
    }

    const user = await paperService.findUserInfo(userId);

    if (!user) {
      return next(createError(404, 'Not Found!'));
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// 미니 프로필 조회
export const readMiniProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = res.locals?.user?.userId;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const user = await paperService.findMiniInfo(userId);

    if (!user) {
      return next(createError(404, 'Not Found!'));
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// 상세 페이지 조회
export const readPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, postId } = req.params;

    if (!+userId || !+postId) {
      return next(createError(400, '유효하지 않은 입력값'));
    }

    const paper = await paperService.findPostInfo(postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    res.json({ paper });
  } catch (err) {
    next(err);
  }
};

// 상세 페이지 작성
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { title, contents } = req.body;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const schema = validatePaper();

    await schema.validateAsync({ title, contents });

    const paper = await paperService.createPost(title, contents, userId);

    if (!paper) {
      return next(createError(400, '게시글 생성 실패'));
    }

    await paperService.updatePoint(userId);

    res.json({ paper });
  } catch (err) {
    next(err);
  }
};

// 상세 페이지 이미지 첨부
export const createImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file as { transforms?: { key?: string }[] };
    console.log(file);
    if (!file?.transforms) {
      return next(createError(400, '이미지 등록 오류 발생'));
    }

    res.json({ result: true, imageUrl: file.transforms[0].key });
  } catch (err) {
    next(err);
  }
};

// 상세 페이지 수정
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { title, contents } = req.body;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    if (!+userId || !+postId) {
      return next(createError(400, '유효하지 않은 입력값'));
    }

    const schema = validatePaper();

    await schema.validateAsync({ title, contents });

    const paper = await paperService.updatePost(title, contents, userId, postId);

    if (!paper[0]) {
      return next(createError(400, '게시글 수정 실패'));
    }

    res.json({ result: true, title, contents });
  } catch (err) {
    next(err);
  }
};

// 상세 페이지 삭제
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    if (!+postId) {
      return next(createError(400, '유효하지 않은 입력값'));
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

// 댓글 작성
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId } = req.params;
    const { text } = req.body;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    } else if (!text) {
      return next(createError(400, '내용을 입력해주세요'));
    }

    const schema = validateComment();

    await schema.validateAsync({ text });

    const paper = await Paper.findOne({ where: { postId } });

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    const comment = await paperService.createComment(text, userId, postId);

    res.json({ result: true, comment });
  } catch (err) {
    next(err);
  }
};

// 댓글 수정
export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!+userId) {
      return next(createError(401, '유저 인증 실패'));
    } else if (!text) {
      return next(createError(400, '내용을 입력해주세요'));
    }

    const schema = validateComment();

    await schema.validateAsync({ text });

    const paper = await paperService.findPost(postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    const updatedComment = await paperService.updateComment(
      text,
      commentId,
      userId,
      postId
    );

    if (!updatedComment[0]) {
      return next(createError(404, 'Not Found 혹은 변경사항 없음'));
    }

    res.json({ result: true, text });
  } catch (err) {
    next(err);
  }
};

// 댓글 삭제
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId, commentId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await paperService.findPost(postId);

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

// 좋아요 등록 및 취소
export const createLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, '유저 인증 실패'));
    }

    const paper = await paperService.findPost(postId);

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

// 구독 등록 및 취소
export const createSubs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const myId = res.locals?.user?.userId;
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

    const subbed = await user.getFollowees({ where: { userId: myId } });

    if (subbed.length) {
      await user.removeFollowees(myId);

      return res.json({ result: true, message: '구독 취소' });
    }

    await user.addFollowees(myId);

    res.json({ result: true, message: '구독 완료' });
  } catch (err) {
    next(err);
  }
};
