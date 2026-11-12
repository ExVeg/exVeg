import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getApiBaseUrl } from '../utils/api';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी' },
];

// Instant zero-latency Hindi dictionary for core UI terms before/without network
const INSTANT_HI = {
  'Marketplace': 'बाज़ार',
  'Nursery': 'नर्सरी',
  'Tools': 'उपकरण',
  'Analytics': 'विश्लेषण',
  'Vendor Portal': 'विक्रेता पोर्टल',
  'Admin Console': 'एडमिन कंसोल',
  'Login': 'लॉग इन',
  'Register': 'रजिस्टर करें',
  'Sign Out': 'साइन आउट',
  'Add to Cart': 'कार्ट में जोड़ें',
  'Buy Now': 'अभी खरीदें',
  'Place Order': 'ऑर्डर करें',
  'Your Cart': 'आपका कार्ट',
  'Clear Cart': 'कार्ट खाली करें',
  'Order Summary': 'ऑर्डर सारांश',
  'Delivery Details': 'डिलीवरी विवरण',
  'Welcome Back': 'वापसी पर स्वागत है',
  'Forgot Password?': 'पासवर्ड भूल गए?',
  'Shop by Category': 'श्रेणी के अनुसार खरीदें',
  'Featured Products': 'प्रमुख उत्पाद',
  'View All': 'सभी देखें',
  'Categories': 'श्रेणियाँ',
  'Search': 'खोजें',
  'All Categories': 'सभी श्रेणियाँ',
  'Notifications': 'सूचनाएं',
  'Home': 'होम',
};

const STORAGE_LANG_KEY = 'exveg_selected_lang';
const STORAGE_CACHE_PREFIX = 'exveg_tr_cache_v1_';

const LanguageContext = createContext(null);

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'PATH', 'IFRAME']);

function isSkippableElement(el) {
  if (!el || el.nodeType !== 1) return false;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest?.('.material-symbols-outlined, .notranslate, [data-no-translate="true"]')) return true;
  return false;
}

function shouldSkipText(trimmed) {
  if (!trimmed || trimmed.length < 2) return true;
  if (trimmed === 'ExVeg' || trimmed === 'ExVeg.') return true;
  // Skip pure numbers, currency amounts, symbols, URLs, emails
  if (/^[\d₹$€£%,.\-+/*\s():]+$/.test(trimmed)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return true;
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return true;
  return false;
}

function splitWhitespace(str) {
  const leading = str.match(/^\s*/)?.[0] || '';
  const trailing = str.match(/\s*$/)?.[0] || '';
  const core = str.trim();
  return { leading, core, trailing };
}

function loadLangCache(lang) {
  const map = new Map();
  if (lang === 'hi') {
    Object.entries(INSTANT_HI).forEach(([k, v]) => map.set(k, v));
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_CACHE_PREFIX}${lang}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.entries(parsed).forEach(([k, v]) => map.set(k, v));
    }
  } catch {
    // ignore storage quota errors
  }
  return map;
}

