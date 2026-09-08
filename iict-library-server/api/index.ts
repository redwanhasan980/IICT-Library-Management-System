// Vercel serverless entry point. Every request is rewritten here by vercel.json
// and handed to the same Express app that `npm run dev` / `npm start` use.
import app from '../src/app';

export default app;
