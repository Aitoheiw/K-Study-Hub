"use client";

import { Entry } from "@/types/krdict";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type Props = {
  entry: Entry;
};

export default function FavoriteButton({ entry }: Props) {
  const {
    state: favorites,
    setState: setFavorites,
    hydrated,
  } = useLocalStorageState<Entry[]>("krdict:favorites", []);

  if (!hydrated) {
    return (
      <button className="favorite-btn opacity-50" disabled>
        <span>☆</span>
      </button>
    );
  }

  const isFav = favorites.some((f) => f.targetCode === entry.targetCode);

  function toggle() {
    if (isFav) {
      setFavorites(favorites.filter((f) => f.targetCode !== entry.targetCode));
    } else {
      setFavorites([entry, ...favorites].slice(0, 200));
    }
  }

  return (
    <button
      onClick={toggle}
      className={`favorite-btn ${isFav ? "active" : ""}`}
      aria-pressed={isFav}
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <span className="text-lg" style={{ transition: "transform 0.2s" }}>
        {isFav ? "★" : "☆"}
      </span>
      <span className="text-sm hidden sm:inline">
        {isFav ? "Favori" : "Ajouter"}
      </span>
    </button>
  );
}
