import { createI18n } from 'vue-i18n';
import { messages, dateTimeFormats } from './lang.js';

const i18n = createI18n({
  // legacy: false,
  // globalInjection: true,
  fallbackLocale: 'en',
  // eslint-disable-next-line no-undef
  locale,
  messages,
  dateTimeFormats
});

export default i18n;
