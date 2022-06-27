import * as express from 'express';

const router = express.Router();

router.get('/', async (res, req, next) => {
  console.log('well done!!!');
});

export = router;
