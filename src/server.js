import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { errors } from 'celebrate';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();

const PORT = process.env.PORT ?? 3030;

app.use(logger); // бачить усі запити

app.use(express.json()); //обробка JSON запитів
app.use(cors()); // дозвіл запитів з інших доменів
app.use(cookieParser());

app.use(authRoutes); // група маршрутів аутентифікації
app.use(notesRoutes); // група маршрутів нотаток

app.use(notFoundHandler); // 404
app.use(errors()); // обробка помилок від celebrate (валідація)
app.use(errorHandler); // error

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
