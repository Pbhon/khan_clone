/**
 * Shared helpers for turning a course's structure + a student's
 * lesson-completion map into progress numbers and "what's next" info.
 * Keeping this logic in one place means the dashboard, the course page,
 * and the progress service all agree on what "62% complete" means.
 */

/** Flattens a course's units into a single ordered list of lessons. */
export function getAllLessons(course) {
  if (!course?.units) return [];
  return course.units.flatMap((unit) => unit.lessons || []);
}

export function getTotalLessonsCount(course) {
  return getAllLessons(course).length;
}

export function getCompletedLessonsCount(course, lessonCompletion = {}) {
  return getAllLessons(course).filter((lesson) => lessonCompletion[lesson.id]).length;
}

export function calculatePercentComplete(course, lessonCompletion = {}) {
  const total = getTotalLessonsCount(course);
  if (total === 0) return 0;
  const completed = getCompletedLessonsCount(course, lessonCompletion);
  return Math.round((completed / total) * 100);
}

/**
 * Finds the first lesson (in course order) the student hasn't completed
 * yet, so "Continue" can jump straight back to where they left off
 * instead of dropping them on the course overview every time.
 */
export function findNextIncompleteLesson(course, lessonCompletion = {}) {
  const lessons = getAllLessons(course);
  return lessons.find((lesson) => !lessonCompletion[lesson.id]) || null;
}
