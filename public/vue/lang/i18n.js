import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { messages, dateTimeFormats } from './lang';

Vue.use(VueI18n);

/* eslint-disable no-undef */
const i18n = new VueI18n({
  fallbackLocale: 'fr',
  locale,
  messages,
  dateTimeFormats
});

export default i18n;
