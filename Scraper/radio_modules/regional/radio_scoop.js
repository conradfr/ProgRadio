const osmosis = require('osmosis');
const node_fetch = require('node-fetch');
const { URLSearchParams } = require('url');
let moment = require('moment-timezone');
const utils = require('../../lib/utils');
const logger = require('../../lib/logger.js');

const subCities = {
  'radio_scoop_lyon': 'Ly',
  'radio_scoop_vienne': 'Vi',
  'radio_scoop_tarare': 'Ta',
  'radio_scoop_saintetienne': 'St',
  'radio_scoop_roanne': 'Ro',
  'radio_scoop_lepuyenvelay': 'Py',
  'radio_scoop_yssingeaux': 'Ys',
  'radio_scoop_clermont': 'Cl',
  'radio_scoop_vichy': 'Vy',
  'radio_scoop_bourgenbresse': 'Bg',
  'radio_scoop_macon': 'Ma',
  'radio_scoop_valserhone': 'Be',
  'radio_scoop_aubenas': 'Au',
  'radio_scoop_grenoble': 'Gr',
  'radio_scoop_chambery': 'Ch',
  'radio_scoop_annecy': 'An',
};

const image_prefix = 'https://www.radioscoop.com';

let scrapedData = {};
let cleanedData = {};

const format = (dateObj, subRadio) => {
  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[subRadio] = scrapedData[subRadio].reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{1,2}) - ([0-9]{1,2}):([0-9]{1,2})/);
    match = curr.datetime_raw.match(regexp);

    let startDateTime = null;
    let endDateTime = null;

    // note: midnight will be the wrong day but it's currently the same everyday so it's kinda ok
    if (match === null) {
      return prev;
    }

    startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    endDateTime = moment(dateObj);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title,
      'description': curr.description || null,
      'host': curr.host || null
    };

    if (curr.img !== undefined) {
      newEntry.img = image_prefix + curr.img;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[subRadio]);
};

const fetch = async (dateObj, subRadio) => {
  scrapedData[subRadio] = [];
  dateObj.locale('fr');
  let day = utils.upperCaseWords(dateObj.format('d'));
  let url = `https://www.radioscoop.com/podcasts.php?cat=${day}`;

  let cookieUid = null;

  // 1. get a uid
  let response = await node_fetch(url);
  const cookiesRaw = response.headers.raw()['set-cookie'];

  for (let i = 0; i < cookiesRaw.length; i++) {
    if (cookiesRaw[i].includes('uid') === false) {
      continue;
    }

    if (cookiesRaw[i].includes('uid=deleted') === true) {
      continue;
    }

    let regexp = new RegExp(/uid=([a-zA-Z0-9]*);/);
    match = cookiesRaw[i].match(regexp);

    if (match === null) {
      return resolve(true);
    }

    cookieUid = match[1];
    break;
  }

  // 2. send city choice

  const city = subCities[subRadio];

  const params = new URLSearchParams();
  params.append('uid', cookieUid);
  params.append('data[0]', `setVille('${city}') ;`);

  response = await node_fetch('https://www.radioscoop.com/dyn/xhr.php', { method: 'POST', body: params });

  // 3. set cookie

  osmosis.config('cookies', {'uid': cookieUid});

  // 4 ... PROFIT!!

  logger.log('info', `fetching ${url} (sub_radio: ${subRadio}, uid: ${cookieUid})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.article.vAnims')
      .set({
        'datetime_raw': 'div.horaires-div',
        'img': 'img.anim-picture@src',
        'title': 'div.titre > a.prog-link',
        'host': 'a.defaut > i',
        'description': 'div.prog-div'
      })
      .data(function (listing) {
        listing.dateObj = dateObj;
        scrapedData[subRadio].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (dateObj, subRadio) => {
  return fetch(dateObj, subRadio);
};

const getScrap = (dateObj, subRadio) => {
  return fetchAll(dateObj, subRadio)
    .then(() => {
      return format(dateObj, subRadio);
    });
};

const scrapModule = {
  getName: 'radio_scoop',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
