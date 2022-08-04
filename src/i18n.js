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
import 'intl/locale-data/jsonp/vi';

import enGB from 'antd/lib/locale-provider/en_GB';
import viVN from 'antd/lib/locale-provider/vi_VN';

import enTranslationMessages from './translations/en.json';
import viTranslationMessages from './translations/vi.json';

const DEFAULT_LOCALE = 'en';

// prettier-ignore
const appLocales = [
  'en',
  'vi',
];

const translationMessages = {
  en: enTranslationMessages,
  vi: viTranslationMessages
};

const localeAntd = {
  en: enGB,
  vi: viVN
};

export { appLocales, translationMessages, DEFAULT_LOCALE, localeAntd };
