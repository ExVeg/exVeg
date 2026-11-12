import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ compact = false }) => {
  const { language, setLanguage, toggleHindiEnglish, isTranslating, languages } = useLanguage();
  const isHindi = language === 'hi';

  return (
    <div className="notranslate flex items-center gap-1.5" data-no-translate="true">
      {/* Direct Hindi / English toggle button */}
      <button
        type="button"
        onClick={toggleHindiEnglish}
        title={isHindi ? 'Switch page to English' : 'Switch page to Hindi (हिन्दी)'}
        aria-label="Toggle Hindi and English language"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
          isHindi
            ? 'bg-primary text-white border-primary shadow-sm'
            : 'bg-primary-fixed/70 text-primary border-primary/25 hover:bg-primary hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[15px]">translate</span>
        <span>{isHindi ? 'EN' : 'हिन्दी'}</span>
      </button>

      {/* Dropdown for all Indian languages */}
      <div className="relative flex items-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select Indian language"
          title="Translate app to another Indian language"
          className={`bg-surface-container-low hover:bg-white border border-outline-variant/40 text-on-surface rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-colors ${
            compact ? 'py-1.5 pl-2.5 pr-6 max-w-[110px]' : 'py-1.5 pl-3 pr-7 max-w-[140px]'
          }`}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} {lang.code !== 'en' ? `(${lang.name})` : ''}
            </option>
          ))}
        </select>
        {isTranslating && (
          <span
            className="ml-1 w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"
            title="Translating..."
          />
        )}
      </div>
    </div>
  );
};

export default LanguageSwitcher;

