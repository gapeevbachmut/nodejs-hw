import { HttpError } from 'http-errors';
import 'dotenv/config';

export const errorHandler = (error, req, res, next) => {
  // Якщо помилка створена через http-errors
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      message: error.message || error.name,
    });
  }

  const isProd = process.env.NODE_ENV === 'production';

  // Усі інші помилки — як внутрішні

  console.error(error);
  res.status(500).json({
    message: isProd ? 'Something went wrong!' : error.message,
  });
};
