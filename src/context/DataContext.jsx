import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as courseService from '../services/courseService';
import * as quizService from '../services/quizService';
import * as progressService from '../services/progressService';
import * as awardsService from '../services/awardsService';

const DataContext = createContext(null);

/**
 * Holds the shared app state that more than one page cares about — the
 * course list, the current student's progress, and their awards — plus the
 * action functions that mutate them. Pages that only need a single read
 * (e.g. loading one quiz to edit) can still call the services directly;
 * this context exists for state that needs to stay in sync across
 * components (the dashboard should update the moment a lesson is completed
 * elsewhere, for instance).
 */
export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userAwards, setUserAwards] = useState([]);
  const [awardsCatalog, setAwardsCatalog] = useState([]);
  const [newAwardNotice, setNewAwardNotice] = useState(null);

  const refreshCourses = useCallback(() => {
    setCourses(courseService.getAllCourses());
  }, []);

  const refreshProgress = useCallback(() => {
    setProgress(currentUser ? progressService.getProgressForUser(currentUser.uid) : []);
  }, [currentUser]);

  const refreshAwards = useCallback(() => {
    setAwardsCatalog(awardsService.getAwardsCatalog());
    setUserAwards(currentUser ? awardsService.getUserAwards(currentUser.uid) : []);
  }, [currentUser]);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  useEffect(() => {
    refreshProgress();
    refreshAwards();
  }, [currentUser, refreshProgress, refreshAwards]);

  const checkAwards = useCallback(() => {
    if (!currentUser) return;
    const newlyEarned = awardsService.checkAndGrantAwards(currentUser.uid);
    if (newlyEarned.length > 0) {
      setNewAwardNotice(newlyEarned[0]);
    }
    refreshAwards();
  }, [currentUser, refreshAwards]);

  function enroll(courseId) {
    progressService.enrollInCourse(currentUser.uid, courseId);
    refreshProgress();
    checkAwards();
  }

  function completeLesson(courseId, lessonId) {
    progressService.markLessonComplete(currentUser.uid, courseId, lessonId);
    refreshProgress();
    checkAwards();
  }

  function submitQuizAttempt(courseId, quizId, lessonId, attemptResult) {
    progressService.recordQuizAttempt(currentUser.uid, courseId, quizId, lessonId, attemptResult);
    refreshProgress();
    checkAwards();
  }

  /** Creates a new course if courseData has no id, otherwise updates it. */
  function saveCourse(courseData) {
    const saved = courseData.id
      ? courseService.updateCourse(courseData.id, courseData)
      : courseService.createCourse(courseData);
    refreshCourses();
    return saved;
  }

  function removeCourse(courseId) {
    courseService.deleteCourse(courseId);
    refreshCourses();
  }

  function setCourseStatus(courseId, status) {
    courseService.setCourseStatus(courseId, status);
    refreshCourses();
  }

  /** Creates a new quiz if quizData has no id, otherwise updates it. */
  function saveQuiz(quizData) {
    return quizData.id ? quizService.updateQuiz(quizData.id, quizData) : quizService.createQuiz(quizData);
  }

  function removeQuiz(quizId) {
    quizService.deleteQuiz(quizId);
  }

  function getCourseProgress(courseId) {
    return progress.find((p) => p.courseId === courseId) || null;
  }

  const value = {
    courses,
    publishedCourses: courses.filter((c) => c.status === 'published'),
    progress,
    awardsCatalog,
    userAwards,
    newAwardNotice,
    clearAwardNotice: () => setNewAwardNotice(null),
    refreshCourses,
    saveCourse,
    removeCourse,
    setCourseStatus,
    saveQuiz,
    removeQuiz,
    enroll,
    completeLesson,
    submitQuizAttempt,
    getCourseProgress,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside a DataProvider');
  return ctx;
}
