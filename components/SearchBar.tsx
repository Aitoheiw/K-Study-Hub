"use client";

import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const isValid = trimmed.length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSearch(trimmed);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Rechercher un mot (min. 2 caractères)..."
            className="input-modern pl-12"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="btn-primary whitespace-nowrap"
        >
          Rechercher
        </button>
      </form>

      {!isValid && trimmed.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] animate-fade-in">
          Tape au moins 2 caractères.
        </p>
      )}
    </div>
  );
}
