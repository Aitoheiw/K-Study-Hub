"use client";

import Link from "next/link";
import { HistoryItem } from "@/types/history";

type HistoryPanelProps = {
  history: HistoryItem[];
  setHistory: (history: HistoryItem[]) => void;
  hydrated: boolean;
};

export default function HistoryPanel({
  history,
  setHistory,
  hydrated,
}: HistoryPanelProps) {
  if (!hydrated) {
    return (
      <section className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">📜 Historique</h2>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-6 w-3/4"></div>
          <div className="skeleton h-6 w-1/2"></div>
        </div>
      </section>
    );
  }

  function removeItem(index: number) {
    const next = history.filter((_, i) => i !== index);
    setHistory(next);
  }

  // Only show last 5 items on homepage
  const displayedHistory = history.slice(0, 5);
  const hasMore = history.length > 5;

  return (
    <section className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">📜 Historique</h2>
        {history.length > 0 && (
          <Link href="/history" className="btn-secondary text-sm">
            Voir tout ({history.length})
          </Link>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm">
          Aucune recherche récente.
        </p>
      ) : (
        <ul className="space-y-2">
          {displayedHistory.map((item, idx) => (
            <li
              key={`${item.at}-${idx}`}
              className="flex items-center gap-3 text-sm animate-fade-in"
              style={{ animationDelay: `${idx * 30}ms` }}
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
                className="link-accent font-medium"
              >
                {item.q}
              </Link>
              <button
                onClick={() => removeItem(idx)}
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors ml-auto"
                title="Supprimer"
              >
                ✕
              </button>
              <span className="text-[var(--text-muted)] text-xs">
                {new Date(item.at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
