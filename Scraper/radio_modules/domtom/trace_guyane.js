const scrapAbstract = require('./_abstract_trace');
const moment = require('moment-timezone');

const name = 'trace_guyane';

const getScrap = dateObj => {
  const dateWantedObj = moment(dateObj);

  dateObj.tz('America/Guyana');

  const url = 'http://gy.trace.fm/program/';
  return scrapAbstract.getScrap(dateObj, dateWantedObj, name, url)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
