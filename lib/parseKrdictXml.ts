import { XMLParser } from "fast-xml-parser";

export type Translation = {
  lang?: string; // ex: "영어", "프랑스어"
  word?: string; // trans_word
  definition?: string; // trans_dfn
};

export type Sense = {
  order?: string;
  definition?: string; // définition coréenne
  translation?: Translation; // traduction demandée (FR ici)
};

export type KrdictEntry = {
  targetCode: string;
  word: string;
  pos?: string;
  origin?: string;
  pronunciation?: string;
  link?: string;
  senses: Sense[];
};

function toArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function parseKrdictXml(xml: string): KrdictEntry[] {
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const json = parser.parse(xml);

  const items = json?.channel?.item;
  if (!items) return [];

  const itemArray = Array.isArray(items) ? items : [items];

  return itemArray.map((item: any) => {
    const sensesRaw = toArray(item.sense);

    const senses: Sense[] = sensesRaw.map((s: any) => {
      const tr = s.translation; // peut être undefined si translated=n
      return {
        order: s.sense_order,
        definition: s.definition,
        translation: tr
          ? {
              lang: tr.trans_lang,
              word: tr.trans_word,
              definition: tr.trans_dfn,
            }
          : undefined,
      };
    });

    return {
      targetCode: String(item.target_code),
      word: item.word,
      pos: item.pos,
      origin: item.origin,
      pronunciation: item.pronunciation,
      link: item.link,
      senses,
    };
  });
}
