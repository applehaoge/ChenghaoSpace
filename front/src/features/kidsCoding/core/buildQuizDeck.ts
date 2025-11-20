import type { QuizQuestion } from '@/features/kidsCoding/data/lessons';

const QUIZ_TYPE_ORDER: QuizQuestion['type'][] = ['single-choice', 'fill-blank', 'matching', 'short-answer'];

export function buildQuizDeck(questions: QuizQuestion[], limit = 3): QuizQuestion[] {
  if (!questions.length || limit <= 0) {
    return [];
  }

  const grouped = groupByType(questions);
  const availableTypes = Object.keys(grouped) as QuizQuestion['type'][];
  if (!availableTypes.length) {
    return questions.slice(0, limit);
  }

  const uniquePickCount = Math.min(limit, availableTypes.length);
  const selectedTypes = shuffleArray(availableTypes).slice(0, uniquePickCount);
  const selected = selectedTypes
    .map(type => pickRandom(grouped[type]))
    .filter((question): question is QuizQuestion => Boolean(question));

  if (selected.length < Math.min(limit, questions.length)) {
    fillWithRemaining(selected, questions, limit);
  }

  return selected.sort((a, b) => typeOrderIndex(a.type) - typeOrderIndex(b.type));
}

function groupByType(questions: QuizQuestion[]) {
  return questions.reduce<Record<QuizQuestion['type'], QuizQuestion[]>>((acc, question) => {
    if (!acc[question.type]) {
      acc[question.type] = [];
    }
    acc[question.type].push(question);
    return acc;
  }, {} as Record<QuizQuestion['type'], QuizQuestion[]>);
}

function fillWithRemaining(deck: QuizQuestion[], questions: QuizQuestion[], limit: number) {
  const remaining = questions.filter(question => !deck.includes(question));
  const maxDeckSize = Math.min(limit, questions.length);
  while (deck.length < maxDeckSize && remaining.length) {
    const candidate = pickRandom(remaining);
    if (!candidate) {
      break;
    }
    deck.push(candidate);
    remaining.splice(remaining.indexOf(candidate), 1);
  }
}

function pickRandom<T>(list: T[]): T | null {
  if (!list.length) {
    return null;
  }
  const index = Math.floor(Math.random() * list.length);
  return list[index] ?? null;
}

function shuffleArray<T>(input: T[]): T[] {
  const clone = [...input];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function typeOrderIndex(type: QuizQuestion['type']) {
  const index = QUIZ_TYPE_ORDER.indexOf(type);
  return index === -1 ? QUIZ_TYPE_ORDER.length : index;
}
