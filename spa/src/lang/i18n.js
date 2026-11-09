import { createI18n } from 'vue-i18n';

import { dateTimeFormats } from './dateTimeFormats.js';
// fallback locale, always in the main bundle
import en from './locales/en.js';

const FALLBACK_LOCALE = 'en';

// every other locale is a separate chunk, only the current one is downloaded (see loadLocale)
const localeLoaders = import.meta.glob(['./locales/*.js', '!./locales/en.js']);

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  fallbackLocale: FALLBACK_LOCALE,
  // eslint-disable-next-line no-undef
  locale,
  messages: { [FALLBACK_LOCALE]: en },
  dateTimeFormats
});

// loads the messages of the locale, to be awaited before mounting the app.
// An unknown locale or a failed loading leaves the fallback (english) messages
export const loadLocale = async (localeToLoad) => {
  const loader = localeLoaders[`./locales/${localeToLoad}.js`];

  if (!loader) {
    return;
  }

  const module = await loader();
  i18n.global.setLocaleMessage(localeToLoad, module.default);
};

export default i18n;
