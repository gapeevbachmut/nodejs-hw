import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';

const app = express();

const PORT = process.env.PORT ?? 3030;

app.use(express.json());
app.use(cors());
app.use(logger);

// група маршрутів - all notes та за id
app.use(notesRoutes);

// тест помилки
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

app.use(notFoundHandler); // 404
app.use(errorHandler); // error

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
