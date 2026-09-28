import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { sampleQuestions } from '../utils/quizUtils';

export async function getQuizById(quizId) {
  const snapshot = await getDoc(doc(db, 'quizzes', quizId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function createQuiz(quizData) {
  const { id: ignoredId, ...data } = quizData;
  const reference = await addDoc(collection(db, 'quizzes'), data);
  return { ...data, id: reference.id };
}

export async function updateQuiz(quizId, updates) {
  const { id: ignoredId, ...data } = updates;
  await updateDoc(doc(db, 'quizzes', quizId), data);
  return { ...data, id: quizId };
}

export function deleteQuiz(quizId) {
  return deleteDoc(doc(db, 'quizzes', quizId));
}

export function generateAttemptQuestions(quiz) {
  if (!quiz?.questions?.length) return [];
  return sampleQuestions(quiz.questions, quiz.questionsPerAttempt);
}
