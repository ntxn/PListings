import { app } from './app';

process.on('uncaughtException', (err: Error): void => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err.name, err.message);
  process.exit(1);
});

import './db/mongoose';

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`API SERVER listening on port ${port}`)
);

process.on('unhandledRejection', (err: Error): void => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name, err.message);
  server.close(() => process.exit(1)); // 0 for success, 1 is for unhandled rejection);
});
