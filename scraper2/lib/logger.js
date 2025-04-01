"use strict";

import winston from 'winston';
import Mail from 'winston-mail-lite';

const logger = winston.createLogger({
  level: 'warn',
  transports: [
    new winston.transports.File({filename: '../var/logs/cron.log'})
  ]
});

logger.add(new winston.transports.Console({
  level: process.env.NODE_ENV === 'prod' ? 'info' : 'debug',
  format: winston.format.simple()
}));

const init = (mailConfig) => {
  if (mailConfig.enable === true) {

    const options = {
      transportOptions: {
        host: process.env.MAIL_HOST || mailConfig.host,
        port: process.env.MAIL_PORT || mailConfig.port,
        auth: {
          user: process.env.MAIL_USERNAME || mailConfig.username,
          pass: process.env.MAIL_PASSWORD || mailConfig.password
        }
      },
      messageOptions: {
        from: process.env.MAIL_USERNAME || mailConfig.from,
        to: process.env.MAIL_TO || mailConfig.to
      }
    }

    logger.add(new Mail(options));
  }
};

const log = (level, text) => {
  logger.log(level, text);
};

export default {
  init,
  log
};
