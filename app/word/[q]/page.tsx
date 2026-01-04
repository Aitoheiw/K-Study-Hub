import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import ThemeToggle from "@/components/ThemeToggle";
import { Entry, Sense } from "@/types/krdict";
import { headers } from "next/headers";

type Direction = "ko-fr" | "fr-ko";

async function fetchWord(q: string, dir: Direction): Promise<Entry[] | null> {
  try {
    // Get the host from request headers - works on all deployments
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    console.log(
      `Fetching word from: ${baseUrl}/api/krdict/search?q=${q}&dir=${dir}`
    );

    const res = await fetch(
      `${baseUrl}/api/krdict/search?q=${encodeURIComponent(q)}&dir=${dir}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.entries as Entry[];
  } catch (error) {
    console.error("Error fetching word:", error);
    return null;
  }
}

export default async function WordPage(props: {
  params: Promise<{ q: string }>;
  searchParams: Promise<{ dir?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const decodedWord = decodeURIComponent(params.q);
  const direction: Direction = searchParams.dir === "fr-ko" ? "fr-ko" : "ko-fr";
  const entries = await fetchWord(decodedWord, direction);

  if (!entries || entries.length === 0) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
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

          <div className="section-card p-6 text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">{decodedWord}</h1>
            <p className="text-[var(--text-secondary)]">
              Aucun résultat trouvé pour ce mot.
            </p>
            <p className="text-[var(--text-muted)] text-sm">
              Essaie de rechercher ce mot depuis la page d'accueil.
            </p>
            <Link href="/" className="btn-primary inline-block">
              Retour à la recherche
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const main = entries[0];
  const frTranslation = main.senses?.[0]?.translation;

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
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

        <div className="section-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold gradient-text">{main.word}</h1>
              {main.pronunciation && (
                <p className="text-[var(--text-muted)] mt-1">
                  [{main.pronunciation}]
                </p>
              )}
            </div>
            <FavoriteButton entry={main} />
          </div>

          {main.pos && (
            <span className="badge badge-ko inline-block">{main.pos}</span>
          )}

          {frTranslation?.word && (
            <p className="text-2xl text-[var(--primary-end)] font-medium">
              → {frTranslation.word}
            </p>
          )}

          {frTranslation?.definition && (
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              {frTranslation.definition}
            </p>
          )}

          {main.origin && (
            <p className="text-[var(--text-muted)]">Origine : {main.origin}</p>
          )}
        </div>

        {/* All senses */}
        {main.senses && main.senses.length > 1 && (
          <div className="section-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">📚 Tous les sens</h2>
            <ul className="space-y-4">
              {main.senses.map((sense: Sense, i: number) => (
                <li
                  key={i}
                  className="pl-4 border-l-2 border-[var(--border-accent)]"
                >
                  <p className="text-sm text-[var(--text-muted)]">
                    Sens {sense.order || i + 1}
                  </p>
                  {sense.translation?.word && (
                    <p className="text-[var(--primary-end)] font-medium">
                      {sense.translation.word}
                    </p>
                  )}
                  {sense.translation?.definition && (
                    <p className="text-[var(--text-secondary)]">
                      {sense.translation.definition}
                    </p>
                  )}
                  {sense.definition && (
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                      (KR) {sense.definition}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {main.link && (
          <a
            href={main.link}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent inline-block"
          >
            Voir la définition officielle sur KRDict →
          </a>
        )}

        <footer className="text-center text-sm text-[var(--text-muted)] pt-8">
          <p>Source : KRDict – CC BY-SA 2.0 KR</p>
          <Link href="/credits" className="link-accent">
            Crédits
          </Link>
        </footer>
      </div>
    </main>
  );
}
