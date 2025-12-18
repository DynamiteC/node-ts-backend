import { buildApp } from './app.js';

// Global error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

async function start() {
  const app = await buildApp();

  try {
    const port = app.config.PORT;
    const host = '0.0.0.0';

    await app.listen({ port, host });

    // Graceful Shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, () => {
        app.log.info(`Received ${signal}, closing...`);
        app.close().then(() => {
            app.log.info('Server closed');
            process.exit(0);
        });
      });
    }

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (import.meta.url.startsWith('file:')) {
    const modulePath = import.meta.url;
    const isMain = process.argv[1] === new URL(modulePath).pathname;
    if (isMain) {
        start();
    }
}
