import * as Sentry from '@sentry/nestjs';
import * as dotenv from 'dotenv';
dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  debug: true,
  environment: 'development',
  enableLogs: true,
});
