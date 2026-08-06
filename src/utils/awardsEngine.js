/**
 * Award rules. Each key maps to a function that looks at everything a
 * student has done so far and returns true/false for "has this been earned."
 *
 * `ctx` shape:
 *   {
 *     allProgress: ProgressRecord[]   // every course this student has touched
 *   }
 *
 * To add a new award: add a rule function here, then add a matching catalog
 * entry (same key as `criteriaKey`) in data/seedData.js. No other file needs
 * to change.
 */
export const AWARD_RULES = {
  first_enrollment: (ctx) => ctx.allProgress.length >= 1,

  first_lesson_complete: (ctx) =>
    ctx.allProgress.some((p) => Object.values(p.lessonCompletion || {}).some(Boolean)),

  first_course_complete: (ctx) => ctx.allProgress.some((p) => p.status === 'completed'),

  courses_completed_3: (ctx) =>
    ctx.allProgress.filter((p) => p.status === 'completed').length >= 3,

  quiz_perfect_score: (ctx) =>
    ctx.allProgress.some((p) =>
      Object.values(p.quizAttempts || {}).some((attempts) =>
        attempts.some((a) => a.percent === 100)
      )
    ),

  lessons_completed_10: (ctx) => {
    const total = ctx.allProgress.reduce(
      (sum, p) => sum + Object.values(p.lessonCompletion || {}).filter(Boolean).length,
      0
    );
    return total >= 10;
  },

  quiz_comeback: (ctx) =>
    ctx.allProgress.some((p) =>
      Object.values(p.quizAttempts || {}).some((attempts) => {
        if (attempts.length < 2) return false;
        const first = attempts[0].percent;
        const latest = attempts[attempts.length - 1].percent;
        return latest > first;
      })
    ),
};

/** Returns the subset of a catalog whose rule currently evaluates true. */
export function evaluateAwards(catalog, ctx) {
  return catalog.filter((award) => {
    const rule = AWARD_RULES[award.criteriaKey];
    return typeof rule === 'function' && rule(ctx);
  });
}
