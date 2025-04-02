import { LANGUAGES } from '../../constant';
import { LanguageType } from '../../types';
import { useSyncedStore } from '../lib/store';

export function LanguageSelector() {
  const { language, setLanguage } = useSyncedStore();

  return (
    <div className="mb-3 px-2 space-y-1">
      <div className="flex items-center justify-between text-[13px] font-medium text-white/90">
        <span>Language</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageType)}
          className="bg-white/10 rounded px-2 py-1 text-sm outline-none border border-white/10 focus:border-white/20"
        >
          {Object.keys(LANGUAGES).map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGES[lang as keyof typeof LANGUAGES]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
