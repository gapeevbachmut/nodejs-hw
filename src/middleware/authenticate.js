//  контроль доступу до наших даних
//  обмежити доступ до приватних колекцій

import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  // перевіряю наявність accessToken
  if (!req.cookies.accessToken) {
    return next(createHttpError(401, 'Missing access token!'));
  }

  // токен існує - пускає далі
  //  визначаю сесію
  const session = await Session.findOne({
    accessToken: req.cookies.accessToken,
  });

  // якщо сесії немає - зупиняємо
  if (!session) {
    return next(createHttpError(401, 'Session not found!'));
  }

  //  визначаю термін дії аццес токена
  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);
  //   якщо токен закінчився - зупиняю
  if (isAccessTokenExpired) {
    return next(createHttpError(401, 'Access token expired!'));
  }

  // токен існує - пускає далі
  //  визначаю користувача
  const user = await User.findById(session.userId);
  // якщо юзера не існує - зупиняю
  if (!user) {
    return next(createHttpError(401));
  }

  // юзер існує - додаю його до запиту
  req.user = user;
  // передаю управляння далі
  next();
};
