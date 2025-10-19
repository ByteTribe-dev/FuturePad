import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const i18n = new I18n({
  en,
  es,
  fr,
  de,
  it,
  pt,
  ru,
  zh,
  ja,
  ko,
});

// Get device locale - Expo Localization returns language code like 'en-US', we need just 'en'
const getDeviceLocale = () => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    return locales[0].languageCode || 'en';
  }
  return 'en';
};

// Set the locale once at the beginning of your app
i18n.locale = getDeviceLocale();

// When a value is missing from a language it'll fallback to another language with the key present
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const setI18nLocale = (locale: string) => {
  i18n.locale = locale;
};

export const translate = (key: string, options?: any) => {
  return i18n.t(key, options);
};

export default i18n;
