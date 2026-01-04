"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import ResultList from "@/components/ResultList";
import HistoryPanel from "@/components/HistoryPanel";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { HistoryItem } from "@/types/history";
import { Entry } from "@/types/krdict";
import Link from "next/link";
import QuickQuiz from "@/components/QuickQuiz";
import ThemeToggle from "@/components/ThemeToggle";

type Direction = "ko-fr" | "fr-ko";

export default function HomePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load direction preference from localStorage
  const {
    state: direction,
    setState: setDirection,
    hydrated: directionHydrated,
  } = useLocalStorageState<Direction>("krdict:direction", "ko-fr");

  const {
    state: history,
    setState: setHistory,
    hydrated,
  } = useLocalStorageState<HistoryItem[]>("krdict:history", []);

  function pushHistory(query: string, dir: Direction) {
    if (!hydrated) return;

    const item: HistoryItem = { q: query, dir, at: Date.now() };

    const next = [item, ...history]
      .filter(
        (v, i, arr) =>
          i === arr.findIndex((x) => x.q === v.q && x.dir === v.dir)
      )
      .slice(0, 50);

    setHistory(next);
  }

  async function search(query: string) {
    setLoading(true);
    setError(null);
    setEntries([]);

    try {
      const res = await fetch(
        `/api/krdict/search?q=${encodeURIComponent(query)}&dir=${direction}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erreur lors de la recherche");
      }

      const data = await res.json();
      setEntries(data.entries ?? []);

      // Record in history
      pushHistory(query, direction);

      // Build local FR index from KO→FR results
      if (direction === "ko-fr") {
        try {
          const raw = localStorage.getItem("krdict:frIndex");
          const frIndex: Record<string, string[]> = raw ? JSON.parse(raw) : {};

          for (const entry of data.entries ?? []) {
            const trWord = entry.senses?.[0]?.translation?.word;
            if (!trWord) continue;

            const fr = trWord.trim().toLowerCase();
            const ko = entry.word;

            frIndex[fr] = Array.from(new Set([...(frIndex[fr] ?? []), ko]));
          }

          localStorage.setItem("krdict:frIndex", JSON.stringify(frIndex));
        } catch {
          // ignore index errors
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les résultats";
      setError(message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-8 px-4 relative">
      {/* Theme Toggle - Fixed position on desktop, relative on mobile */}
      <div className="fixed right-4 top-4 z-50 hidden sm:block">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          {/* Mobile Theme Toggle */}
          <div className="flex justify-end sm:hidden mb-2">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
            K-Study Hub
          </h1>
          <p className="text-[var(--text-secondary)]">
            Dictionnaire Coréen-Français avec Quiz Interactif
          </p>
        </header>

        {/* Direction Selector */}
        <div className="flex justify-center">
          <div className="section-card inline-flex items-center gap-4 p-3">
            <span className="text-sm text-[var(--text-muted)] hidden sm:inline">
              Direction :
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection("ko-fr")}
                className={`direction-btn ${
                  direction === "ko-fr" ? "active" : "inactive"
                }`}
                aria-pressed={direction === "ko-fr"}
              >
                {direction === "ko-fr" && <span className="mr-1"></span>}
                🇰🇷 KO → FR 🇫🇷
              </button>
              <button
                onClick={() => setDirection("fr-ko")}
                className={`direction-btn ${
                  direction === "fr-ko" ? "active" : "inactive"
                }`}
                aria-pressed={direction === "fr-ko"}
              >
                {direction === "fr-ko" && <span className="mr-1"></span>}
                🇫🇷 FR → KO 🇰🇷
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <SearchBar onSearch={search} />

        {/* Loading State */}
        {loading && (
          <div className="section-card py-12 text-center">
            <div className="animate-pulse">
              <p className="text-[var(--text-muted)]">Recherche en cours...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="section-card py-6 text-center border-red-400 animate-fade-in">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && entries.length > 0 && (
          <div className="animate-fade-in">
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {entries.length} résultat{entries.length > 1 ? "s" : ""} trouvé
              {entries.length > 1 ? "s" : ""}
            </p>
            <ResultList entries={entries} />
          </div>
        )}

        {/* History */}
        <HistoryPanel
          history={history}
          setHistory={setHistory}
          hydrated={hydrated}
        />

        {/* Quick Quiz Section */}
        <QuickQuiz />

        {/* Footer */}
        <footer className="text-center text-sm text-[var(--text-muted)] pt-8 space-y-3">
          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              href="/quiz"
              className="link-accent flex items-center gap-2 text-xl"
            >
              🎯 Quiz Aléatoire
            </Link>
            <Link
              href="/favorites"
              className="link-accent flex items-center gap-2 text-xl"
            >
              ★ Favoris
            </Link>
            <Link href="/credits" className="link-accent text-xl">
              Crédits
            </Link>
          </div>

          <p>Source : KRDict – CC BY-SA 2.0 KR</p>
        </footer>
      </div>
    </main>
  );
}
