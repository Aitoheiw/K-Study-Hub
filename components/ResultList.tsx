"use client";

import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import { Entry } from "@/types/krdict";

type Props = {
  entries: Entry[];
};

export default function ResultList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="section-card text-center py-12">
        <p className="text-[var(--text-muted)] text-lg">
          Aucun résultat trouvé
        </p>
        <p className="text-[var(--text-muted)] text-sm mt-2">
          Essayez avec un autre mot
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry, index) => {
        // Get the first French translation if available
        const frTranslation = entry.senses?.[0]?.translation;
        const frWord = frTranslation?.word;
        const frDefinition = frTranslation?.definition || entry.definition;

        return (
          <li
            key={entry.targetCode}
            className="glass-card p-5 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href={`/word/${encodeURIComponent(entry.word)}`}
                    className="text-xl font-bold hover:text-[var(--accent)] transition-colors"
                  >
                    {entry.word}
                  </Link>

                  {entry.pronunciation && (
                    <span className="text-[var(--text-muted)] text-sm">
                      [{entry.pronunciation}]
                    </span>
                  )}

                  {entry.pos && (
                    <span className="badge badge-ko">{entry.pos}</span>
                  )}
                </div>

                {frWord && (
                  <p className="text-lg text-[var(--primary-end)] mt-2 font-medium">
                    → {frWord}
                  </p>
                )}

                {frDefinition && (
                  <p className="text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {frDefinition}
                  </p>
                )}

                {entry.origin && (
                  <p className="text-[var(--text-muted)] text-sm mt-2">
                    Origine : {entry.origin}
                  </p>
                )}

                {/* Show additional senses if available */}
                {entry.senses && entry.senses.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      Autres sens :
                    </p>
                    <ul className="space-y-1">
                      {entry.senses.slice(1, 3).map((sense, i) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--text-secondary)]"
                        >
                          {sense.translation?.word && (
                            <span className="text-[var(--primary-end)]">
                              {sense.translation.word}
                            </span>
                          )}
                          {sense.translation?.definition && (
                            <span className="text-[var(--text-muted)]">
                              {" "}
                              — {sense.translation.definition}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <FavoriteButton entry={entry} />
            </div>

            {entry.link && (
              <a
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent text-sm mt-3 inline-block"
              >
                Voir sur KRDict →
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
