import Link from "next/link";
import QuizClient from "./QuizClient";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Quiz Aléatoire | K-Study Hub",
  description: "Testez vos connaissances en coréen avec des quiz aléatoires",
};

export default function QuizPage() {
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
            ← Retour au dictionnaire
          </Link>
        </header>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">
            🎯 Quiz Aléatoire
          </h1>
          <p className="text-[var(--text-secondary)]">
            Entraîne-toi avec du vocabulaire coréen courant
          </p>
        </div>

        <QuizClient />

        <footer className="text-center text-sm text-[var(--text-muted)] pt-8">
          <p>Source : KRDict – CC BY-SA 2.0 KR</p>
        </footer>
      </div>
    </main>
  );
}
