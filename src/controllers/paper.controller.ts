import { Request, Response, NextFunction } from 'express';
import createError from '../modules/custom_error';
import calcOneWeek from '../modules/date';
import * as PaperService from '../services/paper.service';
import { validatePaper, validateComment } from '../modules/validate_paper';

const { Paper } = require('../../models');

// 메인 페이지 조회 & 게시글 검색
export const readMain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword } = req.query as { keyword: string };

    if (keyword) {
      // 키워드를 입력하면 최신 순으로 결과 출력
      const papers = await PaperService.findPostsBy(keyword);

      return res.json({ papers });
    }

    let papers = await PaperService.findAllPosts();

    papers = papers // 1주일 간 좋아요를 많이 받은 게시글 순으로 정렬
      .map((paper: Types.Paper) => {
        const { postId, userId, title, thumbnail, Likes } = paper;
        const likes = Likes.filter(
          (like) => new Date(like.createdAt) > calcOneWeek()
        ).length;

        return { postId, userId, title, thumbnail, likes };
      })
      .sort((a: Types.LikesCount, b: Types.LikesCount) => b.likes - a.likes);

    const popularUsers = await PaperService.findBestUsers();

    return res.json({ papers, popularUsers });
  } catch (err) {
    return next(err);
  }
};

// 개인 페이지 조회
export const readBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!+userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    const user = await PaperService.findUserInfo(userId);

    if (!user) {
      return next(createError(404, 'Not Found!'));
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
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
      return next(createError(401, 'Unauthorized!'));
    }

    const user = await PaperService.findMiniInfo(userId);

    if (!user) {
      return next(createError(404, 'Not Found!'));
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};

// 상세 페이지 조회
export const readPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, postId } = req.params;

    if (!+userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+postId) {
      return next(createError(400, `Invalid PostId : ${postId}`));
    }

    const paper = await PaperService.findPostInfo(postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    return res.json({ paper });
  } catch (err) {
    return next(err);
  }
};

// 상세 페이지 작성
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { title, contents, thumbnail } = req.body;

    if (!userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    const schema = validatePaper();

    await schema.validateAsync({ title, contents });

    const paper = await PaperService.createPost(title, contents, thumbnail, userId);

    if (!paper) {
      return next(createError(400, 'Paper Not Created'));
    }

    const images: string[] = contents.match(/[0-9]{13}.[a-z]{3,4}/g) || [];

    if (thumbnail) {
      images.push(thumbnail);
    }

    await PaperService.updateImage(paper.postId, images);
    await PaperService.updatePoint(userId);

    return res.json({ paper });
  } catch (err) {
    return next(err);
  }
};

// 상세 페이지 이미지 첨부
export const createImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file } = req as Types.MulterFile;

    if (!file?.transforms) {
      return next(createError(400, 'Image Not Uploaded'));
    }

    const imageUrl = file.transforms[0]?.key;

    if (imageUrl) {
      await PaperService.createImage(imageUrl);
    }

    return res.json({ result: true, imageUrl });
  } catch (err) {
    return next(err);
  }
};

// 상세 페이지 수정
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { title, contents, thumbnail } = req.body;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+postId) {
      return next(createError(400, `Invalid PostId : ${postId}`));
    }

    const schema = validatePaper();

    await schema.validateAsync({ title, contents });

    const paper = await PaperService.updatePost(
      title,
      contents,
      thumbnail,
      userId,
      postId
    );

    if (!paper[0]) {
      return next(createError(404, 'Not Found!'));
    }

    const images: string[] = contents.match(/[0-9]{13}.[a-z]{3,4}/g) || [];

    if (thumbnail) {
      images.push(thumbnail);
    }

    await PaperService.updateImage(+postId, images);

    return res.json({ result: true, title, contents });
  } catch (err) {
    return next(err);
  }
};

// 상세 페이지 삭제
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+postId) {
      return next(createError(400, `Invalid PostId : ${postId}`));
    }

    const paper = await PaperService.destroyPost(userId, postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    return res.json({ result: true });
  } catch (err) {
    return next(err);
  }
};

// 댓글 작성
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId } = req.params;
    const { text } = req.body;

    if (!userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+postId) {
      return next(createError(400, `Invalid PostId : ${postId}`));
    }

    const schema = validateComment();

    await schema.validateAsync({ text });

    const paper = await Paper.findOne({ where: { postId } });

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    const comment = await PaperService.createComment(text, userId, postId);

    return res.json({ result: true, comment });
  } catch (err) {
    return next(err);
  }
};

// 댓글 수정
export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!+userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+postId || !+commentId) {
      return next(createError(400, 'Invalid PostId or CommentId'));
    }

    const schema = validateComment();

    await schema.validateAsync({ text });

    const paper = await PaperService.findPost(postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    const updatedComment = await PaperService.updateComment(
      text,
      commentId,
      userId,
      postId
    );

    if (!updatedComment[0]) {
      return next(createError(404, 'Not Found!'));
    }

    return res.json({ result: true, text });
  } catch (err) {
    return next(err);
  }
};

// 댓글 삭제
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId, commentId } = req.params;

    if (!userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+postId || !+commentId) {
      return next(createError(400, 'Invalid PostId or CommentId'));
    }

    const deletedComment = await PaperService.destroyComment(commentId, userId, postId);

    if (!deletedComment) {
      return next(createError(404, 'Not Found!'));
    }

    return res.json({ result: true });
  } catch (err) {
    return next(err);
  }
};

// 좋아요 등록 및 취소
export const createLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = res.locals?.user?.userId;
    const { postId } = req.params;

    if (!userId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+postId) {
      return next(createError(400, `Invalid PostId : ${postId}`));
    }

    const paper = await PaperService.findPost(postId);

    if (!paper) {
      return next(createError(404, 'Not Found!'));
    }

    if (userId === paper.userId) {
      return next(createError(400, 'Self-Like Forbidden'));
    }

    const liked = await paper.getLikes({ where: { userId } });

    if (liked.length) {
      await paper.removeLikes(userId);

      return res.json({ result: true, message: 'Like Canceled' });
    }

    await paper.addLikes(userId);

    return res.json({ result: true, message: 'Like Done' });
  } catch (err) {
    return next(err);
  }
};

// 구독 등록 및 취소
export const createSubs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const myId = res.locals?.user?.userId;
    const { userId: writerId } = req.params;

    if (!myId) {
      return next(createError(401, 'Unauthorized!'));
    }

    if (!+writerId) {
      return next(createError(400, `Invalid WriterId : ${writerId}`));
    }

    if (+myId === +writerId) {
      return next(createError(400, 'Self-Subs Forbidden'));
    }

    const user = await PaperService.findUser(writerId);

    if (!user) {
      return next(createError(404, 'Not Found!'));
    }

    const subbed = await user.getFollowees({ where: { userId: myId } });

    if (subbed.length) {
      await user.removeFollowees(myId);

      return res.json({ result: true, message: 'Subs Canceled' });
    }

    await user.addFollowees(myId);

    return res.json({ result: true, message: 'Subs Done' });
  } catch (err) {
    return next(err);
  }
};
