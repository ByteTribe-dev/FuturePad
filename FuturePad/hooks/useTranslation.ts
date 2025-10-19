import { useEffect, useState } from 'react';
import i18n, { setI18nLocale, translate } from '../i18n';
import { useAppStore } from '../store/useAppStore';

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    setI18nLocale(language);
    forceUpdate((prev) => prev + 1);
  }, [language]);

  const t = (key: string, options?: any) => {
    return translate(key, options);
  };

  return { t, i18n };
};
