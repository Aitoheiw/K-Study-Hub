import Link from "next/link";
import FavoritesClient from "./FavoritesClient";
import ThemeToggle from "@/components/ThemeToggle";

export default function FavoritesPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc200 hover:text-[var(--accent)] transition-colors"
          >
            ← Retour à la recherche
          </Link>
        </header>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">★ Favoris</h1>
          <p className="text-[var(--text-secondary)]">
            Tes mots enregistrés pour révision
          </p>
        </div>

        <FavoritesClient />

        <footer className="text-center text-sm text-[var(--text-muted)] pt-8">
          <Link href="/credits" className="link-accent">
            Crédits
          </Link>
        </footer>
      </div>
    </main>
  );
}
