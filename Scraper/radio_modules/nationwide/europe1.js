const osmosis = require('osmosis');
const axios = require('axios');
let moment = require('moment-timezone');
let util = require('util');
const logger = require('../../lib/logger.js');

let scrapedData = [];
const cleanedData = [];
const prevDateTime = [];

const dayEn = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  0: 'sunday'
};

const extractSchedule = (html, day) => {
  try {
    // console.log('Fetched page content, searching for schedule data...');

    // Extract all scripts from the HTML
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let scriptCount = 0;

    while ((match = scriptRegex.exec(html)) !== null) {
      scriptCount++;
      const scriptContent = match[1];

      // Look for schedule data in this script
      if (scriptContent.includes('window.schedule') ||
          scriptContent.includes(day) ||
          scriptContent.includes('startTime')) {

        // console.log(`Found potential schedule data in script #${scriptCount}`);

        // Try to find the schedule object using various patterns

        // Pattern 1: Look for window.schedule assignment
        const scheduleAssignRegex = /window\.schedule\s*=\s*({[\s\S]*?});/;
        const scheduleMatch = scriptContent.match(scheduleAssignRegex);

        if (scheduleMatch && scheduleMatch[1]) {
          // console.log('Found window.schedule assignment');
          return parseScheduleObject(scheduleMatch[1]);
        }

        // Pattern 2: Look for a structure like in the example
        // const formatRegex = /{\s*monday\s*:\s*{\s*[0-9]+\s*:/;
        const formatRegex = new RegExp(`\\{\\s*${day}\\s*:\\s*\\{\\s*[0-9]+\\s*:`, 'g');
        if (formatRegex.test(scriptContent)) {
          console.log('Found object structure');

          // Extract the full object - this is tricky with just regex
          // Try to find a self-contained object with matching braces
          let startIndex = scriptContent.search(formatRegex);
          if (startIndex !== -1) {
            let braceCount = 0;
            let endIndex = startIndex;
            let inString = false;
            let escapeNext = false;

            for (let i = startIndex; i < scriptContent.length; i++) {
              const char = scriptContent[i];

              if (escapeNext) {
                escapeNext = false;
                continue;
              }

              if (char === '\\') {
                escapeNext = true;
                continue;
              }

              if (char === '"' || char === "'") {
                inString = !inString;
                continue;
              }

              if (!inString) {
                if (char === '{') braceCount++;
                if (char === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    endIndex = i + 1;
                    break;
                  }
                }
              }
            }

            if (endIndex > startIndex) {
              const objectStr = scriptContent.substring(startIndex, endIndex);
              console.log('Extracted object string, attempting to parse');
              return parseScheduleObject(objectStr);
            }
          }
        }
      }
    }

    console.log(`Searched ${scriptCount} script tags, but couldn't find schedule data`);
    throw new Error('Could not find schedule data in any script tag');

  } catch (error) {
    console.error('Error extracting Europe1 schedule:', error);
    throw error;
  }
}

// Helper function to parse the schedule object string
const parseScheduleObject = (objectStr) => {
  console.log('Parsing schedule object string');

  try {
    // First attempt: direct eval in controlled environment
    // This is the most likely to work with non-standard JS object literals
    const scheduleObject = eval(`(${objectStr})`);
    // console.log('Successfully parsed schedule with eval');
    return scheduleObject;
  } catch (evalError) {
    // console.error('Eval parsing failed:', evalError);

    try {
      // Second attempt: Clean up the string and try JSON.parse
      let cleanedStr = objectStr
          // Quote all unquoted property names
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
          // Remove trailing commas
          .replace(/,(\s*[}\]])/g, '$1');

      const scheduleObject = JSON.parse(cleanedStr);
      // console.log('Successfully parsed schedule as JSON');
      return scheduleObject;
    } catch (jsonError) {
      // console.error('JSON parsing failed:', jsonError);

      // Last attempt: Function constructor as fallback
      try {
        const scheduleObject = new Function(`return ${objectStr}`)();
        // console.log('Successfully parsed schedule with Function constructor');
        return scheduleObject;
      } catch (funcError) {
        // console.error('Function constructor parsing failed:', funcError);
        throw new Error('All parsing methods failed');
      }
    }
  }
}

const fetchDescription = async (url) => {
  let description = null;

  // console.log(`fetching description from https://www.europe1.fr${url}...`);

  await osmosis
    .get(`https://www.europe1.fr${url}`)
    .select('.hero-description')
    .set({
      'description': 'p.description'
    })
    .data(function (listing) {
      description = listing;
    })
    .done(function () {

    });

  return description;
}

const format = async (dateObj, isPrev) => {
  dateObj.tz('Europe/Paris');
  const day = dayEn[dateObj.day()];

  console.log(`formatting ${day}, ${Object.keys(scrapedData[day]).length} entries`);

  if (!scrapedData[day]) {
    return cleanedData;
  }

  for (const key in scrapedData[day]) {
    if (scrapedData[day].hasOwnProperty(key)) {
      scrapedData[day][key]['title']
      const regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})/);
      let match = scrapedData[day][key]['startTime'].match(regexp);
      if (match === null) {
        continue;
      }

      const startDateTime = moment(dateObj);
      startDateTime.hour(match[1]);
      startDateTime.minute(match[2]);
      startDateTime.second(0);

      // filter if datetime is after previous one (if isPrev) (it means previous day)
      if (isPrev) {
        if (prevDateTime.length === 0) {
          prevDateTime.push(startDateTime);
          continue;
        }

        if (startDateTime.isAfter(prevDateTime[prevDateTime.length - 1])) {
          prevDateTime.push(startDateTime);
          continue;
        }

        startDateTime.add(1, 'day');
      }

      // filter if datetime is before previous one (it means next day).
      if (!isPrev && cleanedData.length > 0) {
        const prevDT = moment(cleanedData[cleanedData.length - 1].date_time_start);
        if (startDateTime.isBefore(prevDT)) {
          continue;
        }
      }

      const newEntry = {
        date_time_start: startDateTime.toISOString(),
        title: scrapedData[day][key]['title'] || null,
        host: scrapedData[day][key]['animator'] || null,
        img: scrapedData[day][key]['image'] || null,
      };

      if (scrapedData[day][key]['uri']) {
        const description = await fetchDescription(scrapedData[day][key]['uri']);
        if (description && description.description) {
          newEntry.description = description.description;
        }
      }

      match = scrapedData[day][key]['endTime'].match(regexp);

      if (match) {
        const endDateTime = moment(dateObj);
        endDateTime.hour(match[1]);
        endDateTime.minute(match[2]);
        endDateTime.second(0);

        // it starts one day and finish the next
        if (endDateTime.isBefore(startDateTime)) {
          endDateTime.add(1, 'day');
        }

        newEntry.date_time_end = endDateTime.toISOString();
      }

      cleanedData.push(newEntry);
    }
  }

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.europe1.fr/Grille-des-programmes';

  dateObj.locale('fr');
  const day = dayEn[dateObj.day()];

  logger.log('info', `fetching ${url} (${day})`);

  return axios.get(url).then((response) => {
    if (response.data) {
      const scheduleData = extractSchedule(response.data, day);
      if (scheduleData) {
        scrapedData = scheduleData;
      }
    }
  });
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      const previousDay = moment(dateObj);
      previousDay.subtract(1, 'days');

      format(previousDay, true);
      return format(dateObj, false);
    });
};

const scrapModule = {
  getName: 'europe1',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
