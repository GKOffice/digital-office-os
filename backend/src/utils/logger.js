import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined
});

// Activity log helper
export function logActivity(data) {
  logger.info({ 
    type: 'activity',
    ...data 
  }, `Activity: ${data.eventType}`);
}
