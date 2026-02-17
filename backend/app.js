import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { PORT, JWT_SECRET } from './config/env.js';

import authRouter from './routes/auth.routes.js';
import boardRouter from './routes/board.routes.js';
import listRouter from './routes/list.routes.js';
import taskRouter from './routes/task.routes.js';
import searchRouter from './routes/search.routes.js';
import activityRouter from './routes/activity.routes.js';

import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';

const app = express();
const server = http.createServer(app);

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/board', boardRouter);
app.use('/api/v1/list', listRouter);
app.use('/api/v1/task', taskRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/activity', activityRouter);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Task Manager Running');
});


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

io.use((socket, next) => {
  const cookies = socket.handshake.headers.cookie || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) return next(new Error('No auth token'));

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Invalid token'));
    socket.userId = decoded.userId;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on('join_board', (boardId) => {
    socket.join(boardId);
    console.log(`${socket.userId} joined ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.userId}`);
  });
});

global.io = io;


const startServer = async () => {
  try {
    await connectToDatabase();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();

export default app;
