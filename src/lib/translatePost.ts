import { Language } from '@/i18n/translations';

// ── Helpers ────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── DeepL (Free tier: 500k chars/month, key required) ─────────────────────

async function translateWithDeepl(
  text: string,
  targetLang: 'en' | 'es',
  isHtml = false
): Promise<string> {
  const key = import.meta.env.VITE_DEEPL_API_KEY;
  if (!key) throw new Error('No DeepL key');

  const deeplLang = targetLang === 'en' ? 'EN' : 'ES';
  const body = new URLSearchParams({
    auth_key: key,
    text,
    source_lang: 'PT',
    target_lang: deeplLang,
    ...(isHtml ? { tag_handling: 'html' } : {}),
  });

  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) throw new Error(`DeepL error: ${res.status}`);
  const data = await res.json();
  return data.translations?.[0]?.text ?? '';
}

// ── Claude API (Haiku - very cheap, great quality) ─────────────────────────

async function translateWithClaude(
  text: string,
  targetLang: 'en' | 'es',
  isHtml = false
): Promise<string> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) throw new Error('No Anthropic key');

  const langName = targetLang === 'en' ? 'English' : 'Spanish';
  const htmlInstruction = isHtml
    ? ' Preserve all HTML tags exactly as they are. Only translate the text content inside the tags.'
    : '';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Translate the following Brazilian Portuguese text to ${langName}. Return only the translated text, nothing else.${htmlInstruction}\n\n${text}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// ── MyMemory (Free, no key, 500 chars/request, text only) ─────────────────

async function translateWithMyMemory(text: string, targetLang: 'en' | 'es'): Promise<string> {
  // MyMemory handles short plain text only
  const plain = stripHtml(text).slice(0, 500);
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(plain)}&langpair=pt|${targetLang}`
  );
  if (!res.ok) throw new Error('MyMemory error');
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails);
  return data.responseData.translatedText;
}

// ── Public translation function with fallback chain ────────────────────────

export type TranslationService = 'deepl' | 'claude' | 'mymemory';

export interface TranslateResult {
  text: string;
  service: TranslationService;
}

async function translateWithFallback(
  text: string,
  targetLang: 'en' | 'es',
  isHtml = false
): Promise<TranslateResult> {
  // 1. Try DeepL
  try {
    const result = await translateWithDeepl(text, targetLang, isHtml);
    if (result) return { text: result, service: 'deepl' };
  } catch {
    // fall through
  }

  // 2. Try Claude API
  try {
    const result = await translateWithClaude(text, targetLang, isHtml);
    if (result) return { text: result, service: 'claude' };
  } catch {
    // fall through
  }

  // 3. Fall back to MyMemory (plain text only, limited to 500 chars)
  const result = await translateWithMyMemory(isHtml ? stripHtml(text) : text, targetLang);
  return { text: result, service: 'mymemory' };
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface PostFields {
  title: string;
  excerpt: string;
  content: string;
}

export interface TranslatedPost {
  title: string;
  excerpt: string;
  content: string;
  service: TranslationService;
}

export async function autoTranslatePost(
  fields: PostFields,
  targetLang: 'en' | 'es'
): Promise<TranslatedPost> {
  const [titleResult, excerptResult, contentResult] = await Promise.all([
    translateWithFallback(fields.title, targetLang, false),
    fields.excerpt
      ? translateWithFallback(fields.excerpt, targetLang, false)
      : Promise.resolve({ text: '', service: 'mymemory' as TranslationService }),
    fields.content
      ? translateWithFallback(fields.content, targetLang, true)
      : Promise.resolve({ text: '', service: 'mymemory' as TranslationService }),
  ]);

  return {
    title: titleResult.text,
    excerpt: excerptResult.text,
    content: contentResult.text,
    service: titleResult.service,
  };
}

export function getLocalizedField(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: Record<string, any>,
  field: string,
  language: Language
): string {
  if (language === 'pt') return post[field] || '';
  const localizedKey = `${field}_${language}`;
  return post[localizedKey] || post[field] || '';
}
