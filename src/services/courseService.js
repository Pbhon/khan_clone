import { readCollection, writeCollection, DB_KEYS, initDb } from './localDb';
import { generateId } from '../utils/idGenerator';

/**
 * Course CRUD. A course carries its units and lessons nested inside it as
 * arrays (see data/templates.js for the shape) — the admin editor reads and
 * writes the whole course object in one piece.
 *
 * Firestore swap: this collection maps naturally to a `courses` collection,
 * one document per course, with `units` staying as a nested array field
 * (Firestore supports arrays of objects directly — no subcollection needed
 * unless a single course ends up with hundreds of lessons).
 */

initDb();

function getCourses() {
  return readCollection(DB_KEYS.COURSES) || [];
}

function saveCourses(courses) {
  writeCollection(DB_KEYS.COURSES, courses);
}

/** All courses, draft and published — for the admin dashboard. */
export function getAllCourses() {
  return getCourses();
}

/** Only published courses — for the student-facing catalog. */
export function getPublishedCourses() {
  return getCourses().filter((c) => c.status === 'published');
}

export function getCourseById(courseId) {
  return getCourses().find((c) => c.id === courseId) || null;
}

export function createCourse(courseData) {
  const courses = getCourses();
  const now = new Date().toISOString();
  const newCourse = {
    ...courseData,
    id: generateId('course'),
    createdAt: now,
    updatedAt: now,
  };
  saveCourses([...courses, newCourse]);
  return newCourse;
}

export function updateCourse(courseId, updates) {
  const courses = getCourses();
  const index = courses.findIndex((c) => c.id === courseId);
  if (index === -1) throw new Error(`No course found with id ${courseId}`);
  const updated = { ...courses[index], ...updates, id: courseId, updatedAt: new Date().toISOString() };
  courses[index] = updated;
  saveCourses(courses);
  return updated;
}

export function setCourseStatus(courseId, status) {
  return updateCourse(courseId, { status });
}

/**
 * Deletes a course and cascades: removes any quizzes attached to its
 * lessons and any student progress records for it, so nothing orphaned is
 * left behind in the other collections.
 */
export function deleteCourse(courseId) {
  const course = getCourseById(courseId);
  if (!course) return;

  const quizIds = course.units.flatMap((u) => u.lessons.map((l) => l.quizId).filter(Boolean));

  saveCourses(getCourses().filter((c) => c.id !== courseId));

  if (quizIds.length > 0) {
    const quizzes = readCollection(DB_KEYS.QUIZZES) || [];
    writeCollection(
      DB_KEYS.QUIZZES,
      quizzes.filter((q) => !quizIds.includes(q.id))
    );
  }

  const progress = readCollection(DB_KEYS.PROGRESS) || [];
  writeCollection(
    DB_KEYS.PROGRESS,
    progress.filter((p) => p.courseId !== courseId)
  );
}
