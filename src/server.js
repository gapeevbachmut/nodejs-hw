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

app.use(logger); // бачить усі запити

app.use(express.json()); //обробка JSON запитів
app.use(cors()); // дозвіл запитів з інших доменів

app.use(notesRoutes); // група маршрутів

app.use(notFoundHandler); // 404
app.use(errorHandler); // error

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
