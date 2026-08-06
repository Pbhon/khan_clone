/**
 * Fisher-Yates shuffle. Don't swap this for `array.sort(() => Math.random() - 0.5)`
 * — that's a well-known biased shuffle and will make some questions show up
 * far more often than others.
 */
export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pulls `count` random questions from a quiz's full question bank. This is
 * what makes retakes feel different each time — the bank can hold far more
 * questions than any single attempt uses.
 */
export function sampleQuestions(questionBank = [], count = 5) {
  const shuffled = shuffleArray(questionBank);
  return shuffled.slice(0, Math.min(count, questionBank.length));
}

/**
 * Scores an attempt. Only first-try answers count toward the score — getting
 * it right on the second attempt (after a miss) still teaches the material
 * and still resolves the question, but shouldn't inflate the grade the same
 * way a clean first-try answer does.
 */
export function calculateScore(results = []) {
  const total = results.length;
  const correct = results.filter((r) => r.correctOnFirstTry).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent };
}
