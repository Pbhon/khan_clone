/**
 * Generates a reasonably-unique client-side ID, good enough for the mock
 * database. If you move a collection to Firestore, you can drop this and
 * use the auto-ID Firestore gives you instead (doc(collection(db, 'x')).id).
 */
export function generateId(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}
