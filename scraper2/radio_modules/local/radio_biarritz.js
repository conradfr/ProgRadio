import axios from 'axios';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

// The grid is built client side from the Supabase tables of the site,
// the rules below mirror the ones of the react app (getShowSlotsForDate / isSlotOnDate).
// The grid is 3 hours music blocks, the short shows on top of them are added as sections.

const supabaseUrl = 'https://toztqpindyyxtivszmlj.supabase.co/rest/v1';
// public key of the site
const supabaseKey = 'sb_publishable_lHZPzYbPUu4R2fsq7Rrijw_ot7t9YCU';

let scrapedData = {
  shows: [],
  hosts: {}
};

const getWeeksBetween = (startDateObj, dateObj) => {
  return Math.floor(dateObj.clone().startOf('day').diff(startDateObj, 'days') / 7);
};

const getWeekOfMonth = dateObj => Math.ceil(dateObj.date() / 7);

// slot: {day: 0-6 (sunday first), start_time: "HH:MM", end_time: "HH:MM", recurrence, start_date}
const isSlotOnDate = (slot, dateObj) => {
  if (slot.recurrence === 'daily') {
    return true;
  }

  if (slot.day !== dateObj.day()) {
    return false;
  }

  const recurrence = slot.recurrence || 'weekly';
  if (recurrence === 'weekly' || !slot.start_date) {
    return true;
  }

  const startDateObj = moment.tz(slot.start_date, 'Europe/Paris');

  if (recurrence === 'monthly') {
    return getWeekOfMonth(dateObj) === getWeekOfMonth(startDateObj);
  }

  const interval = recurrence === 'biweekly' ? 2 : 3;
  return ((getWeeksBetween(startDateObj, dateObj) % interval) + interval) % interval === 0;
};

const isShowOnDate = (show, dateObj) => {
  const presentation = show.presentation || {};

  if (!show.is_active || presentation.gridEnabled === false) {
    return false;
  }

  if (presentation.broadcastLifecycle === 'ephemeral') {
    const day = dateObj.format('YYYY-MM-DD');
    return day >= presentation.broadcastStartDate && day <= presentation.broadcastEndDate;
  }

  return true;
};

const dateTimeFromTime = (dateObj, time) => {
  const [hour, minute] = time.split(':').map(Number);

  const dateTime = moment(dateObj);
  dateTime.hour(hour);
  dateTime.minute(minute);
  dateTime.second(0);
  dateTime.millisecond(0);

  return dateTime;
};

const format = async dateObj => {
  const entries = [];

  scrapedData.shows.forEach(show => {
    if (!isShowOnDate(show, dateObj)) {
      return;
    }

    (show.schedule || []).filter(slot => isSlotOnDate(slot, dateObj)).forEach(slot => {
      const startDateTime = dateTimeFromTime(dateObj, slot.start_time);
      // "24:00" or "00:00" is midnight of the next day
      const endDateTime = dateTimeFromTime(dateObj, slot.end_time === '24:00' ? '00:00' : slot.end_time);

      if (startDateTime.isSameOrAfter(endDateTime)) {
        endDateTime.add(1, 'days');
      }

      entries.push({
        'date_time_start': startDateTime.toISOString(),
        'date_time_end': endDateTime.toISOString(),
        'title': show.title.trim(),
        'host': (scrapedData.hosts[show.id] || []).join(', ') || null,
        'img': show.image_url || null,
        'description': show.short_description ? show.short_description.trim() : null,
        'sections': []
      });
    });
  });

  const duration = entry => moment(entry.date_time_end).diff(entry.date_time_start);

  // short shows within a longer one become its sections
  const cleanedData = entries.filter(entry => {
    const container = entries.find(other =>
      other !== entry
      && duration(other) > duration(entry)
      && other.date_time_start <= entry.date_time_start
      && other.date_time_end >= entry.date_time_end
    );

    if (!container) {
      return true;
    }

    container.sections.push({
      'date_time_start': entry.date_time_start,
      'title': entry.title,
      'presenter': entry.host,
      'description': entry.description,
      'img': entry.img
    });

    return false;
  });

  cleanedData.sort((a, b) => a.date_time_start.localeCompare(b.date_time_start));
  cleanedData.forEach(show => show.sections.sort((a, b) => a.date_time_start.localeCompare(b.date_time_start)));

  return Promise.resolve(cleanedData);
};

const fetchTable = async (table, params) => {
  const url = `${supabaseUrl}/${table}`;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url, {
    params,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  return response.data;
};

const fetchAll = async () => {
  const [shows, showHosts] = await Promise.all([
    fetchTable('shows', { select: '*', order: 'sort_order.asc' }),
    // the hosts are a bonus, the grid can be done without them
    fetchTable('show_animateurs', { select: 'show_id,animateurs(name)' })
      .catch(error => {
        logger.log('warn', `radio_biarritz - hosts request failed (${error})`);
        return [];
      })
  ]);

  scrapedData.shows = shows;
  scrapedData.hosts = showHosts.reduce((hosts, link) => {
    if (link.animateurs && link.animateurs.name) {
      (hosts[link.show_id] = hosts[link.show_id] || []).push(link.animateurs.name.trim());
    }

    return hosts;
  }, {});

  return Promise.resolve(true);
};

const getScrap = dateObj => {
  dateObj = moment(dateObj).tz('Europe/Paris');
  scrapedData = { shows: [], hosts: {} };

  return fetchAll()
    .then(() => {
      return format(dateObj);
    });
};

export default {
  getName: 'radio_biarritz',
  supportTomorrow: true,
  getScrap
};
