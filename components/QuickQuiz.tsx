"use client";

import { useMemo, useState } from "react";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { HistoryItem } from "@/types/history";
import { Entry } from "@/types/krdict";

type QuizDirection = "ko-fr" | "fr-ko";

type Question = {
  question: string;
  correct: string;
  choices: string[];
  direction: QuizDirection;
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuickQuiz() {
  const { state: history, hydrated } = useLocalStorageState<HistoryItem[]>(
    "krdict:history",
    []
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    message: string;
    correct: boolean;
  } | null>(null);
  const [quizDirection, setQuizDirection] = useState<QuizDirection>("ko-fr");
  const [isLoading, setIsLoading] = useState(false);

  const recentKo = useMemo(() => {
    if (!hydrated) return [];
    return history.filter((h) => h.dir === "ko-fr").slice(0, 10);
  }, [history, hydrated]);

  const recentFr = useMemo(() => {
    if (!hydrated) return [];
    return history.filter((h) => h.dir === "fr-ko").slice(0, 10);
  }, [history, hydrated]);

  async function start() {
    setFeedback(null);
    setScore(0);
    setIdx(0);
    setIsLoading(true);

    const recent = quizDirection === "ko-fr" ? recentKo : recentFr;
    const picked = recent.slice(0, 5);

    if (picked.length < 3) {
      setFeedback({
        message: `Fais au moins 3 recherches ${
          quizDirection === "ko-fr" ? "KO→FR" : "FR→KO"
        } pour lancer le quiz.`,
        correct: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      const entriesByWord: Record<string, Entry[]> = {};

      for (const item of picked) {
        const res = await fetch(
          `/api/krdict/search?q=${encodeURIComponent(item.q)}&dir=ko-fr`
        );
        const data = await res.json();
        entriesByWord[item.q] = data.entries ?? [];
      }

      // For KO→FR: question is Korean word, answer is French translation
      // For FR→KO: question is French translation, answer is Korean word
      const allTranslations = Object.values(entriesByWord)
        .flat()
        .map((e) => ({
          ko: e.word,
          fr: e.senses?.[0]?.translation?.word || e.definition || "",
        }))
        .filter((t) => t.ko && t.fr);

      if (allTranslations.length < 3) {
        setFeedback({
          message: "Pas assez de traductions disponibles pour le quiz.",
          correct: false,
        });
        setIsLoading(false);
        return;
      }

      const qs: Question[] = picked
        .map((p) => {
          const list = entriesByWord[p.q] ?? [];
          const main = list[0];
          if (!main) return null;

          const frWord = main.senses?.[0]?.translation?.word || main.definition;
          if (!frWord) return null;

          if (quizDirection === "ko-fr") {
            // Question: Korean word, Answer: French translation
            const wrongPool = allTranslations
              .filter((t) => t.ko !== main.word)
              .map((t) => t.fr);
            const wrongs = shuffle(wrongPool).slice(0, 2);

            if (wrongs.length < 2) return null;

            return {
              question: main.word,
              correct: frWord,
              choices: shuffle([frWord, ...wrongs]),
              direction: "ko-fr" as QuizDirection,
            };
          } else {
            // Question: French translation, Answer: Korean word
            const wrongPool = allTranslations
              .filter((t) => t.fr !== frWord)
              .map((t) => t.ko);
            const wrongs = shuffle(wrongPool).slice(0, 2);

            if (wrongs.length < 2) return null;

            return {
              question: frWord,
              correct: main.word,
              choices: shuffle([main.word, ...wrongs]),
              direction: "fr-ko" as QuizDirection,
            };
          }
        })
        .filter((q): q is Question => q !== null);

      if (qs.length < 2) {
        setFeedback({
          message: "Pas assez de questions valides. Fais plus de recherches !",
          correct: false,
        });
        setIsLoading(false);
        return;
      }

      setQuestions(qs);
    } catch (error) {
      setFeedback({
        message: "Erreur lors de la génération du quiz.",
        correct: false,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function answer(choice: string) {
    const q = questions[idx];
    if (!q) return;

    const isCorrect = choice === q.correct;

    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback({ message: "✅ Bien joué !", correct: true });
    } else {
      setFeedback({
        message: `❌ La réponse était : ${q.correct}`,
        correct: false,
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setIdx((i) => i + 1);
    }, 1200);
  }

  const current = questions[idx];
  const finished = questions.length > 0 && idx >= questions.length;

  return (
    <section className="section-card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-semibold text-lg">🎯 Mini-Quiz</h2>
        <div className="flex items-center gap-3">
          <select
            value={quizDirection}
            onChange={(e) => setQuizDirection(e.target.value as QuizDirection)}
            className="select-modern"
            disabled={questions.length > 0 && !finished}
          >
            <option value="ko-fr">KO → FR</option>
            <option value="fr-ko">FR → KO</option>
          </select>
          <button
            onClick={start}
            className="btn-secondary"
            disabled={isLoading}
          >
            {isLoading ? "Chargement..." : "Lancer"}
          </button>
        </div>
      </div>

      {!hydrated && (
        <div className="space-y-2">
          <div className="skeleton h-8 w-1/2"></div>
          <div className="skeleton h-12 w-full"></div>
        </div>
      )}

      {feedback && (
        <div
          className={`p-4 rounded-xl mb-4 animate-fade-in ${
            feedback.correct
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {finished && (
        <div className="text-center py-8 animate-fade-in">
          <p className="text-4xl mb-4">
            {score === questions.length
              ? "🎉"
              : score >= questions.length / 2
              ? "👍"
              : "📚"}
          </p>
          <p className="text-xl">
            Score : <span className="gradient-text font-bold">{score}</span> /{" "}
            {questions.length}
          </p>
          <p className="text-[var(--text-muted)] mt-2">
            {score === questions.length
              ? "Parfait !"
              : score >= questions.length / 2
              ? "Bien joué !"
              : "Continue à t'entraîner !"}
          </p>
        </div>
      )}

      {current && !finished && !feedback && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span
              className={`badge ${
                current.direction === "ko-fr" ? "badge-ko" : "badge-fr"
              }`}
            >
              {current.direction === "ko-fr" ? "KO→FR" : "FR→KO"}
            </span>
            <span>
              Question {idx + 1} / {questions.length}
            </span>
          </div>

          <p className="text-2xl font-bold gradient-text">{current.question}</p>

          <div className="space-y-3">
            {current.choices.map((c, i) => (
              <button key={i} onClick={() => answer(c)} className="quiz-choice">
                {c}
              </button>
            ))}
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-4">
            Source : KRDict (CC BY-SA 2.0 KR)
          </p>
        </div>
      )}

      {!current && !finished && !isLoading && hydrated && (
        <p className="text-[var(--text-muted)] text-sm">
          Fais quelques recherches puis lance le quiz pour tester tes
          connaissances !
        </p>
      )}
    </section>
  );
}
