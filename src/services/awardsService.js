import { readCollection, writeCollection, DB_KEYS, initDb } from './localDb';
import { getProgressForUser } from './progressService';
import { evaluateAwards } from '../utils/awardsEngine';

/**
 * Awards catalog + the logic that checks a student's progress against it
 * and grants anything newly earned. The catalog itself lives in seed data
 * for now (edit src/data/seedData.js to add/change badges) — see the README
 * if you'd like to give admins a UI for this too, the same pattern as
 * courses/quizzes would apply cleanly.
 */

initDb();

export function getAwardsCatalog() {
  return readCollection(DB_KEYS.AWARDS_CATALOG) || [];
}

function getAllUserAwards() {
  return readCollection(DB_KEYS.USER_AWARDS) || [];
}

function saveAllUserAwards(userAwards) {
  writeCollection(DB_KEYS.USER_AWARDS, userAwards);
}

export function getUserAwards(userId) {
  return getAllUserAwards().filter((ua) => ua.userId === userId);
}

/**
 * Evaluates every award in the catalog against the student's current
 * progress and grants any that are newly earned. Returns just the
 * newly-granted awards so the UI can show a "you earned a badge!" moment
 * without re-showing ones they already have.
 */
export function checkAndGrantAwards(userId) {
  const catalog = getAwardsCatalog();
  const earnedAlready = new Set(getUserAwards(userId).map((ua) => ua.awardId));
  const allProgress = getProgressForUser(userId);

  const qualifying = evaluateAwards(catalog, { allProgress });
  const newlyEarned = qualifying.filter((award) => !earnedAlready.has(award.id));

  if (newlyEarned.length > 0) {
    const now = new Date().toISOString();
    const newRecords = newlyEarned.map((award) => ({ userId, awardId: award.id, earnedAt: now }));
    saveAllUserAwards([...getAllUserAwards(), ...newRecords]);
  }

  return newlyEarned;
}
