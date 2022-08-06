/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 *
 *   IMPORTANT: This file is used by the internal build
 *   script `extract-intl`, and must use CommonJS module syntax
 *   You CANNOT use import/export in this file.
 */
import 'intl/locale-data/jsonp/en';

import enGB from 'antd/lib/locale-provider/en_GB';

import enTranslationMessages from './translations/en.json';

const DEFAULT_LOCALE = 'en';

// prettier-ignore
const appLocales = [
  'en',
];

const translationMessages = {
  en: enTranslationMessages,
};

const localeAntd = {
  en: enGB,
};

export { appLocales, translationMessages, DEFAULT_LOCALE, localeAntd };
