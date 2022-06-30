import { logger } from './winston';

export function createError(
  status: number,
  message: string,
  userId: number | null = null
) {
  logger.error(`${userId} - ${message}`);

  const error = <Types.CustomError>new Error(message);

  error.status = status;
  error.success = false;

  return error;
}
