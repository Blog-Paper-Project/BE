import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  handler(req: Request, res: Response) {
    res.status(429).json({ message: 'Too Many Requests' });
  },
});

export = apiLimiter;
