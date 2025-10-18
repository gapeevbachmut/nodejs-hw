import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

// реєстрація
export const registerUser = async (req, res, next) => {
  const { email, password } = req.body;

  //визначаю користувача за поштою
  const existingUser = await User.findOne({ email });
  // якщо він існує - реєстрації не буде
  if (existingUser) {
    return next(createHttpError(400, 'Email in use!'));
  }

  // хешую пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  //створюю користувача
  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  //створюю сесію при реєстрації, з прив'язкою до юзера
  const newSession = await createSession(newUser._id);
  //Контролери створюють/перевіряють користувача і сесію, після чого встановлюють куки
  //Викликаємо, передаємо об'єкт відповіді та сесію
  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
};

// логін
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  //перевіряю чи є такий користувач
  const user = await User.findOne({ email });
  if (!user) {
    return next(createHttpError(401, 'User not found!'));
  }

  // перевіряю хеши паролів
  const isValidPassword = await bcrypt.compare(password, user.password);
  //  порівнюю введений пароль із хешем у базі.
  if (!isValidPassword) {
    return next(createHttpError(401, 'Invalid credentials!'));
  }

  // видаляється попередня сесія
  await Session.deleteOne({ userId: user._id });

  // створюю нову сесію при логіні, для юзера за id
  const newSession = await createSession(user._id);
  // Викликаємо, передаємо об'єкт відповіді та сесію
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

// логаут
export const logoutUser = async (req, res) => {
  // отримую ідентифікатор сесії із куків
  const { sessionId } = req.cookies;

  // якщо сесія є - видаляємоїї із бази діних
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  // та видаляємо усі куки
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send(); // повертаєму пусту відповідь - без тіла
  // 204 No Content
  // користувач може вийти з системи: сервер видалить його сесію та куки, а всі подальші запити більше не будуть вважатися авторизованими.
};

//  Оновлення сесії
export const refreshUserSession = async (req, res, next) => {
  //  знайти поточну сесію за id та рефрешем
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  // якщо сесії немає - повертаю помилку
  if (!session) {
    return next(createHttpError(401, 'Session not found!'));
  }

  // пускає далі - коли сесія існує
  //  перевіряю валідність рефреша
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  //  якщо час токена вийшов - помилка
  if (isSessionTokenExpired) {
    return next(createHttpError(401, 'Session token expired!'));
  }

  // якщо час токена ще дійсний - пускає далі
  // видаляю поточну сесію
  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  //  створюю нову сесію, додаються нові кукі
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed!',
  });
};

//  Контролер для надсилання листа
export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Якщо користувача нема — навмисно повертаю "успішну" відповідь
  if (!user) {
    return res.status(200).json({
      message: 'If this email exists, a reset link has been sent',
    });
  }

  // Користувач є — генерую короткоживучий JWT і відправляю лист
  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  //Handlebars
  // 1. Формую шлях до шаблона
  const templatePath = path.resolve('src/templates/reset-password-email.html');
  // 2. Читаю шаблон
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  // 3. Готую шаблон до заповнення
  const template = handlebars.compile(templateSource);
  // 4. Формую із шаблона HTML документ з динамічними даними
  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    next(
      createHttpError(500, 'Failed to send the email, please try again later.'),
    );
    return;
  }

  //  "успішна" відповідь
  res.status(200).json({
    message: 'If this email exists, a reset link has been sent',
    // message: 'Password reset email sent successfully',
  });
};

//контроллер зміни паролю
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  // 1. Перевіряємо/декодуємо токен
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Повертаємо помилку якщо проблема при декодуванні
    next(createHttpError(401, 'Invalid or expired token'));
    return;
  }

  // 2. Шукаємо користувача
  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  // 3. Якщо користувач існує
  // створюємо новий пароль і оновлюємо користувача
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  // 4. Інвалідовуємо всі можливі попередні сесії користувача
  await Session.deleteMany({ userId: user._id });

  // 5. Повертаємо успішну відповідь
  res.status(200).json({
    message: 'Password reset successfully. Please log in again.',
  });
};
