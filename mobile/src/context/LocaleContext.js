import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { IntlProvider } from 'use-intl';

import { messages, normalizeLocale, DEFAULT_LOCALE } from '../i18n';

const STORAGE_KEY = 'locale';

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  // Restore a saved choice, otherwise follow the device language.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) {
        setLocaleState(normalizeLocale(saved));
      } else {
        const device = getLocales()?.[0]?.languageCode;
        setLocaleState(normalizeLocale(device));
      }
    });
  }, []);

  const setLocale = (next) => {
    const normalized = normalizeLocale(next);
    setLocaleState(normalized);
    AsyncStorage.setItem(STORAGE_KEY, normalized).catch(() => {});
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export const useLocaleControl = () => useContext(LocaleContext);
