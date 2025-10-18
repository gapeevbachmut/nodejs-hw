import { Joi, Segments } from 'celebrate';

//  валідація реєстрації
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

// валідація входу користувача
export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

// Валідація тіла запиту який надсилатиме лист із посиланням для скидання пароля.
export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
  }),
};

// Валідація тіла запиту - Зміна паролю
export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().min(8).required(),
    token: Joi.string().required(),
  }),
};
