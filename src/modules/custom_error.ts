import logger from './winston';

export default function createError(
  status: number,
  message: string,
  userId: number | null = null
) {
  logger.error(`${userId} - ${message}`);

  const error = new Error(message) as Types.CustomError;

  error.status = status;
  error.result = false;

  return error;
}
