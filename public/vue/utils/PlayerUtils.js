import Vue from 'vue';
import * as config from '../config/config';

const moment = require('moment-timezone');

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const buildNotification = (radio, show) => {
  let icon = '';
  if (show !== null && show.picture_url !== null) {
    icon = `${config.THUMBNAIL_PATH}${show.picture_url}`;
  } else {
    icon = `/img/radio/schedule/${radio.code_name}.png`;
  }

  const options = {
    lang: 'fr',
    tag: config.PLAYER_NOTIFICATION_ID,
    icon
  };

  let text = '';

  if (show !== null) {
    const format = 'HH[h]mm';
    const start = moment(show.start_at).format(format);
    const end = moment(show.end_at).format(format);

    options.body = `${start}-${end}`;
    text += `${show.title} - `;
  }

  text += radio.name;

  const notification = new Notification(text, options);
  notification.onshow = () => {
    setTimeout(notification.close.bind(notification), config.PLAYER_NOTIFICATION_LENGTH);
  };
};

const showNotification = (radio, show) => {
  if (!('Notification' in window)) {
    return;
  }

  const isMobile = window.matchMedia('only screen and (max-width: 1365px)');
  if (isMobile.matches) {
    return;
  }

  if (Notification.permission === 'granted') {
    buildNotification(radio, show);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission((permission) => {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }

      if (permission === 'granted') {
        buildNotification(radio, show);
      }
    });
  }
};

export default {
  showNotification
};
