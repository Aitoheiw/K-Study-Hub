import { NextResponse } from "next/server";
import { parseKrdictXml, KrdictEntry } from "@/lib/parseKrdictXml";

type Direction = "ko-fr" | "fr-ko";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
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
      // Strategy: Use "trans_word" part to search in translation words
      // And also try searching common Korean words that might have this French translation

      // First, try to search using the translated word part
      let r = await callKrdict({
        ...withFrenchTranslations,
        q,
        part: "trans_word", // Search in translation words
        method: "include",
      });

      let raw: KrdictEntry[] = [];
      if (r.ok) {
        raw = parseKrdictXml(r.xml);
      }

      // If no results, try searching in translation definitions
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

      // If still no results, try a broader approach: fetch common words and filter
      if (raw.length === 0) {
        // Try to find words that might translate to the French query
        // This is a workaround since KRDict doesn't have great FR→KO support
        const commonKorean = getKoreanForFrench(q.toLowerCase());

        if (commonKorean.length > 0) {
          for (const koWord of commonKorean.slice(0, 3)) {
            r = await callKrdict({
              ...withFrenchTranslations,
              q: koWord,
              part: "word",
              method: "exact",
            });
            if (r.ok) {
              const found = parseKrdictXml(r.xml);
              raw.push(...found);
            }
          }
        }
      }

      if (raw.length === 0 && !r.ok) {
        return NextResponse.json(
          { error: `KRDict error: ${r.status}` },
          { status: 502 }
        );
      }

      // Filter entries to only include those with matching French translation
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

// Helper function: common French-Korean word mappings for fallback
function getKoreanForFrench(french: string): string[] {
  const mapping: Record<string, string[]> = {
    // Greetings
    bonjour: ["안녕", "안녕하세요", "인사"],
    salut: ["안녕", "여보세요"],
    bonsoir: ["안녕하세요"],
    merci: ["감사", "고마워", "고맙다"],
    "au revoir": ["안녕", "안녕히"],
    oui: ["예", "네"],
    non: ["아니", "아니요"],

    // Common words
    amour: ["사랑", "애정"],
    ami: ["친구", "벗"],
    famille: ["가족", "가정"],
    maison: ["집", "가옥"],
    eau: ["물", "수"],
    manger: ["먹다", "식사"],
    boire: ["마시다"],
    dormir: ["자다", "잠"],
    aimer: ["사랑하다", "좋아하다"],
    travail: ["일", "직장", "노동"],
    ecole: ["학교"],
    livre: ["책", "서적"],
    musique: ["음악"],
    film: ["영화"],
    voiture: ["차", "자동차"],
    temps: ["시간", "날씨"],
    jour: ["날", "하루"],
    nuit: ["밤", "야간"],
    matin: ["아침"],
    soir: ["저녁"],
    homme: ["남자", "사람"],
    femme: ["여자", "여성"],
    enfant: ["아이", "어린이"],
    pere: ["아버지", "아빠"],
    mere: ["어머니", "엄마"],
    frere: ["형", "오빠", "동생", "남동생"],
    soeur: ["언니", "누나", "여동생"],
    coeur: ["마음", "심장"],
    vie: ["삶", "생활", "인생"],
    mort: ["죽음", "사망"],
    heureux: ["행복", "기쁘다"],
    triste: ["슬프다", "슬픔"],
    beau: ["아름답다", "예쁘다"],
    grand: ["크다", "큰"],
    petit: ["작다", "작은"],
    nouveau: ["새롭다", "신"],
    vieux: ["늙다", "오래되다"],
    bien: ["잘", "좋다"],
    mal: ["나쁘다", "아프다"],
    chaud: ["덥다", "뜨겁다"],
    froid: ["춥다", "차갑다"],
  };

  // Normalize the French word
  const normalized = french
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  return mapping[normalized] || [];
}
