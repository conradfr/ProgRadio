"use strict";

const winston = require('winston');
require('winston-mail').Mail;

const init = (mailConfig) => {
    winston.add(winston.transports.File, { filename: '../var/logs/prod.log' });
    winston.cli();

    if (mailConfig.enable === true) {
        delete mailConfig.enable;
        winston.add(winston.transports.Mail, mailConfig);
    }

};

module.exports = {
    init,
    log: winston.log
};
