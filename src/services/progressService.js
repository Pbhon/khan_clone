import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { calculatePercentComplete } from '../utils/progressUtils';
import { getCourseById } from './courseService';

function fromSnapshot(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getProgressForUser(userId) {
  const snapshot = await getDocs(query(collection(db, 'progress'), where('userId', '==', userId)));
  return snapshot.docs.map(fromSnapshot);
}

export async function getProgressRecord(userId, courseId) {
  const records = await getProgressForUser(userId);
  return records.find((record) => record.courseId === courseId) || null;
}

export async function enrollInCourse(userId, courseId) {
  const existing = await getProgressRecord(userId, courseId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const id = `${userId}__${courseId}`;
  const record = {
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
  await setDoc(doc(db, 'progress', id), record);
  return { ...record, id };
}

async function updateProgressRecord(record, updates) {
  const updated = { ...updates, lastAccessedAt: new Date().toISOString() };
  await updateDoc(doc(db, 'progress', record.id), updated);
  return { ...record, ...updated };
}

async function recalculateCompletion(record) {
  const course = await getCourseById(record.courseId);
  if (!course) return record;

  const percentComplete = calculatePercentComplete(course, record.lessonCompletion);
  const isComplete = percentComplete === 100;
  return updateProgressRecord(record, {
    percentComplete,
    status: isComplete ? 'completed' : 'enrolled',
    completedAt: isComplete ? record.completedAt || new Date().toISOString() : null,
  });
}

export async function markLessonComplete(userId, courseId, lessonId) {
  const record = (await getProgressRecord(userId, courseId)) || (await enrollInCourse(userId, courseId));
  const updated = await updateProgressRecord(record, {
    lessonCompletion: { ...record.lessonCompletion, [lessonId]: true },
  });
  return recalculateCompletion(updated);
}

export async function recordQuizAttempt(userId, courseId, quizId, lessonId, attemptResult) {
  let record = (await getProgressRecord(userId, courseId)) || (await enrollInCourse(userId, courseId));
  const existingAttempts = record.quizAttempts?.[quizId] || [];
  const attempt = { ...attemptResult, date: new Date().toISOString() };
  record = await updateProgressRecord(record, {
    quizAttempts: { ...record.quizAttempts, [quizId]: [...existingAttempts, attempt] },
  });

  if (attempt.passed) {
    record = await updateProgressRecord(record, {
      lessonCompletion: { ...record.lessonCompletion, [lessonId]: true },
    });
  }

  return recalculateCompletion(record);
}
