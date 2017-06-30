/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');

app.seed().then(() => {
  const server = app.listen(port);
  server.on('listening', () =>
    logger.info(`Feathers application started on ${app.get('host')}:${port}`)
  );
})




process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);


 