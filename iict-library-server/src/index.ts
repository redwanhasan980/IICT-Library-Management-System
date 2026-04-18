import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import outsideBookRouter from './routes/outsideBook.routes';
import spineLabelRouter from './routes/spineLabel.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.send('IICT Library Management Server is running!');
});

// API Routes
app.use('/api/outside-books', outsideBookRouter);
app.use('/api/spine-labels', spineLabelRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
