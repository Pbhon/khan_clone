import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as courseService from '../services/courseService';
import * as quizService from '../services/quizService';
import * as progressService from '../services/progressService';
import * as awardsService from '../services/awardsService';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { currentUser, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userAwards, setUserAwards] = useState([]);
  const [newAwardNotice, setNewAwardNotice] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const run = useCallback(async (operation) => {
    try {
      setDataError('');
      return await operation();
    } catch (error) {
      console.error('[LearnHub] Data operation failed.', error);
      setDataError(error.message || 'Something went wrong while loading data.');
      throw error;
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    if (!currentUser) {
      setCourses([]);
      return [];
    }
    const next = await courseService.getAllCourses({ includeDrafts: isAdmin });
    setCourses(next);
    return next;
  }, [currentUser, isAdmin]);

  const refreshProgress = useCallback(async () => {
    if (!currentUser || isAdmin) {
      setProgress([]);
      return [];
    }
    const next = await progressService.getProgressForUser(currentUser.uid);
    setProgress(next);
    return next;
  }, [currentUser, isAdmin]);

  const refreshAwards = useCallback(async () => {
    if (!currentUser || isAdmin) {
      setUserAwards([]);
      return [];
    }
    const next = await awardsService.getUserAwards(currentUser.uid);
    setUserAwards(next);
    return next;
  }, [currentUser, isAdmin]);

  useEffect(() => {
    let cancelled = false;
    if (!currentUser) {
      setCourses([]);
      setProgress([]);
      setUserAwards([]);
      setDataLoading(false);
      return undefined;
    }

    setDataLoading(true);
    setDataError('');
    Promise.all([refreshCourses(), refreshProgress(), refreshAwards()])
      .catch((error) => {
        if (!cancelled) setDataError(error.message || 'Could not load LearnHub data.');
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, refreshAwards, refreshCourses, refreshProgress]);

  const requireStudent = useCallback(() => {
    if (!currentUser || isAdmin) throw new Error('A student account is required for this action.');
  }, [currentUser, isAdmin]);

  const requireAdmin = useCallback(() => {
    if (!currentUser || !isAdmin) throw new Error('Only administrators can manage course content.');
  }, [currentUser, isAdmin]);

  const checkAwards = useCallback(async () => {
    requireStudent();
    const newlyEarned = await awardsService.checkAndGrantAwards(currentUser.uid);
    if (newlyEarned.length > 0) setNewAwardNotice(newlyEarned[0]);
    await refreshAwards();
  }, [currentUser, refreshAwards, requireStudent]);

  const enroll = useCallback(
    async (courseId) => {
      requireStudent();
      const record = await run(() => progressService.enrollInCourse(currentUser.uid, courseId));
      await refreshProgress();
      await checkAwards();
      return record;
    },
    [checkAwards, currentUser, refreshProgress, requireStudent, run]
  );

  const completeLesson = useCallback(
    async (courseId, lessonId) => {
      requireStudent();
      const record = await run(() => progressService.markLessonComplete(currentUser.uid, courseId, lessonId));
      await refreshProgress();
      await checkAwards();
      return record;
    },
    [checkAwards, currentUser, refreshProgress, requireStudent, run]
  );

  const submitQuizAttempt = useCallback(
    async (courseId, quizId, lessonId, attemptResult) => {
      requireStudent();
      const record = await run(() =>
        progressService.recordQuizAttempt(currentUser.uid, courseId, quizId, lessonId, attemptResult)
      );
      await refreshProgress();
      await checkAwards();
      return record;
    },
    [checkAwards, currentUser, refreshProgress, requireStudent, run]
  );

  const saveCourse = useCallback(
    async (courseData) => {
      requireAdmin();
      const saved = await run(() =>
        courseData.id ? courseService.updateCourse(courseData.id, courseData) : courseService.createCourse(courseData)
      );
      await refreshCourses();
      return saved;
    },
    [refreshCourses, requireAdmin, run]
  );

  const removeCourse = useCallback(
    async (courseId) => {
      requireAdmin();
      await run(() => courseService.deleteCourse(courseId));
      await refreshCourses();
    },
    [refreshCourses, requireAdmin, run]
  );

  const seedStarterContent = useCallback(async () => {
    requireAdmin();
    await run(() => courseService.seedStarterContent());
    await refreshCourses();
  }, [refreshCourses, requireAdmin, run]);

  const setCourseStatus = useCallback(
    async (courseId, status) => {
      requireAdmin();
      await run(() => courseService.setCourseStatus(courseId, status));
      await refreshCourses();
    },
    [refreshCourses, requireAdmin, run]
  );

  const saveQuiz = useCallback(
    async (quizData) => {
      requireAdmin();
      return run(() => (quizData.id ? quizService.updateQuiz(quizData.id, quizData) : quizService.createQuiz(quizData)));
    },
    [requireAdmin, run]
  );

  const removeQuiz = useCallback(
    async (quizId) => {
      requireAdmin();
      return run(() => quizService.deleteQuiz(quizId));
    },
    [requireAdmin, run]
  );

  const value = useMemo(
    () => ({
      courses,
      publishedCourses: courses.filter((course) => course.status === 'published'),
      progress,
      awardsCatalog: awardsService.getAwardsCatalog(),
      userAwards,
      newAwardNotice,
      dataLoading,
      dataError,
      clearAwardNotice: () => setNewAwardNotice(null),
      refreshCourses,
      saveCourse,
      removeCourse,
      seedStarterContent,
      setCourseStatus,
      saveQuiz,
      removeQuiz,
      getQuizById: quizService.getQuizById,
      enroll,
      completeLesson,
      submitQuizAttempt,
      getCourseProgress: (courseId) => progress.find((record) => record.courseId === courseId) || null,
    }),
    [
      completeLesson,
      courses,
      dataError,
      dataLoading,
      enroll,
      newAwardNotice,
      progress,
      refreshCourses,
      removeCourse,
      seedStarterContent,
      removeQuiz,
      saveCourse,
      saveQuiz,
      setCourseStatus,
      submitQuizAttempt,
      userAwards,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside a DataProvider');
  return context;
}
