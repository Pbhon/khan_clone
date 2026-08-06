import { readCollection, writeCollection, DB_KEYS, initDb } from './localDb';
import { generateId } from '../utils/idGenerator';
import { calculatePercentComplete } from '../utils/progressUtils';
import { getCourseById } from './courseService';

/**
 * One progress record per (student, course) pair. This is what powers the
 * dashboard's progress bars and "continue where you left off" — and what
 * the awards engine reads to decide what a student has earned.
 */

initDb();

function getAllProgress() {
  return readCollection(DB_KEYS.PROGRESS) || [];
}

function saveAllProgress(progress) {
  writeCollection(DB_KEYS.PROGRESS, progress);
}

export function getProgressForUser(userId) {
  return getAllProgress().filter((p) => p.userId === userId);
}

export function getProgressRecord(userId, courseId) {
  return getAllProgress().find((p) => p.userId === userId && p.courseId === courseId) || null;
}

/** Enrolls a student in a course. Safe to call again — it's a no-op if already enrolled. */
export function enrollInCourse(userId, courseId) {
  const existing = getProgressRecord(userId, courseId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record = {
    id: generateId('progress'),
    userId,
    courseId,
    status: 'enrolled',
    lessonCompletion: {},
    quizAttempts: {},
    percentComplete: 0,
    enrolledAt: now,
    lastAccessedAt: now,
    completedAt: null,
  };
  saveAllProgress([...getAllProgress(), record]);
  return record;
}

function updateProgressRecord(userId, courseId, updates) {
  const all = getAllProgress();
  const index = all.findIndex((p) => p.userId === userId && p.courseId === courseId);
  if (index === -1) throw new Error('No progress record found — is the student enrolled?');
  const updated = { ...all[index], ...updates, lastAccessedAt: new Date().toISOString() };
  all[index] = updated;
  saveAllProgress(all);
  return updated;
}

function recalculateCompletion(userId, courseId) {
  const course = getCourseById(courseId);
  const record = getProgressRecord(userId, courseId);
  if (!course || !record) return record;

  const percentComplete = calculatePercentComplete(course, record.lessonCompletion);
  const isNowComplete = percentComplete === 100;
  return updateProgressRecord(userId, courseId, {
    percentComplete,
    status: isNowComplete ? 'completed' : 'enrolled',
    completedAt: isNowComplete ? record.completedAt || new Date().toISOString() : null,
  });
}

/** Marks a lesson complete (used directly for lessons with no quiz). */
export function markLessonComplete(userId, courseId, lessonId) {
  const record = getProgressRecord(userId, courseId) || enrollInCourse(userId, courseId);
  updateProgressRecord(userId, courseId, {
    lessonCompletion: { ...record.lessonCompletion, [lessonId]: true },
  });
  return recalculateCompletion(userId, courseId);
}

/**
 * Records the result of a quiz attempt. If the score meets the quiz's
 * passing threshold, the associated lesson is marked complete the same way
 * a no-quiz lesson would be — a quiz that isn't passed yet leaves the
 * lesson open so the student knows to retake it.
 */
export function recordQuizAttempt(userId, courseId, quizId, lessonId, attemptResult) {
  const record = getProgressRecord(userId, courseId) || enrollInCourse(userId, courseId);
  const existingAttempts = record.quizAttempts[quizId] || [];
  const attempt = {
    ...attemptResult, // { correct, total, percent, passed }
    date: new Date().toISOString(),
  };
  const updatedAttempts = { ...record.quizAttempts, [quizId]: [...existingAttempts, attempt] };

  updateProgressRecord(userId, courseId, { quizAttempts: updatedAttempts });

  if (attempt.passed) {
    const latest = getProgressRecord(userId, courseId);
    updateProgressRecord(userId, courseId, {
      lessonCompletion: { ...latest.lessonCompletion, [lessonId]: true },
    });
  }

  return recalculateCompletion(userId, courseId);
}
