"use client";

import Link from "next/link";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { HistoryItem } from "@/types/history";
import ThemeToggle from "@/components/ThemeToggle";

export default function HistoryPage() {
  const {
    state: history,
    setState: setHistory,
    hydrated,
  } = useLocalStorageState<HistoryItem[]>("krdict:history", []);

  function clearAll() {
    setHistory([]);
  }

  function removeItem(index: number) {
    const next = history.filter((_, i) => i !== index);
    setHistory(next);
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="section-card p-6">
            <div className="animate-pulse space-y-4">
              <div className="skeleton h-8 w-1/3"></div>
              <div className="skeleton h-6 w-full"></div>
              <div className="skeleton h-6 w-3/4"></div>
              <div className="skeleton h-6 w-1/2"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 relative">
      <div className="fixed right-4 top-4 z-50 hidden sm:block">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <div className="flex justify-end sm:hidden mb-2">
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc200 hover:text-[var(--accent)] transition-colors"
          >
            ← Retour à la recherche
          </Link>
        </header>

        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text">
            📜 Historique des recherches
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {history.length} recherche{history.length > 1 ? "s" : ""}{" "}
            enregistrée{history.length > 1 ? "s" : ""}
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex justify-center">
            <button onClick={clearAll} className="btn-secondary">
              🗑️ Effacer tout l'historique
            </button>
          </div>
        )}

        {history.length === 0 ? (
          <div className="section-card p-8 text-center">
            <p className="text-[var(--text-muted)] text-lg">
              Aucune recherche dans l'historique.
            </p>
            <Link href="/" className="btn-primary inline-block mt-4">
              Faire une recherche
            </Link>
          </div>
        ) : (
          <div className="section-card p-6">
            <ul className="space-y-3">
              {history.map((item, idx) => (
                <li
                  key={`${item.at}-${idx}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card-hover)] hover:bg-[var(--border)] transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  <span
                    className={`badge ${
                      item.dir === "ko-fr" ? "badge-ko" : "badge-fr"
                    }`}
                  >
                    {item.dir === "ko-fr" ? "KO→FR" : "FR→KO"}
                  </span>

                  <Link
                    href={`/word/${encodeURIComponent(item.q)}?dir=${item.dir}`}
                    className="link-accent font-medium text-lg flex-1"
                  >
                    {item.q}
                  </Link>

                  <span className="text-[var(--text-muted)] text-sm">
                    {new Date(item.at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <button
                    onClick={() => removeItem(idx)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="text-center text-sm text-[var(--text-muted)] pt-4">
          <p>Source : KRDict – CC BY-SA 2.0 KR</p>
        </footer>
      </div>
    </main>
  );
}
