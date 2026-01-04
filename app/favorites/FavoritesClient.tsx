"use client";

import Link from "next/link";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { Entry } from "@/types/krdict";

export default function FavoritesClient() {
  const {
    state: favorites,
    setState: setFavorites,
    hydrated,
  } = useLocalStorageState<Entry[]>("krdict:favorites", []);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-20 w-full"></div>
        <div className="skeleton h-20 w-full"></div>
        <div className="skeleton h-20 w-full"></div>
      </div>
    );
  }

  function clear() {
    setFavorites([]);
  }

  function remove(targetCode: string) {
    setFavorites(favorites.filter((f) => f.targetCode !== targetCode));
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-[var(--text-muted)]">
          {favorites.length} favori{favorites.length !== 1 ? "s" : ""}
        </p>
        {favorites.length > 0 && (
          <button onClick={clear} className="btn-secondary text-sm">
            Tout supprimer
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="section-card text-center py-12">
          <p className="text-4xl mb-4">☆</p>
          <p className="text-[var(--text-muted)]">
            Aucun favori pour le moment
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            Ajoute des mots à tes favoris depuis les résultats de recherche
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {favorites.map((f, index) => (
            <li
              key={f.targetCode}
              className="glass-card p-4 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/word/${encodeURIComponent(f.word)}`}
                    className="text-xl font-bold hover:text-[var(--accent)] transition-colors"
                  >
                    {f.word}
                  </Link>
                  {f.senses?.[0]?.translation?.word && (
                    <p className="text-[var(--primary-end)] mt-1">
                      → {f.senses[0].translation.word}
                    </p>
                  )}
                  {f.definition && (
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                      {f.definition}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(f.targetCode)}
                  className="btn-secondary text-sm"
                  title="Retirer des favoris"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
