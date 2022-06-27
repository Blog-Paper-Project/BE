import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { Op, Sequelize } from 'sequelize';
const { Paper, User } = require('../../models');

const router = express.Router();

// 회원가입 테스트
router.get('/test', async (req: Request, res: Response, next: NextFunction) => {
  await User.create({ email: 'email', nickname: 'abc' });
  const users = await User.findAll();
  res.json({ users });
});

// 인기 게시글 조회 & 게시글 검색
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;

    if (search) {
      const papers = await Paper.findAll({
        where: { title: { [Op.like]: `%${search || ''}%` } },
      });

      res.json({ papers });
    }

    let papers = await Paper.findAll({
      include: { model: User, as: 'Likes' },
    });

    papers = papers
      .map((paper: { title: number; Likes: object[] }) => {
        return { id: paper.title, likes: paper.Likes.length };
      })
      .sort(
        (a: { likes: number }, b: { likes: number }) => b['likes'] - a['likes']
      )
      .slice(0, 5);

    const popularUsers = await User.findAll({
      order: [['popularity', 'DESC']],
      limit: 3,
      attributes: ['nickname', 'profileImage', 'popularity'],
    });

    res.json({ papers, popularUsers });
  } catch (err) {
    next(err);
  }
});

// 상세페이지 작성
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, contents, userId } = req.body;
    const result = await Paper.create({ title, contents, userId });

    res.json({ result });
  } catch (err) {
    next(err);
  }
});

// 블로그 메인 페이지 조회
router.get(
  '/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const papers = await Paper.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      const user = await User.findOne({
        where: { id: userId },
        attributes: ['nickname', 'profileImage', 'introduction', 'popularity'],
      });

      res.json({ papers, user });
    } catch (err) {
      next(err);
    }
  }
);

export = router;
