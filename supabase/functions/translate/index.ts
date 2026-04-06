import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequest {
  text: string;
  targetLang: "en" | "es";
  isHtml?: boolean;
}

// ── DeepL ──────────────────────────────────────────────────────────────────

async function translateWithDeepl(text: string, targetLang: "en" | "es", isHtml: boolean): Promise<string> {
  const key = Deno.env.get("DEEPL_API_KEY");
  if (!key) throw new Error("No DeepL key");

  const body = new URLSearchParams({
    text,
    source_lang: "PT",
    target_lang: targetLang === "en" ? "EN" : "ES",
    ...(isHtml ? { tag_handling: "html" } : {}),
  });

  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `DeepL-Auth-Key ${key}`,
    },
    body,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`DeepL error: ${res.status} - ${detail}`);
  }
  const data = await res.json();
  const translated = data.translations?.[0]?.text;
  if (!translated) throw new Error("DeepL returned empty translation");
  return translated;
}

// ── Claude ─────────────────────────────────────────────────────────────────

async function translateWithClaude(text: string, targetLang: "en" | "es", isHtml: boolean): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("No Anthropic key");

  const langName = targetLang === "en" ? "English" : "Spanish";
  const htmlInstruction = isHtml
    ? " Preserve all HTML tags exactly as they are. Only translate the visible text content inside the tags."
    : "";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Translate the following Brazilian Portuguese text to ${langName}. Return only the translated text, nothing else.${htmlInstruction}\n\n${text}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data = await res.json();
  const translated = data.content?.[0]?.text;
  if (!translated) throw new Error("Claude returned empty translation");
  return translated;
}

// ── MyMemory (fallback) ────────────────────────────────────────────────────

async function translateWithMyMemory(text: string, targetLang: "en" | "es"): Promise<string> {
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(plain)}&langpair=pt|${targetLang}`
  );
  if (!res.ok) throw new Error("MyMemory error");
  const data = await res.json();
  return data.responseData?.translatedText ?? text;
}

// ── Main handler ───────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLang, isHtml = false }: TranslateRequest = await req.json();

    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: "Missing text or targetLang" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let translated = "";
    let service = "";

    // 1. Try DeepL
    try {
      translated = await translateWithDeepl(text, targetLang, isHtml);
      service = "deepl";
    } catch (e) {
      console.warn("DeepL failed:", e);
    }

    // 2. Try Claude
    if (!translated) {
      try {
        translated = await translateWithClaude(text, targetLang, isHtml);
        service = "claude";
      } catch (e) {
        console.warn("Claude failed:", e);
      }
    }

    // 3. MyMemory fallback
    if (!translated) {
      translated = await translateWithMyMemory(text, targetLang);
      service = "mymemory";
    }

    return new Response(JSON.stringify({ translated, service }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
