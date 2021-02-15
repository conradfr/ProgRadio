"use strict";

const winston = require('winston');
require('winston-mail');

const logger = winston.createLogger({
  level: 'warn',
  transports: [
    new winston.transports.File({filename: '../var/logs/cron.log'})
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    level: 'info',
    format: winston.format.simple()
  }));
}

const init = (mailConfig) => {
  if (mailConfig.enable === true) {
    delete mailConfig.enable;

    mailConfig.username = process.env.MAIL_USERNAME || mailConfig.username;
    mailConfig.password = process.env.MAIL_PASSWORD || mailConfig.password;
    mailConfig.host = process.env.MAIL_HOST || mailConfig.host;
    mailConfig.to = process.env.MAIL_TO || mailConfig.to;
    mailConfig.from = process.env.MAIL_USERNAME || mailConfig.from;

    logger.add(new winston.transports.Mail(mailConfig));
  }
};

const log = (level, text) => {
  logger.log(level, text);
};

module.exports = {
  init,
  log
};