function saveLangCache(lang, cacheMap) {
  try {
    const entries = [...cacheMap.entries()].slice(-1500);
    localStorage.setItem(`${STORAGE_CACHE_PREFIX}${lang}`, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // ignore storage quota errors
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) || 'en';
    } catch {
      return 'en';
    }
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Track original English text per DOM Text node & attributes per Element without touching DOM hierarchy
  const textRecordsRef = useRef(new WeakMap());
  const trackedNodesRef = useRef(new Set());
  const attrRecordsRef = useRef(new WeakMap());
  const trackedAttrsRef = useRef(new Set());
  const cacheRef = useRef(new Map());
  const langRef = useRef(language);
  const isApplyingRef = useRef(false);
  const scanTimerRef = useRef(null);

  useEffect(() => {
    langRef.current = language;
    document.documentElement.lang = language || 'en';
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = useCallback((nextLang) => {
    setLanguageState(nextLang || 'en');
  }, []);

  const toggleHindiEnglish = useCallback(() => {
    setLanguageState((prev) => (prev === 'hi' ? 'en' : 'hi'));
  }, []);

  const fetchBatchTranslations = useCallback(async (texts, targetLang) => {
    if (!texts.length || targetLang === 'en') return {};
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, targetLang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.translations) return data.translations;
      }
    } catch {
      // fallback below
    }

    // Direct Google client=gtx fallback if local backend is unreachable
    const result = {};
    const limited = texts.slice(0, 30);
    await Promise.all(
      limited.map(async (text) => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
          const r = await fetch(url);
          if (!r.ok) return;
          const d = await r.json();
          const tr = Array.isArray(d?.[0]) ? d[0].map((p) => p?.[0] || '').join('') : '';
          if (tr) result[text] = tr;
        } catch {
          // ignore network failure
        }
      })
    );
    return result;
  }, []);

  const restoreEnglishDom = useCallback(() => {
    isApplyingRef.current = true;
    try {
      trackedNodesRef.current.forEach((node) => {
        if (!node.isConnected) {
          trackedNodesRef.current.delete(node);
          return;
        }
        const rec = textRecordsRef.current.get(node);
        if (rec && node.nodeValue !== rec.en) {
          node.nodeValue = rec.en;
          rec.lastTranslated = rec.en;
        }
      });
      trackedAttrsRef.current.forEach((el) => {
        if (!el.isConnected) {
          trackedAttrsRef.current.delete(el);
          return;
        }
        const attrs = attrRecordsRef.current.get(el);
        if (attrs) {
          Object.entries(attrs).forEach(([attrName, rec]) => {
            if (el.getAttribute(attrName) !== rec.en) {
              el.setAttribute(attrName, rec.en);
              rec.lastTranslated = rec.en;
            }
          });
        }
      });
    } finally {
      isApplyingRef.current = false;
    }
  }, []);

  const translatePage = useCallback(async (targetLang) => {
    if (!targetLang || targetLang === 'en') {
      restoreEnglishDom();
      setIsTranslating(false);
      return;
    }

    if (!cacheRef.current.has(targetLang)) {
      cacheRef.current.set(targetLang, loadLangCache(targetLang));
    }
    const langCache = cacheRef.current.get(targetLang);

    const pendingNodes = [];
    const pendingAttrs = [];
    const neededSet = new Set();

    // Walk text nodes
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const parent = current.parentElement;
      if (parent && !isSkippableElement(parent)) {
        const raw = current.nodeValue || '';
        const existingRec = textRecordsRef.current.get(current);

        let enRaw = raw;
        if (existingRec) {
          // If node text differs from the last value we wrote, React updated this node with fresh source text
          if (raw !== existingRec.lastTranslated && raw !== existingRec.en) {
            existingRec.en = raw;
            existingRec.lastTranslated = raw;
          }
          enRaw = existingRec.en;
        } else {
          textRecordsRef.current.set(current, { en: raw, lastTranslated: raw });
          trackedNodesRef.current.add(current);
        }

        const { core } = splitWhitespace(enRaw);
        if (!shouldSkipText(core)) {
          pendingNodes.push({ node: current, enRaw });
          if (!langCache.has(core)) neededSet.add(core);
        }
      }
      current = walker.nextNode();
    }

    // Walk translatable attributes
    const attrEls = document.body.querySelectorAll('[placeholder], [title], [aria-label]');
    attrEls.forEach((el) => {
      if (isSkippableElement(el)) return;
      let recMap = attrRecordsRef.current.get(el);
      if (!recMap) {
        recMap = {};
        attrRecordsRef.current.set(el, recMap);
        trackedAttrsRef.current.add(el);
      }
      ['placeholder', 'title', 'aria-label'].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (!val) return;
        const rec = recMap[attr];
        let enVal = val;
        if (rec) {
          if (val !== rec.lastTranslated && val !== rec.en) {
            rec.en = val;
            rec.lastTranslated = val;
          }
          enVal = rec.en;
        } else {
          recMap[attr] = { en: val, lastTranslated: val };
        }
        const trimmed = enVal.trim();
        if (!shouldSkipText(trimmed)) {
          pendingAttrs.push({ el, attr, enVal, trimmed });
          if (!langCache.has(trimmed)) neededSet.add(trimmed);
        }
      });
    });

    const applyCachedToDom = () => {
      if (langRef.current !== targetLang) return;
      isApplyingRef.current = true;
      try {
        pendingNodes.forEach(({ node, enRaw }) => {
          if (!node.isConnected) return;
          const { leading, core, trailing } = splitWhitespace(enRaw);
          const translated = langCache.get(core);
          if (translated) {
            const nextVal = `${leading}${translated}${trailing}`;
            if (node.nodeValue !== nextVal) {
              node.nodeValue = nextVal;
            }
            const rec = textRecordsRef.current.get(node);
            if (rec) rec.lastTranslated = nextVal;
          }
        });
        pendingAttrs.forEach(({ el, attr, trimmed }) => {
          if (!el.isConnected) return;
          const translated = langCache.get(trimmed);
          if (translated) {
            if (el.getAttribute(attr) !== translated) {
              el.setAttribute(attr, translated);
            }
            const recMap = attrRecordsRef.current.get(el);
            if (recMap?.[attr]) recMap[attr].lastTranslated = translated;
          }
        });
      } finally {
        isApplyingRef.current = false;
      }
    };

    // Apply immediately known cached/dictionary strings first
    applyCachedToDom();

    const missing = [...neededSet];
    if (missing.length === 0) {
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    // Batch into requests of up to 75 strings
    for (let i = 0; i < missing.length; i += 75) {
      if (langRef.current !== targetLang) break;
      const slice = missing.slice(i, i + 75);
      const fetched = await fetchBatchTranslations(slice, targetLang);
      Object.entries(fetched).forEach(([orig, tr]) => {
        if (tr) langCache.set(orig, tr);
      });
    }

    saveLangCache(targetLang, langCache);
    applyCachedToDom();
    if (langRef.current === targetLang) {
      setIsTranslating(false);
    }
  }, [fetchBatchTranslations, restoreEnglishDom]);

  // Run whenever selected language changes + watch DOM changes from routing/modals/data fetching
  useEffect(() => {
    translatePage(language);

    const observer = new MutationObserver(() => {
      if (isApplyingRef.current || langRef.current === 'en') return;
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = setTimeout(() => {
        translatePage(langRef.current);
      }, 90);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      clearTimeout(scanTimerRef.current);
    };
  }, [language, translatePage]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleHindiEnglish,
        isTranslating,
        languages: INDIAN_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

