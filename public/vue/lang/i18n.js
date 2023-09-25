import { createI18n } from 'vue-i18n';
import { messages, dateTimeFormats } from './lang';

/* eslint-disable no-undef */
const i18n = createI18n({
  // legacy: false,
  // globalInjection: true,
  fallbackLocale: 'en',
  locale,
  messages,
  dateTimeFormats
});

export default i18n;
