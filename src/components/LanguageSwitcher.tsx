import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const normalizedLanguage = i18n.language?.slice(0, 2) || 'en';

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm">
      <span aria-hidden="true">🌐</span>
      <select
        aria-label="Change language"
        className="cursor-pointer bg-transparent text-sm outline-none"
        value={normalizedLanguage}
        onChange={(event) => {
          i18n.changeLanguage(event.target.value);
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;

