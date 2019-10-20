"use strict";

const winston = require('winston');
require('winston-mail');

const logger = winston.createLogger({
  level: 'warn',
  transports: [
    new winston.transports.File({filename: '../var/logs/prod.log'})
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
