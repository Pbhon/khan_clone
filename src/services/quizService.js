import { readCollection, writeCollection, DB_KEYS, initDb } from './localDb';
import { generateId } from '../utils/idGenerator';
import { sampleQuestions } from '../utils/quizUtils';

/**
 * Quiz CRUD, plus sampling a fresh set of questions for a new attempt.
 * A quiz holds its FULL question bank; `questionsPerAttempt` controls how
 * many of those get pulled for any single attempt (including retakes),
 * which is what makes retaking a quiz show different questions.
 */

initDb();

function getQuizzes() {
  return readCollection(DB_KEYS.QUIZZES) || [];
}

function saveQuizzes(quizzes) {
  writeCollection(DB_KEYS.QUIZZES, quizzes);
}

export function getAllQuizzes() {
  return getQuizzes();
}

export function getQuizById(quizId) {
  return getQuizzes().find((q) => q.id === quizId) || null;
}

export function createQuiz(quizData) {
  const quizzes = getQuizzes();
  const newQuiz = { ...quizData, id: generateId('quiz') };
  saveQuizzes([...quizzes, newQuiz]);
  return newQuiz;
}

export function updateQuiz(quizId, updates) {
  const quizzes = getQuizzes();
  const index = quizzes.findIndex((q) => q.id === quizId);
  if (index === -1) throw new Error(`No quiz found with id ${quizId}`);
  const updated = { ...quizzes[index], ...updates, id: quizId };
  quizzes[index] = updated;
  saveQuizzes(quizzes);
  return updated;
}

export function deleteQuiz(quizId) {
  saveQuizzes(getQuizzes().filter((q) => q.id !== quizId));
}

/**
 * Randomly samples `questionsPerAttempt` questions from the quiz's bank.
 * Call this fresh every time a student starts or retakes a quiz.
 */
export function generateAttemptQuestions(quiz) {
  if (!quiz || !quiz.questions?.length) return [];
  return sampleQuestions(quiz.questions, quiz.questionsPerAttempt);
}
