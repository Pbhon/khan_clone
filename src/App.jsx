import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const CourseCatalog = lazy(() => import('./pages/CourseCatalog'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const LessonView = lazy(() => import('./pages/LessonView'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const AwardsPage = lazy(() => import('./pages/AwardsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCourseEditor = lazy(() => import('./pages/admin/AdminCourseEditor'));
const AdminQuizEditor = lazy(() => import('./pages/admin/AdminQuizEditor'));

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Suspense fallback={<div className="page"><p className="text-muted">Loading…</p></div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CourseCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <CourseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/lessons/:lessonId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <LessonView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/lessons/:lessonId/quiz"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/awards"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AwardsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/new"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCourseEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses/:courseId/edit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCourseEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/quizzes/:quizId"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminQuizEditor />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
