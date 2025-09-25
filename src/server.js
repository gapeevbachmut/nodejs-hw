import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import pino from 'pino-http';

const app = express();
const PORT = process.env.PORT ?? 3030; // or ||

app.use(express.json());
app.use(cors());
app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);
// маршрути
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({
    // id: noteId,
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// тест помилки
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// помилки
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    // message: 'Simulated server error.',
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
