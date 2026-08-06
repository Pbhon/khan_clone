import { SEED_USERS, SEED_COURSES, SEED_QUIZZES, SEED_AWARDS_CATALOG } from '../data/seedData';

/**
 * ============================================================================
 * MOCK DATABASE LAYER
 * ============================================================================
 * Everything below simulates a backend database using localStorage, so the
 * app is fully functional the moment you run it — no server required yet.
 *
 * WHEN YOU'RE READY FOR FIREBASE:
 * Every other service file (authService, courseService, quizService,
 * progressService, awardsService) only talks to the database through the
 * four functions exported here: readCollection, writeCollection, initDb,
 * and DB_KEYS. You don't need to rewrite this file directly — instead, go
 * into each service file and replace its calls to readCollection/
 * writeCollection with the matching Firestore calls (getDocs/setDoc/
 * updateDoc/deleteDoc). The function SIGNATURES in those files
 * (e.g. `getCourseById(id)`, `enrollInCourse(userId, courseId)`) are
 * intentionally identical to what you'd want from a Firestore-backed
 * version, so nothing in your components (pages/, context/) needs to
 * change at all. See README.md for a worked example.
 * ============================================================================
 */

export const DB_KEYS = {
  USERS: 'learnhub_users',
  COURSES: 'learnhub_courses',
  QUIZZES: 'learnhub_quizzes',
  PROGRESS: 'learnhub_progress',
  AWARDS_CATALOG: 'learnhub_awardsCatalog',
  USER_AWARDS: 'learnhub_userAwards',
  SESSION: 'learnhub_session',
};

export function readCollection(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`[learnhub] Failed to read "${key}" from storage`, error);
    return null;
  }
}

export function writeCollection(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`[learnhub] Failed to write "${key}" to storage`, error);
    return false;
  }
}

/**
 * Seeds initial data on first run only. Existing data is never overwritten —
 * once you (or a student) have created real accounts/courses, seeding will
 * leave them alone.
 */
export function initDb() {
  if (typeof window === 'undefined') return;

  if (readCollection(DB_KEYS.USERS) === null) {
    writeCollection(DB_KEYS.USERS, SEED_USERS);
  }
  if (readCollection(DB_KEYS.COURSES) === null) {
    writeCollection(DB_KEYS.COURSES, SEED_COURSES);
  }
  if (readCollection(DB_KEYS.QUIZZES) === null) {
    writeCollection(DB_KEYS.QUIZZES, SEED_QUIZZES);
  }
  if (readCollection(DB_KEYS.PROGRESS) === null) {
    writeCollection(DB_KEYS.PROGRESS, []);
  }
  if (readCollection(DB_KEYS.AWARDS_CATALOG) === null) {
    writeCollection(DB_KEYS.AWARDS_CATALOG, SEED_AWARDS_CATALOG);
  }
  if (readCollection(DB_KEYS.USER_AWARDS) === null) {
    writeCollection(DB_KEYS.USER_AWARDS, []);
  }
}

/** Wipes every LearnHub key from localStorage and re-seeds from scratch. */
export function resetDb() {
  Object.values(DB_KEYS).forEach((key) => localStorage.removeItem(key));
  initDb();
}

if (typeof window !== 'undefined') {
  // Handy during local dev: run `resetLearnHub()` in the browser console
  // to wipe all progress/accounts/courses and start over from seed data.
  window.resetLearnHub = resetDb;
}
