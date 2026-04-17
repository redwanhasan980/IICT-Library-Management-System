import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('IICT Library Management Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
