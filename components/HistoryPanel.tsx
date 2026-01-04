"use client";

import Link from "next/link";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { HistoryItem } from "@/types/history";

export default function HistoryPanel() {
  const {
    state: history,
    setState: setHistory,
    hydrated,
  } = useLocalStorageState<HistoryItem[]>("krdict:history", []);

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

  function clear() {
    setHistory([]);
  }

  return (
    <section className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">📜 Historique</h2>
        {history.length > 0 && (
          <button onClick={clear} className="btn-secondary text-sm">
            Effacer
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm">
          Aucune recherche récente.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.slice(0, 10).map((item, idx) => (
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
                href={`/word/${encodeURIComponent(item.q)}`}
                className="link-accent font-medium"
              >
                {item.q}
              </Link>
              <span className="text-[var(--text-muted)] text-xs ml-auto">
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
