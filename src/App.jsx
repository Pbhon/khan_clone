import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import LessonView from './pages/LessonView';
import QuizPage from './pages/QuizPage';
import AwardsPage from './pages/AwardsPage';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourseEditor from './pages/admin/AdminCourseEditor';
import AdminQuizEditor from './pages/admin/AdminQuizEditor';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
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
          </main>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
