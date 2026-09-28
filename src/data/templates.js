import { generateId } from '../utils/idGenerator';

/**
 * These are the canonical shapes for every piece of content in LearnHub.
 * The admin UI (AdminCourseEditor, AdminQuizEditor) builds new
 * courses/units/lessons/quizzes by calling these functions and then editing
 * the result — so the form and this file can never drift out of sync.
 *
 * If you ever want to seed content by script instead of the UI, import
 * these the same way and fill in the blanks.
 */

/** A course is the top-level thing a student enrolls in. */
export function createCourseTemplate() {
  return {
    id: null, // assigned on save
    title: '',
    description: '',
    subject: 'General',
    status: 'draft', // 'draft' | 'published' — controls student visibility
    units: [createUnitTemplate()],
    createdAt: null,
    updatedAt: null,
  };
}

/** A unit groups related lessons together within a course. */
export function createUnitTemplate() {
  return {
    id: generateId('unit'),
    title: '',
    description: '',
    lessons: [],
  };
}

/**
 * A lesson is one teaching page. `sections` is the "teaching section"
 * template you asked for — a lesson is built from one or more of these,
 * e.g. Introduction / Key Idea / Worked Example / Summary.
 */
export function createLessonTemplate() {
  return {
    id: generateId('lesson'),
    title: '',
    sections: [createSectionTemplate()],
    quizId: null, // set once a quiz is attached
  };
}

export function createSectionTemplate() {
  return {
    heading: '',
    body: '',
  };
}

/**
 * A quiz belongs to one lesson and holds the FULL question bank for that
 * lesson. `questionsPerAttempt` is how many of those questions get sampled
 * each time a student takes (or retakes) it.
 */
export function createQuizTemplate({ lessonId = null, courseId = null } = {}) {
  return {
    id: null, // assigned on save
    lessonId,
    courseId,
    title: '',
    questionsPerAttempt: 5,
    passingScorePercent: 70,
    questions: [],
  };
}

/** A single multiple-choice question in a quiz's bank. */
export function createQuestionTemplate() {
  return {
    id: generateId('q'),
    prompt: '',
    choices: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
  };
}
