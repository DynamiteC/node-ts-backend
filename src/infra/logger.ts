import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.token',
      'req.body.password',
      'req.body.cardNumber',
      'req.body.cvv',
      'body.token',
      'body.password',
      'body.cardNumber',
      'body.cvv',
      'email',
      'user.email',
      'customer.email',
      'phone',
      'user.phone',
      'customer.phone'
    ],
    remove: true,
  },
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
});

export type Logger = pino.Logger;
