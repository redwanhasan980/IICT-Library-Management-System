import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import outsideBookRouter from './routes/outsideBook.routes';
import spineLabelRouter from './routes/spineLabel.routes';
import bookRouter from './routes/book.routes';
import reservationRouter from './routes/reservation.routes';
import loanRouter from './routes/loan.routes';
import policyRouter from './routes/policy.routes';
import bulkRouter from './routes/bulk.routes';
import analyticsRouter from './routes/analytics.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { successResponse } from './utils/apiResponse';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json(successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }, 'IICT Library Management Server is running'));
});

// API Routes
app.use('/api/outside-books', outsideBookRouter);
app.use('/api/spine-labels', spineLabelRouter);
app.use('/api/books', bookRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/loans', loanRouter);
app.use('/api/policies', policyRouter);
app.use('/api/admin/tools', bulkRouter);
app.use('/api/analytics', analyticsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
  } else {
    console.error('Server startup error:', error.message);
  }
  process.exit(1);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
