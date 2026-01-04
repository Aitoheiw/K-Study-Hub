import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function CreditsPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            ← Retour à la recherche
          </Link>
        </header>

        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text">
            Crédits & Licence
          </h1>
        </div>

        <section className="section-card p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            📚 Source des données
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Les définitions et informations linguistiques affichées sur ce site
            proviennent de l'API ouverte{" "}
            <span className="text-[var(--accent)] font-medium">
              한국어기초사전 (KRDict)
            </span>{" "}
            (Dictionnaire coréen de base), fournie par le{" "}
            <span className="text-[var(--accent)] font-medium">국립국어원</span>{" "}
            (Institut national de la langue coréenne).
          </p>
        </section>

        <section className="section-card p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            ⚖️ Licence
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Les contenus sont soumis à la licence{" "}
            <span className="font-medium gradient-text">
              Creative Commons Attribution – Partage dans les mêmes conditions
              2.0 Corée (CC BY-SA 2.0 KR)
            </span>
            .
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Cela signifie que tu peux réutiliser ces contenus, y compris
            commercialement, à condition de{" "}
            <strong className="text-[var(--text-primary)]">
              créditer la source
            </strong>{" "}
            et de{" "}
            <strong className="text-[var(--text-primary)]">
              partager sous la même licence
            </strong>{" "}
            en cas de redistribution ou d'adaptation.
          </p>
          <a
            href="http://ccl.cckorea.org"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent inline-block"
          >
            Voir la licence complète →
          </a>
        </section>

        <section className="section-card p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            💻 Utilisation dans ce projet
          </h2>
          <ul className="space-y-3 text-[var(--text-secondary)]">
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent)]">•</span>
              <span>
                Le site affiche des résultats de recherche à la demande.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent)]">•</span>
              <span>
                Les favoris et l'historique sont stockés localement dans le
                navigateur (localStorage) pour l'usage personnel.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent)]">•</span>
              <span>
                Le site n'a pas pour objectif de redistribuer un dataset complet
                ni de republier massivement le contenu.
              </span>
            </li>
          </ul>
        </section>

        <footer className="text-center text-sm text-zinc-200 pt-4">
          <p>Fait avec 💜 pour les apprenants du coréen</p>
        </footer>
      </div>
    </main>
  );
}
