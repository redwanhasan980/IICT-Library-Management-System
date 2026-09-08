import app from './app';

const port = Number(process.env.PORT) || 5000;

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
