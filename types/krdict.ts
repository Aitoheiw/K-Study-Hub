export type Translation = {
  lang?: string;
  word?: string;
  definition?: string;
};

export type Sense = {
  order?: string;
  definition?: string;
  translation?: Translation;
};

export type Entry = {
  targetCode: string;
  word: string;
  pos?: string;
  origin?: string;
  pronunciation?: string;
  definition?: string;
  link?: string;
  senses?: Sense[];
};
