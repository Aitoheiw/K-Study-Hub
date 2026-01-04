import { NextResponse } from "next/server";
import { parseKrdictXml, KrdictEntry } from "@/lib/parseKrdictXml";

type Direction = "ko-fr" | "fr-ko";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// Translate French to Korean using MyMemory API (free, no API key required)
async function translateFrenchToKorean(text: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=fr|ko`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.warn("MyMemory API error:", res.status);
      return null;
    }

    const data = await res.json();

    // Check if translation was successful
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      // MyMemory returns the original text if it can't translate
      if (translated.toLowerCase() === text.toLowerCase()) {
        return null;
      }
      return translated;
    }

    return null;
  } catch (error) {
    console.warn("Translation error:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") ?? "").trim();
    const dir = (searchParams.get("dir") ?? "ko-fr") as Direction;

    if (!q) {
      return NextResponse.json(
        { error: "Missing query parameter `q`" },
        { status: 400 }
      );
    }
    if (q.length < 2) {
      return NextResponse.json(
        { error: "Query too short (min 2 characters)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.KRDICT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing KRDICT_API_KEY (check .env.local and restart dev server)",
        },
        { status: 500 }
      );
    }

    const baseUrl = "https://krdict.korean.go.kr/api/search";

    async function callKrdict(params: Record<string, string>) {
      const url = new URL(baseUrl);
      url.searchParams.set("key", String(apiKey));
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      console.log("Calling KRDict:", url.toString());
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        return { ok: false as const, status: res.status, xml: "" };
      }
      const xml = await res.text();
      return { ok: true as const, status: res.status, xml };
    }

    const common: Record<string, string> = {
      num: "30",
      sort: "dict",
    };

    // Parameters with French translations
    const withFrenchTranslations: Record<string, string> = {
      ...common,
      advanced: "y",
      translated: "y",
      trans_lang: "3", // French
    };

    let entries: KrdictEntry[] = [];

    if (dir === "ko-fr") {
      // KO→FR: Search Korean words
      const r = await callKrdict({
        ...withFrenchTranslations,
        q,
        part: "word",
        method: "include",
      });
      if (!r.ok) {
        return NextResponse.json(
          { error: `KRDict error: ${r.status}` },
          { status: 502 }
        );
      }
      entries = parseKrdictXml(r.xml);
    } else {
      // FR→KO: Search for French word in translations
      let raw: KrdictEntry[] = [];
      let r;

      // Strategy 1: Search in KRDict's French translation fields
      r = await callKrdict({
        ...withFrenchTranslations,
        q,
        part: "trans_word", // Search in translation words
        method: "include",
      });

      if (r.ok) {
        raw = parseKrdictXml(r.xml);
      }

      // Strategy 2: If no results, try searching in translation definitions
      if (raw.length === 0) {
        r = await callKrdict({
          ...withFrenchTranslations,
          q,
          part: "trans_dfn", // Search in translation definitions
          method: "include",
        });
        if (r.ok) {
          raw = parseKrdictXml(r.xml);
        }
      }

      // Strategy 3: Use MyMemory to translate French → Korean, then search KRDict
      if (raw.length === 0) {
        console.log("No KRDict results, trying MyMemory translation...");
        const koreanTranslation = await translateFrenchToKorean(q);

        if (koreanTranslation) {
          console.log(`Translated "${q}" → "${koreanTranslation}"`);

          // Search KRDict with the translated Korean word
          r = await callKrdict({
            ...withFrenchTranslations,
            q: koreanTranslation,
            part: "word",
            method: "include",
          });

          if (r.ok) {
            raw = parseKrdictXml(r.xml);
          }

          // If still no results, try exact match
          if (raw.length === 0) {
            r = await callKrdict({
              ...withFrenchTranslations,
              q: koreanTranslation,
              part: "word",
              method: "exact",
            });
            if (r.ok) {
              raw = parseKrdictXml(r.xml);
            }
          }
        }
      }

      if (raw.length === 0 && r && !r.ok) {
        return NextResponse.json(
          { error: `KRDict error: ${r.status}` },
          { status: 502 }
        );
      }

      // Filter entries to prioritize those with matching French translation
      const qNorm = normalize(q);
      entries = raw
        .map((e) => {
          const matchedSenses = e.senses.filter((s) => {
            const tw = s.translation?.word ? normalize(s.translation.word) : "";
            const td = s.translation?.definition
              ? normalize(s.translation.definition)
              : "";
            return tw.includes(qNorm) || td.includes(qNorm);
          });
          return {
            ...e,
            senses: matchedSenses.length > 0 ? matchedSenses : e.senses,
          };
        })
        .filter((e) => e.senses.length > 0);

      // Deduplicate by targetCode
      const seen = new Set<string>();
      entries = entries.filter((e) => {
        if (seen.has(e.targetCode)) return false;
        seen.add(e.targetCode);
        return true;
      });
    }

    return NextResponse.json({
      query: q,
      direction: dir,
      count: entries.length,
      entries,
      attribution: {
        source: "한국어기초사전 (KRDict) Open API",
        license: "CC BY-SA 2.0 KR",
        licenseUrl: "http://ccl.cckorea.org",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
