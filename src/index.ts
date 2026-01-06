import { buildApp } from './app.js';

async function start() {
  const app = await buildApp();

  try {
    const port = app.config.PORT;
    const host = '0.0.0.0'; // Listen on all interfaces

    await app.listen({ port, host });

    // Log startup success is handled by Fastify logger,
    // but we can add a specific message if needed.
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful Shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, () => {
      app.log.info({ msg: 'Closing server', signal });
      app.close().then(() => {
        app.log.info({ msg: 'Server closed' });
        process.exit(0);
      });
    });
  }
}

start();
