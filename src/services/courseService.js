import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { SEED_COURSES, SEED_QUIZZES } from '../data/seedData';

const courseCollection = collection(db, 'courses');

function fromSnapshot(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getAllCourses({ includeDrafts = false } = {}) {
  const source = includeDrafts
    ? courseCollection
    : query(courseCollection, where('status', '==', 'published'));
  const snapshot = await getDocs(source);
  return snapshot.docs.map(fromSnapshot).sort((a, b) => a.title.localeCompare(b.title));
}

export async function getCourseById(courseId) {
  const snapshot = await getDoc(doc(db, 'courses', courseId));
  return snapshot.exists() ? fromSnapshot(snapshot) : null;
}

export async function createCourse(courseData) {
  const now = new Date().toISOString();
  const { id: ignoredId, ...data } = courseData;
  const reference = await addDoc(courseCollection, { ...data, createdAt: now, updatedAt: now });
  return { ...data, id: reference.id, createdAt: now, updatedAt: now };
}

export async function updateCourse(courseId, updates) {
  const { id: ignoredId, createdAt, ...data } = updates;
  const updated = { ...data, ...(createdAt ? { createdAt } : {}), updatedAt: new Date().toISOString() };
  await updateDoc(doc(db, 'courses', courseId), updated);
  return { ...updates, ...updated, id: courseId };
}

export function setCourseStatus(courseId, status) {
  return updateCourse(courseId, { status });
}

export async function deleteCourse(courseId) {
  const course = await getCourseById(courseId);
  if (!course) return;

  const batch = writeBatch(db);
  batch.delete(doc(db, 'courses', courseId));

  const quizIds = (course.units || []).flatMap((unit) =>
    (unit.lessons || []).map((lesson) => lesson.quizId).filter(Boolean)
  );
  quizIds.forEach((quizId) => batch.delete(doc(db, 'quizzes', quizId)));

  const progressSnapshot = await getDocs(query(collection(db, 'progress'), where('courseId', '==', courseId)));
  progressSnapshot.forEach((progressDoc) => batch.delete(progressDoc.ref));
  await batch.commit();
}

export async function seedStarterContent() {
  const existing = await getDocs(courseCollection);
  if (!existing.empty) throw new Error('Starter content can only be added when there are no courses.');

  const batch = writeBatch(db);
  SEED_COURSES.forEach(({ id, ...course }) => batch.set(doc(db, 'courses', id), course));
  SEED_QUIZZES.forEach(({ id, ...quiz }) => batch.set(doc(db, 'quizzes', id), quiz));
  await batch.commit();
}
