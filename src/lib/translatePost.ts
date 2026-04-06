import { Language } from '@/i18n/translations';

export type TranslationService = 'deepl' | 'claude' | 'mymemory';

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

// Calls the Supabase Edge Function which handles DeepL → Claude → MyMemory fallback server-side
async function callTranslateFunction(
  text: string,
  targetLang: 'en' | 'es',
  isHtml = false
): Promise<{ translated: string; service: TranslationService }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ text, targetLang, isHtml }),
  });

  if (!res.ok) throw new Error(`Translation function error: ${res.status}`);
  return res.json();
}

export async function autoTranslatePost(
  fields: PostFields,
  targetLang: 'en' | 'es'
): Promise<TranslatedPost> {
  const [titleResult, excerptResult, contentResult] = await Promise.all([
    callTranslateFunction(fields.title, targetLang, false),
    fields.excerpt
      ? callTranslateFunction(fields.excerpt, targetLang, false)
      : Promise.resolve({ translated: '', service: 'mymemory' as TranslationService }),
    fields.content
      ? callTranslateFunction(fields.content, targetLang, true)
      : Promise.resolve({ translated: '', service: 'mymemory' as TranslationService }),
  ]);

  return {
    title: titleResult.translated,
    excerpt: excerptResult.translated,
    content: contentResult.translated,
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
