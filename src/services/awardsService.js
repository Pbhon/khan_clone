import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { SEED_AWARDS_CATALOG } from '../data/seedData';
import { evaluateAwards } from '../utils/awardsEngine';
import { getProgressForUser } from './progressService';

export function getAwardsCatalog() {
  return SEED_AWARDS_CATALOG;
}

export async function getUserAwards(userId) {
  const snapshot = await getDocs(query(collection(db, 'userAwards'), where('userId', '==', userId)));
  return snapshot.docs.map((awardDoc) => ({ id: awardDoc.id, ...awardDoc.data() }));
}

export async function checkAndGrantAwards(userId) {
  const [earned, progress] = await Promise.all([getUserAwards(userId), getProgressForUser(userId)]);
  const earnedIds = new Set(earned.map((record) => record.awardId));
  const qualifying = evaluateAwards(SEED_AWARDS_CATALOG, { allProgress: progress });
  const newlyEarned = qualifying.filter((award) => !earnedIds.has(award.id));

  await Promise.all(
    newlyEarned.map((award) =>
      setDoc(doc(db, 'userAwards', `${userId}__${award.id}`), {
        userId,
        awardId: award.id,
        earnedAt: new Date().toISOString(),
      })
    )
  );
  return newlyEarned;
}
