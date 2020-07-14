const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
let scrapedData = {};

const format = (dateObj, name) => {
  dateObj.tz('Europe/Paris');
  const mains = [];
  scrapedData[name].forEach(function (curr) {
    let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})\s{1,30}-\s([0-9]{1,2})[h|H]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    if (match === null) {
      return;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    let host = null;
    if (curr.host.length > 0) {
      host = curr.host.join(", ");
    } /*else {
            regexp = /-\s([A-Za-zÀ-ÿ-9]{4,40}\s[A-Za-zÀ-ÿ0-9]{4,40})/gu;
            const match = curr.title.match(regexp);
            if (match !== null) {
                host = match.join(", ").replace(/- /g, '');
            }
        }*/

    const regex = /{%(.+?)%}/;
    const description = curr.description ? curr.description.replace(regex, '').split('\r\n').join(' ') : null;

    // filtering weird base64 for now
    let img = null;

    if (typeof curr.img_alt !== 'undefined') {
      img = curr.img_alt;
    } else if (typeof curr.img !== 'undefined' && curr.img.substring(0, 4) !== 'data') {
      img = curr.img;
    }

    const subs = [];
    curr.sub.forEach(function (sub) {
      if (typeof sub.datetime_raw !== 'undefined') {
        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
        match = sub.datetime_raw.match(regexp);

        if (match === null) {
          return;
        }

        const sub_startDateTime = moment(startDateTime);
        sub_startDateTime.hour(match[1]);
        sub_startDateTime.minute(match[2]);
        sub_startDateTime.second(0);

        let sub_presenter = null;
        if (sub.presenter.length > 0) {
          sub_presenter = sub.presenter.join(", ");
        }

        const newSub = {
          date_time_start: sub_startDateTime.toISOString(),
          title: sub.title,
          presenter: sub_presenter
        };

        subs.push(newSub);
      }
    });

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': img.substr(0, 4) !== 'http' ? `https://www.francebleu.fr${img}` : img,
      'title': curr.title,
      'host': host,
      'description': description,
      'sections': subs
    };

    mains.push(newEntry);
  });

  // sometimes the show is duplicated, we pick the one with the most sections
  const mainsFiltered = mains.reduce(function (prev, curr, index, array) {
    if (index === (array.length - 1)) {
      prev.push(curr);
      return prev;
    }

    const next = array[index + 1];
    if (curr.date_time_start === next.date_time_start && curr.date_time_end === next.date_time_end
      && curr.sections.length < next.sections.length) {
      return prev;
    } else {

    }

    prev.push(curr);
    return prev;
  }, []);

  return Promise.resolve(mainsFiltered);
};

const fetch = (url, name) => {
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.emission')
      .set({
          'img': '.entete img@src',
          'img_alt': '.entete img@data-dejavu-src',
          'datetime_raw': '.entete .texte > .quand',
          'title': '.entete .texte > h3',
          'host': ['.entete .texte > .chroniqueur > a'],
          'description': '.entete .texte > p.hat',
          'sub': [
            osmosis.find('.liste_chroniques li')
              .set({
                'datetime_raw': '.horaire',
                'title': '.titre',
                'presenter': ['.chroniqueur > a'],
                'description': '.titre-emission'
              })
          ]
        }
      )
      .data(function (listing) {
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (url, name) => {
  return fetch(url, name);
};

const getScrap = (dateObj, url, name) => {
  scrapedData[name] = [];
  return fetchAll(url, name)
    .then(() => {
      return format(dateObj, name);
    });
};

const scrapModuleAbstract = {
  supportTomorrow: false,
  getScrap
};

module.exports = scrapModuleAbstract;
